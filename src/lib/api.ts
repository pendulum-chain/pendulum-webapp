import { ApiPromise, WsProvider } from "@polkadot/api";
import uiKeyring from '@polkadot/ui-keyring';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { Keypair as StellarKeyPair, StrKey as StellarKey } from 'stellar-base';
import { SubstrateKeyPair } from "../interfaces";

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

export default class PendulumApi {
    config: Record<string, any>;
    _api: any;

    constructor(config: Record<string, any>) {
        this.config = config;
        this._api = null;
    }

    getConfig() {
        return this.config;
    }

    get() {
        return this._api;
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

    addAccount(seed: string, name: string): SubstrateKeyPair {
        if (StellarKey.isValidEd25519SecretSeed(seed)) {
            console.log("############################# VALID ED255");
            return this.addAccountFromStellarSeed(seed, name);
        } else {
            console.log("############################# INVALID ED255");
            const newPair = uiKeyring.keyring.addFromUri(seed,{ name: name || "" });
            console.log(`${newPair.meta.name}: has address ${newPair.address} with publicKey [${newPair.publicKey}]`);
            let substrateKeys: SubstrateKeyPair = {
                address: newPair.address,
                private: seed, 
                public: newPair.publicKey
            };
    
            return substrateKeys;
        }
    }

    addAccountFromStellarSeed(seed: string, name: string): SubstrateKeyPair {
        console.log("############################# ADDCOUNT FROM STELLAR ED255");
        if (StellarKey.isValidEd25519SecretSeed(seed)) {
            seed = u8aToHex(StellarKeyPair.fromSecret(seed).rawSecretKey());
        }
        const newPair = uiKeyring.keyring.addFromUri(seed,  { name: name || "" });

        const address = StellarKey.encodeEd25519PublicKey(decodeAddress(newPair.address) as Buffer);
        const extendedSeed = StellarKeyPair.fromRawEd25519Seed(hexToU8a(seed) as Buffer).secret();
        console.log(`${newPair.meta.name}: seed is ${extendedSeed}, address is ${address}, pubkey [${newPair.publicKey}]`);

        let substrateKeys: SubstrateKeyPair = {
            address: address,
            private: extendedSeed, 
            public: newPair.publicKey
        };

        return substrateKeys;
    }

}