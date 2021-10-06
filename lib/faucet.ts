import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { checkAddress, cryptoWaitReady } from "@polkadot/util-crypto";
import BN from "bn.js";

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

export default class Faucet {
    config: Record<string, any>;
    api: any;

    constructor(config: Record<string, any>) {
        this.config = config;
        this.api = null;
    };

    async init() {
        const ws = new WsProvider(this.config.ws);

        // Add our custom types to the API creation
        this.api = await ApiPromise.create({ provider: ws, types: customTypes });

        // Retrieve the chain & node information information via rpc calls
        const [chain, nodeName, nodeVersion] = await Promise.all([
            this.api.rpc.system.chain(),
            this.api.rpc.system.name(),
            this.api.rpc.system.version(),
        ]);
        console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
    };

    async send(address) {
        // Waiting for crypto library to be ready
        await cryptoWaitReady();

        const check = checkAddress(address, this.config.address_type);

        if (check[0]) {
            const keyring = new Keyring({ type: "ed25519" });
            const sender = keyring.addFromUri(this.config.mnemonic);
            const padding = new BN(10).pow(new BN(this.config.decimals));
            const amount = new BN(this.config.amount).mul(padding);
            console.log(`Send ${this.config.amount} ${this.config.symbol} to ${address}`);
            const tx = await this.api.tx.balances.transferKeepAlive(address, amount).signAndSend(sender);
            console.log("Transfer sent with hash", tx.toHex());
            return `Sent ${this.config.amount} ${this.config.symbol} to ${address} (tx ${tx.toHex()})`;
        }
        return `Invalid address! Address type ${this.config.address_type}, visit https://github.com/paritytech/substrate/blob/e232d78dd5bafa3bbaae9ac9db08f99e238392db/primitives/core/src/crypto.rs#L444 for reference`;
    }
};