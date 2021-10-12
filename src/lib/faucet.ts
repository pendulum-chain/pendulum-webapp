import { Keyring } from "@polkadot/api";
import { checkAddress, cryptoWaitReady } from "@polkadot/util-crypto";
import BN from "bn.js";
import PolkadotApi from "./api";

export default class Faucet {
    config: Record<string, any>;
    api: any;

    constructor(config: Record<string, any>, api: PolkadotApi) {
        this.config = config;
        this.api = api;
    };

    async send(address: string) {
        // Waiting for crypto library to be ready
        await cryptoWaitReady();

        const check = checkAddress(address, this.config.address_type);

        if (check[0]) {
            const keyring = new Keyring({ type: "ed25519" });
            const sender = keyring.addFromUri(this.config.mnemonic);
            const padding = new BN(10).pow(new BN(this.config.decimals));
            const amount = new BN(this.config.amount).mul(padding);
            console.log(`Send ${this.config.amount} ${this.config.symbol} to ${address}`);
            const tx = await this.api.get().tx.balances.transferKeepAlive(address, amount).signAndSend(sender);
            console.log("Transfer sent with hash", tx.toHex());
            return `Sent ${this.config.amount} ${this.config.symbol} to ${address} (tx ${tx.toHex()})`;
        }
        return `Invalid address! Address type ${this.config.address_type}, visit https://github.com/paritytech/substrate/blob/e232d78dd5bafa3bbaae9ac9db08f99e238392db/primitives/core/src/crypto.rs#L444 for reference`;
    }
};