import { AccountResponse, Server } from 'stellar-sdk';

import { loadAccountIfExists, streamBalanceEffects } from './stellarHorizon';
import config from './config';

export interface AssetBalance {
  asset: string;
  amountString: string;
}

export type StellarBalances = Record<string, string>;

export interface BalanceUpdateMessage {
  type: 'balance';
  balances: StellarBalances | undefined;
}

export interface ErrorMessage {
  type: 'error';
  error: any;
}

export interface AccountCreatedMessage {
  type: 'account';
  accountId: string;
}

export type Message = BalanceUpdateMessage | ErrorMessage | AccountCreatedMessage;

export type BalanceMessageHandler = (message: Message) => void;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function refreshAccountDueToEffect(account: AccountResponse): Promise<AccountResponse> {
  const horizon = new Server(config.horizon_testnet_url);

  for (let attempt = 0; attempt < 4; attempt++, await delay(250 * Math.pow(2, attempt))) {
    const updatedAccount = await horizon.loadAccount(account.account_id);

    // Cannot use `last_modified_ledger` property here as it changes only when this
    // account is the sender of the payment, not if it's only the recipient
    if (JSON.stringify(updatedAccount.balances) !== JSON.stringify(account.balances)) {
      console.log({ account }, `Fetched refreshed account on attempt #${attempt + 1}`);
      return updatedAccount;
    }
  }

  console.log(
    { account },
    `Tried multiple times, but only managed to fetch the account's stale data that we already had`
  );
  return account;
}

export function extractBalancesFromAccountResponse(account: AccountResponse): StellarBalances {
  const result: StellarBalances = {};

  for (const balance of account.balances) {
    if (balance.asset_type !== 'native' && balance.asset_type !== 'liquidity_pool_shares') {
      const assetString = `${balance.asset_issuer}:${balance.asset_code}`;
      result[assetString] = balance.balance;
    }
  }

  return result;
}

function makeEventSource(onBalanceMessage: BalanceMessageHandler, account: AccountResponse, existedInitially: boolean) {
  try {
    const balances: StellarBalances | undefined = existedInitially
      ? extractBalancesFromAccountResponse(account)
      : undefined;

    onBalanceMessage({ type: 'balance', balances });

    // Be aware that this implementation potentially causes race conditions, since we cannot
    // subscribe to all effects that occurred after the point in time this initial balance refers to
    return streamBalanceEffects(
      account.account_id,
      existedInitially ? 'now' : '0',
      async () => {
        try {
          const updatedAccount = await refreshAccountDueToEffect(account);
          const balances = extractBalancesFromAccountResponse(updatedAccount);
          onBalanceMessage({ type: 'balance', balances });
        } catch (error) {
          onBalanceMessage({ type: 'error', error });
        }
      },
      (error) => onBalanceMessage({ type: 'error', error })
    );
  } catch (error) {
    onBalanceMessage({ type: 'error', error });
  }
}

function startBalanceEvents(onBalanceMessage: BalanceMessageHandler, accountId: string) {
  let closeEventSource: (() => void) | undefined;
  let cancelled = false;

  function doNextAccountRequest(isFirstCall: boolean) {
    if (cancelled) {
      return;
    }

    loadAccountIfExists(accountId)
      .then((account) => {
        if (cancelled) {
          return;
        }

        if (!account) {
          if (isFirstCall) {
            onBalanceMessage({
              type: 'balance',
              balances: undefined
            });
          }
          setTimeout(doNextAccountRequest, 2000, false);
        } else {
          onBalanceMessage({ type: 'account', accountId });
          closeEventSource = makeEventSource(onBalanceMessage, account, isFirstCall);
        }
      })
      .catch((error) => console.log(error));
  }

  doNextAccountRequest(true);

  return () => {
    if (closeEventSource) {
      closeEventSource();
    }
    cancelled = true;
  };
}

export function createBalanceEmitter(onBalanceMessage: BalanceMessageHandler) {
  let stopBalanceEvents: (() => void) | undefined;

  return {
    setAccountId(newAccountId?: string) {
      if (stopBalanceEvents) {
        stopBalanceEvents();
        stopBalanceEvents = undefined;
      }

      if (newAccountId) {
        stopBalanceEvents = startBalanceEvents(onBalanceMessage, newAccountId);
      } else {
        onBalanceMessage({
          type: 'balance',
          balances: undefined
        });
      }
    }
  };
}
