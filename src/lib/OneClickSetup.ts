import Faucet from '../lib/faucet';
import config from '../lib/config';
import { Server, Keypair as StellarKeyPair, BASE_FEE, TransactionBuilder, Operation, Asset, Networks, Account, AccountResponse } from "stellar-sdk";
import { FRIEND_BOT_URL, HORIZON_TESTNET_URL, ISSUER_PUBLIC, ISSUER_SECRET, NEW_USER_MINT_TOKEN_TIMEOUT, TRUST_LINE_TIMEOUT } from "../constants";
import PendulumApi from './api';

export default class OnCLickSetup {
  server: Server;
  usdcAsset: Asset;
  euroAsset: Asset;

  constructor() {
    this.server = new Server(HORIZON_TESTNET_URL);
    this.usdcAsset = new Asset("USDC", ISSUER_PUBLIC);
    this.euroAsset = new Asset("EUR", ISSUER_PUBLIC);
  }

  createKeypair(): StellarKeyPair {
    let new_kp = StellarKeyPair.random();
    console.log('New Keypair created', new_kp.rawPublicKey);
    return new_kp;
  }

  async createAccount() {
    const keypair = this.createKeypair();
    let url = `${FRIEND_BOT_URL}${encodeURIComponent(keypair.publicKey(),)}`;
    try {
      const response = await fetch(url);

      console.log("########################### fetch URL", url)
      console.log("########################### fetch Response", response)
      await this.addTrustLine(keypair);
      await this.mintForNewUser(keypair.publicKey());

      let api = new PendulumApi(config);
      let substrateKeys = api.addAccount(keypair.secret(), keypair.publicKey());
      //faucet
      const faucet = new Faucet(api);
      let faucet_call_result= await faucet.send(substrateKeys.address);
      console.log("Faucet Sending PEN Tokens result", faucet_call_result);

    } catch (e) {
      console.error("ERROR!", e);
    }
  }

  async checkBalances(account_pub: string) {
    // the JS SDK uses promises for most actions, such as retrieving an account
    const account = await this.server.loadAccount(account_pub);
    console.log("Balances for account: " + account_pub);
    account.balances.forEach((balance) => {
      console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
    });

  }

  async addTrustLine(kp: StellarKeyPair) {
    let loaded_account: AccountResponse = await this.server.loadAccount(kp.publicKey())
    let account = new Account(loaded_account?.accountId(), loaded_account?.sequenceNumber());
    let txn = new TransactionBuilder(account, { fee: BASE_FEE })
      .addOperation(
        Operation.changeTrust({
          asset: this.usdcAsset,
        }),
      )
      .addOperation(
        Operation.changeTrust({
          asset: this.euroAsset,
        }),
      )
      .setNetworkPassphrase(Networks.TESTNET)
      .setTimeout(TRUST_LINE_TIMEOUT)
      .build();


    txn.sign(kp);

    let response = this.server.submitTransaction(txn);

    console.log("################ Add Trust lines response", (await response));
  }

  async mintForNewUser(userPublicKey: string) {
    console.log("################ START Minting EUR and USDC");

    let issuerKeys = StellarKeyPair.fromSecret(ISSUER_SECRET);
    let issuerLoadedAccount: AccountResponse = await this.server.loadAccount(issuerKeys.publicKey());
    let account = new Account(issuerLoadedAccount?.accountId(), issuerLoadedAccount?.sequenceNumber());

    var transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: userPublicKey,
          asset: this.usdcAsset,
          amount: "100",
        }),
      )
      .addOperation(
        Operation.payment({
          destination: userPublicKey,
          asset: this.euroAsset,
          amount: "100",
        }),
      )
      .setTimeout(NEW_USER_MINT_TOKEN_TIMEOUT)
      .build();
    transaction.sign(issuerKeys);

    let response = this.server.submitTransaction(transaction);

    console.log("################ Minting EUR and USDC response", (await response));
  }
}