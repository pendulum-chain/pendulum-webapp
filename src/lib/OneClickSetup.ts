import Faucet from '../lib/faucet';
import config from '../lib/config';
import {
  Server,
  Keypair as StellarKeyPair,
  BASE_FEE,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  Account,
  AccountResponse
} from 'stellar-sdk';
import PendulumApi from './api';

export default class OneClickSetup {
  server: Server;
  usdcAsset: Asset;
  euroAsset: Asset;
  notifyCallback: Function;

  constructor() {
    this.server = new Server(config.horizon_testnet_url);
    this.usdcAsset = new Asset('USDC', config.issuer_public);
    this.euroAsset = new Asset('EUR', config.issuer_public);
    this.notifyCallback = (m: string) => console.log(m);
  }

  setNotifyCallback(callback: Function) {
    this.notifyCallback = callback;
  }

  createKeypair(): StellarKeyPair {
    let new_kp = StellarKeyPair.random();
    return new_kp;
  }

  async createAccount() {
    try {
      this.notifyCallback(`Generating a new Stellar keypair.`);
      const keypair = this.createKeypair();
      this.notifyCallback(`Stellar keypair created.`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.notifyCallback('Funding your Stellar account with some Lumens.');
      let url = `${config.friend_bot_url}${encodeURIComponent(keypair.publicKey())}`;
      const response = await fetch(url);
      console.log('Friend Bot Response', response);

      this.notifyCallback('Adding trustlines for EUR and USDC Stellar assets.');
      await this.addTrustLine(keypair);

      this.notifyCallback('Funding your Stellar account with some EUR and USDC tokens.');
      await this.mintForNewUser(keypair.publicKey());

      this.notifyCallback('Adding your account to Pendulum keyring.');
      let api = PendulumApi.get();
      let accountKeyPairs = api.addAccount(keypair.secret(), keypair.publicKey());

      //faucet
      const faucet = new Faucet();

      this.notifyCallback('Funding your Pendulum account with some PEN tokens.');
      let faucet_call_result = await faucet.send(accountKeyPairs.address);
      console.log('Faucet Sending PEN Tokens result', faucet_call_result);

      return {
        accountName: 'My account',
        accountSecret: accountKeyPairs.seed,
        accountExtraData: accountKeyPairs
      };
    } catch (e) {
      console.error('ERROR!', e);
    }
  }

  async checkBalances(account_pub: string) {
    // the JS SDK uses promises for most actions, such as retrieving an account
    const account = await this.server.loadAccount(account_pub);
    console.log('Balances for account: ' + account_pub);
    account.balances.forEach((balance) => {
      console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
    });
  }

  async addTrustLine(kp: StellarKeyPair) {
    let loaded_account: AccountResponse = await this.server.loadAccount(kp.publicKey());
    let account = new Account(loaded_account?.accountId(), loaded_account?.sequenceNumber());
    let txn = new TransactionBuilder(account, { fee: BASE_FEE })
      .addOperation(
        Operation.changeTrust({
          asset: this.usdcAsset
        })
      )
      .addOperation(
        Operation.changeTrust({
          asset: this.euroAsset
        })
      )
      .setNetworkPassphrase(Networks.TESTNET)
      .setTimeout(config.trust_line_timeout)
      .build();

    txn.sign(kp);

    let response = await this.server.submitTransaction(txn);

    this.notifyCallback(`Trustlines added tx: ${response.hash}`);
    console.log('Add Trust lines response', response);
  }

  async mintForNewUser(userPublicKey: string) {
    let { issuer_secret } = config;

    if (!issuer_secret) {
      throw Error('Environment variable ASSET_ISSUER_SECRET not defined.');
    }

    console.log('Start minting EUR and USDC for ', userPublicKey, ' Issuer secret is :', issuer_secret);

    let issuerKeys = StellarKeyPair.fromSecret(issuer_secret);

    let issuerLoadedAccount: AccountResponse = await this.server.loadAccount(issuerKeys.publicKey());
    let account = new Account(issuerLoadedAccount?.accountId(), issuerLoadedAccount?.sequenceNumber());

    var transaction = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(
        Operation.payment({
          destination: userPublicKey,
          asset: this.usdcAsset,
          amount: '100'
        })
      )
      .addOperation(
        Operation.payment({
          destination: userPublicKey,
          asset: this.euroAsset,
          amount: '100'
        })
      )
      .setTimeout(config.new_user_mint_timeout)
      .build();
    transaction.sign(issuerKeys);

    let response = await this.server.submitTransaction(transaction);

    this.notifyCallback(`EUR and USDC minted tx:${response.hash}`);
    console.log('Minting EUR and USDC response', response);
  }
}
