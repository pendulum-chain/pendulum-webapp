import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import type { KeyringPair } from '@polkadot/keyring/types';
import { AccountData, Balance } from '@polkadot/types/interfaces/types';
import uiKeyring from '@polkadot/ui-keyring';
import { u8aToHex, hexToU8a } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import BigNumber from 'big.js';
import BN from 'bn.js';
import {
  Asset,
  BASE_FEE,
  Claimant,
  Keypair,
  Keypair as StellarKeyPair,
  Networks,
  Operation,
  StrKey as StellarKey,
  TransactionBuilder
} from 'stellar-base';
import { Server } from 'stellar-sdk';
import { BalancePair } from '../components/AMM';
import AmmABI from '../contracts/amm-metadata.json';
import { AccountKeyPairs } from '../interfaces';
import { Config } from './config';
import { AssetOrAssetCode, convertAssetToPendulumAsset, DefaultAssetsMap } from './assets';

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

export interface PendulumAssetBalance {
  asset: string;
  free: string;
  reserved: string;
  frozen: string;
}

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
      const stellaKeyPair = StellarKeyPair.fromRawEd25519Seed(hexToU8a(seed) as Buffer);

      let substrateKeys: AccountKeyPairs = {
        seed: seed,
        address: newPair.address,
        stellar_address: stellaKeyPair.publicKey(),
        stellar_seed: stellaKeyPair.secret()
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

  async bindToPenTokenBalance(address: string, callback: (newVal: PendulumAssetBalance) => void) {
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

  async bindToBalance(
    address: string,
    assetOrAssetCode: AssetOrAssetCode,
    callback: (newVal: PendulumAssetBalance) => void
  ) {
    if (assetOrAssetCode === 'PEN') {
      this.bindToPenTokenBalance(address, callback);
      return;
    }

    const asset = typeof assetOrAssetCode === 'string' ? DefaultAssetsMap[assetOrAssetCode] : assetOrAssetCode;
    if (asset === undefined) return;

    const pendulumAsset = convertAssetToPendulumAsset(assetOrAssetCode);

    let prevBalance: any = undefined;
    this._api.query.tokens.accounts(address, pendulumAsset, (curBalance: any) => {
      if (curBalance) {
        if (prevBalance === undefined || !curBalance.free.sub(prevBalance.free).isZero()) {
          prevBalance = curBalance;
          const res = {
            asset: asset.code,
            free: formatWithFactor(curBalance.free, asset.code),
            reserved: formatWithFactor(curBalance.reserved, asset.code),
            frozen: formatWithFactor(curBalance.frozen, asset.code)
          };
          callback(res);
        }
      }
    });
  }

  async getBalances(address: string): Promise<PendulumAssetBalance[]> {
    let {
      data: { free, reserved, frozen }
    } = await this._api.query.system.account(address);
    let usdcBalance = await this._api.query.tokens.accounts(address, convertAssetToPendulumAsset('USDC'));
    let euroBalance = await this._api.query.tokens.accounts(address, convertAssetToPendulumAsset('EUR'));

    console.log('usdcBalance', usdcBalance);

    const formatWithFactor = (balance: Balance, asset: string) => {
      const f = new BN(BALANCE_FACTOR);
      const bn = new BN(balance);
      const mod = bn.mod(f).toNumber();
      const res = bn.div(f).toNumber() + mod / BALANCE_FACTOR;
      return `${res.toFixed(mod ? 5 : 0)} ${asset}`;
    };

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
        free: formatWithFactor(free, 'PEN'),
        reserved: formatWithFactor(reserved, 'PEN'),
        frozen: formatWithFactor(frozen, 'PEN')
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

  getSubstrateKeypairfromStellarSecret(stellarSecret: string): KeyringPair {
    const keyring = new Keyring({ type: 'ed25519' });
    let seed = Keypair.fromSecret(stellarSecret).rawSecretKey();
    return keyring.addFromSeed(seed);
  }

  async withdrawToStellar(pair: KeyringPair, assetCode: string, issuer: string, amount: number) {
    let resultsArray: any = [];
    await this._api.tx.stellarBridge
      .withdrawToStellar(assetCode, issuer, amount)
      .signAndSend(pair, ({ events = [], status }: any) => {
        console.log(`Current status of WITHDRAW is ${status.type}`);

        if (status.isFinalized) {
          console.log(`Transaction included at blockHash ${status.asFinalized}`);
          events.forEach(({ phase, event: { data, method, section } }: any) => {
            resultsArray.push(method);
            console.log(`\t'phase is -> ${phase}
            Section is -> ${section} 
            Method is ->${method}
            Data is -> ${data}`);
          });
        }
      });

    return resultsArray;
  }

  async createClaimableDeposit(originKeypair: Keypair, amount: string, asset: Asset) {
    let server = new Server(this.config.horizon_testnet_url);

    let originAccount = await server.loadAccount(originKeypair.publicKey()).catch((err: any) => {
      console.error(`Failed to load ${origin}: ${err}`);
    });
    if (!originAccount) {
      return;
    }

    let unconditional_predicate = Claimant.predicateUnconditional();

    // Create the operation and submit it in a transaction.
    let claimableBalanceEntry = Operation.createClaimableBalance({
      claimants: [
        new Claimant(originKeypair.publicKey(), unconditional_predicate),
        new Claimant(this.config.escrow_public_key, unconditional_predicate)
      ],
      asset: asset,
      amount: amount
    });

    let tx = new TransactionBuilder(originAccount, { fee: BASE_FEE })
      .addOperation(claimableBalanceEntry)
      .setNetworkPassphrase(Networks.TESTNET)
      .setTimeout(180)
      .build();

    tx.sign(originKeypair);
    await server
      .submitTransaction(tx)
      .then((val: any) => {
        console.log('Claimable balance created!');
        // return val
      })
      .catch((err: any) => {
        console.error(`CLAIMABLE CREATION : Tx submission failed: ${err}`);
      });
  }

  async makePaymentDeposit(originKeypair: Keypair, amount: string, asset: Asset) {
    let server = new Server(this.config.horizon_testnet_url);

    let originAccount = await server.loadAccount(originKeypair.publicKey()).catch((err: any) => {
      console.error(`Failed to load ${origin}: ${err}`);
    });
    if (!originAccount) {
      return;
    }

    let paymentOperation = Operation.payment({
      destination: this.config.escrow_public_key,
      asset: asset,
      amount: amount
    });

    let tx = new TransactionBuilder(originAccount, { fee: BASE_FEE })
      .addOperation(paymentOperation)
      .setNetworkPassphrase(Networks.TESTNET)
      .setTimeout(180)
      .build();

    tx.sign(originKeypair);
    await server
      .submitTransaction(tx)
      .then((val: any) => {
        console.log('Payment Sent to Escrow account!');
        // return val
      })
      .catch((err: any) => {
        console.error(`Payment Tx submission failed: ${err}`);
      });
  }
}

export type AmmContractType = ReturnType<PendulumApi['getAMMContract']>;
