import { ApiPromise, WsProvider } from "@polkadot/api";
import uiKeyring from "@polkadot/ui-keyring";
import { u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import { Asset, BASE_FEE, Claimant, Keypair, Keypair as StellarKeyPair, Networks, Operation, StrKey as StellarKey, TransactionBuilder } from "stellar-base";
import { AccountKeyPairs } from "../interfaces";
import BN from "bn.js";
import { Balance } from "@polkadot/types/interfaces/types";
import { usdcAsset, euroAsset } from "./assets";
import { Server } from "stellar-sdk";
import { Keyring } from '@polkadot/api';
import { stringToU8a } from '@polkadot/util'


const BALANCE_FACTOR = 1000000000000;

const customTypes = {
    TokensAccountData: {
        free: "Balance",
        frozen: "Balance",
        reserved: "Balance",
    },
    CurrencyId: {
        _enum: {
            Native: "String",
            StellarNative: "String",
            AlphaNum4: "AlphaNum4",
            AlphaNum12: "AlphaNum12",
        },
    },
    AlphaNum4: {
        code: "[u8; 4]",
        issuer: "[u8; 32]",
    },
    AlphaNum12: {
        code: "[u8; 12]",
        issuer: "[u8; 32]",
    },
    CurrencyIdOf: "CurrencyId",
    Currency: "CurrencyId",
    BalanceOf: "Balance",
    Amount: "i128",
    AmountOf: "Amount",
    DepositPayload: {
        currency_id: "CurrencyId",
        amount: "Balance",
        destination: "AccountId",
        signed_by: "Public",
    },
};

const typesAlias = {
    tokens: {
        AccountData: "TokensAccountData",
    },
};

let _instance: PendulumApi | undefined = undefined;

export default class PendulumApi {
    config: Record<string, any>;
    _api: any;

    private constructor(config: Record<string, any>) {
        this.config = config;
        this._api = null;
    }

    getConfig() {
        return this.config;
    }

    static create(config: Record<string, any>): PendulumApi {
        _instance = new PendulumApi(config);
        return _instance;
    }

    static get(): PendulumApi {
        if (!_instance) throw Error("Pendulum API not started");

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
            types: customTypes,
        });

        // Retrieve the chain & node information information via rpc calls
        const [chain, nodeName, nodeVersion] = await Promise.all([
            this._api.rpc.system.chain(),
            this._api.rpc.system.name(),
            this._api.rpc.system.version(),
        ]);
        console.log(
            `You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`
        );
    }

    async withdrawToStellar(pair: any, assetCode: string, issuer: string, amount: number) {
        let resultsArray: any = [];
        await this._api.tx
        .stellarBridge
        .withdrawToStellar(assetCode, issuer, amount)
        .signAndSend(pair, ({ events = [], status }: any) => {
          if (status.isFinalized) {
            events.forEach(( method : any) => {
                resultsArray.push(method)
            });
          }
        });
        return resultsArray;
    }

    async createClaimableDeposit(originKeypair: Keypair, amount: string, asset: Asset) {
        let server = new Server(this.config.testnet_server);

        let originAccount = await server.loadAccount(origin).catch((err: any) => {
            console.error(`Failed to load ${origin}: ${err}`)
        })
        if (!originAccount) { return }

        let unconditional_predicate = Claimant.predicateUnconditional();

        // Create the operation and submit it in a transaction.
        let claimableBalanceEntry = Operation.createClaimableBalance({
            claimants: [
                new Claimant(this.config.escrow_public_key, unconditional_predicate),
                new Claimant(originKeypair.publicKey(), unconditional_predicate)
            ],
            asset: asset,
            amount: amount,
        });

        let tx = new TransactionBuilder(originAccount, { fee: BASE_FEE })
            .addOperation(claimableBalanceEntry)
            .setNetworkPassphrase(Networks.TESTNET)
            .setTimeout(180)
            .build();

        tx.sign(originKeypair);
        await server.submitTransaction(tx).then((val: any) => {
            console.log("Claimable balance created!");
            return val

        }).catch((err: any) => {
            console.error(`CLAIMABLE CRATTION : Tx submission failed: ${err}`)
        });
    }

    addAccount(seed: string, name: string): AccountKeyPairs {
        if (StellarKey.isValidEd25519SecretSeed(seed)) {
            return this.addAccountFromStellarSeed(seed, name);
        } else {
            const newPair = uiKeyring.keyring.addFromUri(seed, { name: name || "" });
            let substrateKeys: AccountKeyPairs = {
                seed: seed,
                address: newPair.address,
            };
            return substrateKeys;
        }
    }

    addAccountFromStellarSeed(seed: string, name: string): AccountKeyPairs {
        let stellarSeed = "";
        if (StellarKey.isValidEd25519SecretSeed(seed)) {
            stellarSeed = seed;
            seed = u8aToHex(StellarKeyPair.fromSecret(seed).rawSecretKey());
        }

        const newPair = uiKeyring.keyring.addFromUri(
            seed,
            { name: name || "" },
            "ed25519"
        );
        const address = StellarKey.encodeEd25519PublicKey(
            decodeAddress(newPair.address) as Buffer
        );

        return {
            stellar_seed: stellarSeed,
            stellar_address: address,
            seed: seed,
            address: newPair.address,
        };
    }

    async getBalances(address: string) {
        let {
            data: { free, reserved, frozen },
        } = await this._api.query.system.account(address);
        let usdcBalance = await this._api.query.tokens.accounts(address, usdcAsset);
        let euroBalance = await this._api.query.tokens.accounts(address, euroAsset);

        const formatWithFactor = (balance: Balance, asset: string) => {
            const f = new BN(BALANCE_FACTOR);
            const bn = new BN(balance);
            const mod = bn.mod(f).toNumber();
            const res = bn.div(f).toNumber() + mod / BALANCE_FACTOR;
            return `${res.toFixed(mod ? 5 : 0)} ${asset}`;
        };

        return [
            {
                asset: "USDC",
                free: formatWithFactor(usdcBalance.free, "USDC"),
                reserved: formatWithFactor(usdcBalance.reserved, "USDC"),
                frozen: formatWithFactor(usdcBalance.frozen, "USDC"),
            },
            {
                asset: "EUR",
                free: formatWithFactor(euroBalance.free, "EUR"),
                reserved: formatWithFactor(euroBalance.reserved, "EUR"),
                frozen: formatWithFactor(euroBalance.frozen, "EUR"),
            },
            {
                asset: "PEN",
                free: formatWithFactor(free, "PEN"),
                reserved: formatWithFactor(reserved, "PEN"),
                frozen: formatWithFactor(frozen, "PEN"),
            },
        ];
    }

}
