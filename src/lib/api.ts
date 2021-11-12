import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import type { KeyringPair } from '@polkadot/keyring/types';
import { AccountData, Balance } from '@polkadot/types/interfaces/types';
import uiKeyring from '@polkadot/ui-keyring';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import BigNumber from 'big.js';
import BN from 'bn.js';
import { Keypair as StellarKeyPair, StrKey as StellarKey } from 'stellar-base';
import { BalancePair } from '../components/AMM';
import AmmABI from '../contracts/amm-metadata.json';
import { AccountKeyPairs } from '../interfaces';
import { Config } from './config';
import { assetFilter, SupportedAssetsMap } from './assets';

export const BALANCE_FACTOR = 1000000000000;

const customTypes = {
  TokensAccountData: {
    free: 'Balance',
    frozen: 'Balance',
    reserved: 'Balance'
  },
  CurrencyId: {
    _enum: {
      Native: 'String',
      StellarNative: 'String',
      AlphaNum4: 'AlphaNum4',
      AlphaNum12: 'AlphaNum12'
    }
  },
  AlphaNum4: {
    code: '[u8; 4]',
    issuer: '[u8; 32]'
  },
  AlphaNum12: {
    code: '[u8; 12]',
    issuer: '[u8; 32]'
  },
  CurrencyIdOf: 'CurrencyId',
  Currency: 'CurrencyId',
  BalanceOf: 'Balance',
  Amount: 'i128',
  AmountOf: 'Amount',
  DepositPayload: {
    currency_id: 'CurrencyId',
    amount: 'Balance',
    destination: 'AccountId',
    signed_by: 'Public'
  }
};

const typesAlias = {
  tokens: {
    AccountData: 'TokensAccountData'
  }
};

const formatWithFactor = (balance: Balance, asset: string) => {
  const f = new BN(BALANCE_FACTOR);
  const bn = new BN(balance);
  const mod = bn.mod(f).toNumber();
  const res = bn.div(f).toNumber() + mod / BALANCE_FACTOR;
  return `${res.toFixed(mod ? 5 : 0)} ${asset}`;
};

let _instance: PendulumApi | undefined = undefined;
export default class PendulumApi {
  config: Config;
  _api: any;

  private constructor(config: Config) {
    this.config = config;
    this._api = null;
  }

  getConfig() {
    return this.config;
  }

  static create(config: Config): PendulumApi {
    _instance = new PendulumApi(config);
    return _instance;
  }

  static get(): PendulumApi {
    if (!_instance) throw Error('Pendulum API not started');

    return _instance;
  }

  getPolkadotApi() {
    return this._api;
  }

  async init() {
    const ws = new WsProvider(this.config.ws);

    // Add our custom types to the API creation
    this._api = await ApiPromise.create({
      provider: ws,
      typesAlias,
      types: customTypes
    });

    // Retrieve the chain & node information information via rpc calls
    const [chain, nodeName, nodeVersion] = await Promise.all([
      this._api.rpc.system.chain(),
      this._api.rpc.system.name(),
      this._api.rpc.system.version()
    ]);
    console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
  }

  addAccount(seed: string, name: string): AccountKeyPairs {
    if (StellarKey.isValidEd25519SecretSeed(seed)) {
      return this.addAccountFromStellarSeed(seed, name);
    } else {
      const newPair = uiKeyring.keyring.addFromUri(seed, { name: name || '' });
      let substrateKeys: AccountKeyPairs = {
        seed: seed,
        address: newPair.address
      };
      return substrateKeys;
    }
  }

  addAccountFromStellarSeed(seed: string, name: string): AccountKeyPairs {
    let stellarSeed = '';
    if (StellarKey.isValidEd25519SecretSeed(seed)) {
      stellarSeed = seed;
      seed = u8aToHex(StellarKeyPair.fromSecret(seed).rawSecretKey());
    }

    const newPair = uiKeyring.keyring.addFromUri(seed, { name: name || '' }, 'ed25519');
    const address = StellarKey.encodeEd25519PublicKey(decodeAddress(newPair.address) as Buffer);

    return {
      stellar_seed: stellarSeed,
      stellar_address: address,
      seed: seed,
      address: newPair.address
    };
  }

  async bindToPenTokenBalance(address: string, callback: (newVal: any) => void) {
    let { data: prevBalance } = await this._api.query.system.account(address);

    this._api.query.system.account(address, ({ data: curBalance }: { data: AccountData }) => {
      if (curBalance) {
        const change = curBalance.free.sub(prevBalance.free);
        if (!change.isZero()) {
          prevBalance = curBalance;
          const res = {
            asset: 'PEN',
            free: formatWithFactor(curBalance.free, 'PEN'),
            reserved: formatWithFactor(curBalance.reserved, 'PEN'),
            frozen: formatWithFactor(curBalance.miscFrozen, 'PEN')
          };
          callback(res);
        }
      }
    });
  }

  async bindToBalance(address: string, assetCode: string, callback: (newVal: any) => void) {
    if (assetCode === 'PEN') {
      this.bindToPenTokenBalance(address, callback);
    } else {
      if (SupportedAssetsMap[assetCode]) {
        let { data: prevBalance } = await this._api.query.tokens.accounts(address, assetFilter(assetCode));
        this._api.query.tokens.accounts(address, assetFilter(assetCode), ({ data: curBalance }: { data: any }) => {
          if (curBalance) {
            const change = curBalance.free.sub(prevBalance.free);
            if (!change.isZero()) {
              prevBalance = curBalance;
              const res = {
                asset: assetCode,
                free: formatWithFactor(curBalance.free, assetCode),
                reserved: formatWithFactor(curBalance.reserved, assetCode),
                frozen: formatWithFactor(curBalance.frozen, assetCode)
              };
              callback(res);
            }
          }
        });
      }
    }
  }

