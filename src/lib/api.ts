import { ApiPromise, WsProvider } from "@polkadot/api";
import uiKeyring from '@polkadot/ui-keyring';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { Keypair as StellarKeyPair, StrKey as StellarKey } from 'stellar-base';

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


let _instance: PendulumApi | undefined = undefined;

export default class PendulumApi {
    config: Record<string, any>;
    _api: any;
    
    constructor(config: Record<string, any>) {
        this.config = config;
        this._api = null;
    };

    static create(config: Record<string, any>): PendulumApi {
        _instance = new PendulumApi(config);
        return _instance;
    }

    static get(): PendulumApi {
        if (!_instance)
            throw Error("Pendulum API not started")
        
        return _instance;
    }
    
    async init() {
        const ws = new WsProvider(this.config.ws);

        // Add our custom types to the API creation
        this._api = await ApiPromise.create({ provider: ws, types: customTypes });    

        // Retrieve the chain & node information information via rpc calls
        const [chain, nodeName, nodeVersion] = await Promise.all([
            this._api.rpc.system.chain(),
            this._api.rpc.system.name(),
            this._api.rpc.system.version(),
        ]);
        console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
    };

    addAccount(seed: string, name: string) {
        if (StellarKey.isValidEd25519SecretSeed(seed)) {
            return this.addAccountFromStellarSeed(seed, name);
        } else {
            const newPair = uiKeyring.keyring.addFromUri(seed,  { name: name || "" });
            console.log(`${newPair.meta.name}: has address ${newPair.address} with publicKey [${newPair.publicKey}]`);
        }
    }

    addAccountFromStellarSeed(seed: string, name: string) {
        if (StellarKey.isValidEd25519SecretSeed(seed)) {
            seed = u8aToHex(StellarKeyPair.fromSecret(seed).rawSecretKey());
        }
        const newPair = uiKeyring.keyring.addFromUri(seed,  { name: name || "" });

        const address = StellarKey.encodeEd25519PublicKey(decodeAddress(newPair.address) as Buffer);
        const extendedSeed = StellarKeyPair.fromRawEd25519Seed(hexToU8a(seed) as Buffer).secret();
 
        console.log(`${newPair.meta.name}: seed is ${extendedSeed}, address is ${address}, pubkey [${newPair.publicKey}]`);


    }

}