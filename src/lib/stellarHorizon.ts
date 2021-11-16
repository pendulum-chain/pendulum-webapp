import { AccountResponse, Server, ServerApi } from 'stellar-sdk';

import config from './config';

export async function loadAccountIfExists(publicKey: string): Promise<AccountResponse | undefined> {
  const horizonServer = new Server(config.horizon_testnet_url);

  try {
    return await horizonServer.loadAccount(publicKey);
  } catch (error) {
    if ((error as any).message === 'accountId is invalid') {
      return;
    }

    if (
      (error as any).message === 'Request failed with status code 404' ||
      ((error as any).response && (error as any).response.status === 404)
    ) {
      // account doesn't exist
      return;
    } else {
      throw error;
    }
  }
}

export function streamBalanceEffects(
  accoundId: string,
  cursor: string,
  onEffect: (effect: ServerApi.EffectRecord) => void,
  onError: (error: any) => void
): () => void {
  const horizonServer = new Server(config.horizon_testnet_url);

  return horizonServer
    .effects()
    .forAccount(accoundId)
    .cursor(cursor) // causes many failed (cancelled) requests when no activity, see https://github.com/stellar/horizon/issues/437
    .limit(200) // this is the maximum limit horizon supports, see https://github.com/stellar/horizon/issues/438
    .stream({
      onmessage(effect) {
        onEffect(effect as unknown as ServerApi.EffectRecord);
      },
      onerror(error: any) {
        onError(error);
      }
    });
}
