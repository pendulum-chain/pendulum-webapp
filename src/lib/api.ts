import { ApiPromise, WsProvider } from "@polkadot/api";
import { AccountData } from "@polkadot/types/interfaces";
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
    
    private constructor(config: Record<string, any>) {
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
        let stellarSeed = "";
        if (StellarKey.isValidEd25519SecretSeed(seed)) {
            stellarSeed = seed;
            seed = u8aToHex(StellarKeyPair.fromSecret(seed).rawSecretKey());
        }
        const newPair = uiKeyring.keyring.addFromUri(seed,  { name: name || "" });
        const address = StellarKey.encodeEd25519PublicKey(decodeAddress(newPair.address) as Buffer);
        const extendedSeed = StellarKeyPair.fromRawEd25519Seed(hexToU8a(seed) as Buffer).secret();
 
        return {
            stellarSeed,
            seed: extendedSeed,
            stellar_pubkey: address,
            address_ss58: newPair.address
        }
    }

    // async listAccounts() {
    //     console.log("getAccounts", uiKeyring.getAccounts());
    //     console.log("get pairs keyring", uiKeyring.keyring.getPairs());
    //     console.log("getPairs", uiKeyring.getPairs());
    // }

    async getBalances(address: string) {
        address = "5FA9nQDVg267DEd8m1ZypXLBnvN7SFxYwV7ndqSYGiN9TTpu";
        let { data: { free, reserved, frozen } } = await this._api.query.system.account(address);
        const usdcAsset = { AlphaNum4: { code: "USDC", issuer: "GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC" }};
        const euroAsset = { AlphaNum4: { code: "EUR\0", issuer: "GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC" }};
        let usdcBalance: AccountData = await this._api.query.tokens.accounts(address, usdcAsset);
        let euroBalance: AccountData = await this._api.query.tokens.accounts(address, euroAsset);

        console.log(usdcBalance);
        return [
            {
                asset: 'USDC',
                free: '0',
                reserved: '0',
                frozen: '0',
            //   free: usdcBalance.free,
            //   reserved: usdcBalance.reserved,
            //   frozen: usdcBalance.feeFrozen,
            },
            {
                asset: 'EUR',
                free: '0',
                reserved: '0',
                frozen: '0',
            //   free: euroBalance.free,
            //   reserved: euroBalance.reserved,
            //   frozen: euroBalance.feeFrozen,
            },
            {
              asset: 'PEN',
              free: `${free}`,
              reserved: `${reserved}`,
              frozen: `${frozen}`,
            },
        ];
    }
}