import Faucet from '../lib/faucet';
import config from '../lib/config';
import { Server, Keypair as StellarKeyPair, BASE_FEE, TransactionBuilder, Operation, Asset, Networks, Account, AccountResponse } from "stellar-sdk";
import PendulumApi from './api';

export default class OnCLickSetup {
  server: Server;
  usdcAsset: Asset;
  euroAsset: Asset;

  constructor() {
    this.server = new Server(config.horizon_testnet_url);
    this.usdcAsset = new Asset("USDC", config.issuer_public);
    this.euroAsset = new Asset("EUR", config.issuer_public);
  }

  createKeypair(): StellarKeyPair {
    let new_kp = StellarKeyPair.random();
    console.log('New Keypair created', new_kp.rawPublicKey);
    return new_kp;
  }

  async createAccount() {
    const keypair = this.createKeypair();
    let url = `${config.friend_bot_url}${encodeURIComponent(keypair.publicKey(),)}`;
    try {
      const response = await fetch(url);
      console.log("Friend Bot Response", response)
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
      .setTimeout(config.trust_line_timeout)
      .build();

    txn.sign(kp);

    let response = await this.server.submitTransaction(txn);
    
    //.catch(e=> console.log("Error when Adding trustline"));

    console.log("Add Trust lines response", response);
  }

  async mintForNewUser(userPublicKey: string) {

    let issuer_secret = config.issuer_secret;
    console.log("START Minting EUR and USDC for ", userPublicKey, " Issuer secret is :", issuer_secret);

    let issuerKeys = StellarKeyPair.fromSecret(issuer_secret);

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
      .setTimeout(config.new_user_mint_timeout)
      .build();
    transaction.sign(issuerKeys);

    let response = await this.server.submitTransaction(transaction);
    //.catch(e => {console.log("Error when minting USDC and EUR",e)});
    console.log("Minting EUR and USDC response", response);
  }
}