  async getBalances(address: string) {
    let { data: penBalance } = await this._api.query.system.account(address);
    let usdcBalance = await this._api.query.tokens.accounts(address, assetFilter('USDC'));
    let euroBalance = await this._api.query.tokens.accounts(address, assetFilter('EUR'));

    return [
      {
        asset: 'USDC',
        free: formatWithFactor(usdcBalance.free, 'USDC'),
        reserved: formatWithFactor(usdcBalance.reserved, 'USDC'),
        frozen: formatWithFactor(usdcBalance.frozen, 'USDC')
      },
      {
        asset: 'EUR',
        free: formatWithFactor(euroBalance.free, 'EUR'),
        reserved: formatWithFactor(euroBalance.reserved, 'EUR'),
        frozen: formatWithFactor(euroBalance.frozen, 'EUR')
      },
      {
        asset: 'PEN',
        free: formatWithFactor(penBalance.free, 'PEN'),
        reserved: formatWithFactor(penBalance.reserved, 'PEN'),
        frozen: formatWithFactor(penBalance.frozen, 'PEN')
      }
    ];
  }

  getAMMContract(userKeypair: KeyringPair) {
    const address = this.config.amm_address;
    const contract = new ContractPromise(this._api, AmmABI, address);

    const userAddress = userKeypair.address;
    console.log('contract', contract);

    const value = 0;
    const gasLimit = -1; // always use maximum available amount

    const getReserves = () =>
      contract.query.getReserves(userAddress, { value, gasLimit }).then((obj) => {
        if (obj.result.isOk && obj.output) {
          const stringArray = obj.output.toHuman() as string[]; // expecting array of [reserve0, reserve1]
          const stringArrayNoCommas = stringArray.map((str) => str.replace(/,/g, ''));

          const reserves: BalancePair = [BigNumber(stringArrayNoCommas[0]), BigNumber(stringArrayNoCommas[1])];
          return reserves;
        } else {
          throw obj.result.asErr;
        }
      });

    const getTotalSupply = () =>
      contract.query.totalSupply(userAddress, { value, gasLimit }).then((obj) => {
        if (obj.result.isOk && obj.output) {
          const supplyString = obj.output.toHuman() as string;
          const supplyStringNoCommas = supplyString.replace(/,/g, '');
          return BigNumber(supplyStringNoCommas);
        } else {
          throw obj.result.asErr;
        }
      });

    const getLpBalance = () =>
      contract.query.lpBalanceOf(userAddress, { value, gasLimit }, userAddress).then((obj) => {
        if (obj.result.isOk && obj.output) {
          const lpBalanceString = obj.output.toHuman() as string;
          const lpBalanceStringNoCommas = lpBalanceString.replace(/,/g, '');
          return BigNumber(lpBalanceStringNoCommas);
        } else {
          throw obj.result.asErr;
        }
      });

    const depositAsset = (amountInUnits: string, depositAsset1: boolean) => {
      const query = depositAsset1 ? contract.tx.depositAsset1 : contract.tx.depositAsset2;
      const amountInPico = BigNumber(amountInUnits).times(BALANCE_FACTOR).toFixed(0);

      return new Promise<void>((resolve, reject) =>
        query({ value, gasLimit }, amountInPico).signAndSend(userKeypair, (result) => {
          if (result.status.isFinalized) {
            // only resolve if contract events were emitted
            if ((result as any)?.contractEvents?.length > 0) {
              resolve();
            } else {
              reject(Error('Transaction was not executed successfully.'));
            }
          } else if (result.status.isDropped) {
            reject(Error('Transaction was dropped.'));
          }
        })
      );
    };

    const withdrawAsset = (amountInUnits: string) => {
      const amountInPico = BigNumber(amountInUnits).times(BALANCE_FACTOR).toFixed(0);
      return new Promise<void>((resolve, reject) =>
        contract.tx.withdraw({ value, gasLimit }, amountInPico, userAddress).signAndSend(userKeypair, (result) => {
          if (result.status.isFinalized) {
            // only resolve if contract events were emitted
            if ((result as any)?.contractEvents?.length > 0) {
              resolve();
            } else {
              reject('Transaction was not executed successfully.');
            }
          } else if (result.status.isDropped) {
            reject('Transaction was dropped.');
          }
        })
      );
    };

    const swapAsset = (amountInUnits: string, swap1For2: boolean) => {
      const query = swap1For2 ? contract.tx.swapAsset1ForAsset2 : contract.tx.swapAsset2ForAsset1;
      const amountInPico = BigNumber(amountInUnits).times(BALANCE_FACTOR).toFixed(0);

      return new Promise<void>((resolve, reject) =>
        query({ value, gasLimit }, amountInPico).signAndSend(userKeypair, (result) => {
          if (result.status.isFinalized) {
            console.log('result', result);
            console.log((result as any)?.contractEvents?.length > 0);
            // only resolve if contract events were emitted
            if ((result as any).contractEvents && (result as any).contractEvents?.length > 0) {
              console.log('resolving');
              resolve();
            } else {
              console.log('rejecting');
              reject(Error('Transaction was not executed successfully.'));
            }
          } else if (result.status.isDropped) {
            reject(Error('Transaction was dropped.'));
          }
        })
      );
    };

    return { depositAsset, withdrawAsset, getReserves, getTotalSupply, getLpBalance, swapAsset };
  }
}

export type AmmContractType = ReturnType<PendulumApi['getAMMContract']>;
