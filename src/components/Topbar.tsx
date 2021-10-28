import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { useGlobalState } from "../GlobalStateProvider";
//import AccountDialog from './AccountDialog';
import { useEffect, useState } from 'react';
import { Server, Keypair as StellarKeyPair, BASE_FEE, TransactionBuilder, Operation, Asset, Networks, Account, AccountResponse } from "stellar-sdk";
import { FRIEND_BOT_URL, HORIZON_TESTNET_URL, ISSUER_PUBLIC, ISSUER_SECRET, NEW_USER_MINT_TOKEN_TIMEOUT, TRUST_LINE_TIMEOUT } from "../constants";

//import PolkadotApi from '../lib/api';

const useStyles = makeStyles(theme => ({
  appBar: {
    boxShadow: "none",
    backgroundColor: "#ffffff",
    height: '90px',
    justifyContent: "center" 
  } 
}));

export default function Topbar() {
  const classes = useStyles();
  const { state } = useGlobalState();
  const [ element, setElement ] = useState<EventTarget | null>(null);

  let server = new Server(HORIZON_TESTNET_URL);
  let usdcAsset = new Asset("USDC",ISSUER_PUBLIC);
  let euroAsset = new Asset("EUR",ISSUER_PUBLIC);

  const onDialogClose = () => {
    setElement(null);
  }
  
  const handleButtonClick = (target: any) => {
    console.log(target);
    alert("clicked!");
  }

  useEffect(() => {
    async function setUp1Click() {
      // Your code goes here
      createAccount();
      
  }

 function createKeypair(): StellarKeyPair {
    let new_kp = StellarKeyPair.random();
    console.log('New Keypair created',new_kp.rawPublicKey);
    return new_kp;
 }

 async function createAccount() {

  const keypair = createKeypair();
  let url = `${FRIEND_BOT_URL}${encodeURIComponent(keypair.publicKey() ,)}`;
  try {
    const response = await fetch(url);

    console.log("########################### fetch URL", url)
    console.log("########################### fetch Response", response)
    await addTrustLine(keypair);
    await mintForNewUser(keypair.publicKey())

  } catch (e) {
    console.error("ERROR!", e);
  }


}

async function checkBalances(account_pub: string){
    const server = new Server(HORIZON_TESTNET_URL);
  // the JS SDK uses promises for most actions, such as retrieving an account
  const account = await server.loadAccount(account_pub);
  console.log("Balances for account: " + account_pub);
  account.balances.forEach(function (balance) {
    console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
  });

}


async function addTrustLine(kp: StellarKeyPair) {
  let loaded_account: AccountResponse = await server.loadAccount(kp.publicKey())
  let account = new Account(loaded_account?.accountId(), loaded_account?.sequenceNumber());
  let txn = new TransactionBuilder( account, { fee: BASE_FEE })
    .addOperation(
        Operation.changeTrust({
        asset: usdcAsset,
        }),
    )
    .addOperation(
      Operation.changeTrust({
      asset: euroAsset,
      }),
  ) 
    .setNetworkPassphrase(Networks.TESTNET)
    .setTimeout(TRUST_LINE_TIMEOUT)
    .build();


  txn.sign(kp);
   
  let response = server.submitTransaction(txn);

  console.log("################ Add Trust lines response", (await response));
}

async function mintForNewUser(userPublicKey: string){
  console.log("################ START Minting EUR and USDC");

  let issuerKeys = StellarKeyPair.fromSecret(ISSUER_SECRET);
  let issuerLoadedAccount: AccountResponse = await server.loadAccount(issuerKeys.publicKey());
  let account = new Account(issuerLoadedAccount?.accountId(), issuerLoadedAccount?.sequenceNumber());

  var transaction = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: userPublicKey ,
        asset: usdcAsset,
        amount: "100",
      }),
    )
    .addOperation(
      Operation.payment({
        destination: userPublicKey ,
        asset: euroAsset,
        amount: "100",
      }),
    )
    .setTimeout(NEW_USER_MINT_TOKEN_TIMEOUT)
    .build();
  transaction.sign(issuerKeys);
  
  let response = server.submitTransaction(transaction);

  console.log("################ Minting EUR and USDC response", (await response));
}

  // TODO : call get PEN
    
   setUp1Click();
  }, [state]);

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      style={{ borderBottom: '1px solid #eee' }}
      className={classes.appBar}
    >
      <Toolbar sx={{ flexWrap: 'nowrap' }}>
      <Box sx={{ flexGrow: 1}}>
          <Typography variant="h6" color="inherit">Pendulum</Typography>
      </Box>
          <nav>
            <Link to="/balances" style={{ textDecoration: 'none' }}>
              <Button>Balances</Button>
            </Link>
            <Link to="/swap" style={{ textDecoration: 'none' }}>
              <Button onClick={(event) => handleButtonClick(event.target) } >Swap</Button>
            </Link>
          </nav>
          {
            state.accountPubKey
            ? <Button onClick={(e) => setElement(e.currentTarget)} variant="outlined">{state.accountName}</Button>
            : <Button onClick={(e) => setElement(e.currentTarget)} variant="outlined">Connect account</Button>
          }
           <Button onClick={(e) => setElement(e.currentTarget)} variant="outlined">Create account</Button>
      {/*     <AccountDialog caller={element} open={!!element} onClose={onDialogClose}/> */}
        </Toolbar> 
    </AppBar>
  );
}
