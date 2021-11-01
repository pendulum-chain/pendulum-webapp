import { Keyring } from "@polkadot/api";
import { checkAddress, cryptoWaitReady } from "@polkadot/util-crypto";
import BN from "bn.js";
import PendulumApi from "./api";
import config from './config';

export default class Faucet {
    async send(address: string) {
        const polkadotApi = PendulumApi.get().getPolkadotApi();

        // Waiting for crypto library to be ready
        await cryptoWaitReady();

        const check = checkAddress(address, config.address_type);

        if (!config.mnemonic) {
            throw Error("Faucet seed missing");
        }

        console.log("Check:", check)

        if (check[0]) {
            const keyring = new Keyring({ type: "ed25519" });
            const sender = keyring.addFromUri(config.mnemonic);
            const padding = new BN(10).pow(new BN(config.decimals));
            const amount = new BN(config.amount).mul(padding);
            console.log(`Send ${config.amount} ${config.symbol} to ${address}`);
            const tx = await polkadotApi.tx.balances.transferKeepAlive(address, amount).signAndSend(sender);
            console.log("Transfer sent with hash", tx.toHex());
            return `Sent ${config.amount} ${config.symbol} to ${address} (tx ${tx.toHex()})`;
        }
        return `Invalid address! Address type ${config.address_type}, visit https://github.com/paritytech/substrate/blob/e232d78dd5bafa3bbaae9ac9db08f99e238392db/primitives/core/src/crypto.rs#L444 for reference`;
    }
};