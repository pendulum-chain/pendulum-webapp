import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { useGlobalState } from "../GlobalStateProvider";
import { useEffect, useState } from 'react';
import { Server, Keypair as StellarKeyPair, BASE_FEE, TransactionBuilder, Operation, Asset, Networks, Account, AccountResponse } from "stellar-sdk";
import { FRIEND_BOT_URL, HORIZON_TESTNET_URL, ISSUER_PUBLIC, ISSUER_SECRET, NEW_USER_MINT_TOKEN_TIMEOUT, TRUST_LINE_TIMEOUT } from "../constants";
import OnClickSetup from '../lib/OneClickSetup'

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


  const onDialogClose = () => {
    setElement(null);
  }
  
  const handleOneClickSetup = () => {
    const setup = new OnClickSetup();
    // your code
    setup.createAccount();
  }

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
              <Button>Swap</Button>
            </Link>
          </nav>
          {
            state.accountPubKey
            ? <Button onClick={(e) => setElement(e.currentTarget)} variant="outlined">{state.accountName}</Button>
            : <Button onClick={(e) => setElement(e.currentTarget)} variant="outlined">Connect account</Button>
          }
           <Button onClick={ (e) => handleOneClickSetup() } variant="outlined"> Setup 1 click </Button>
      {/*     <AccountDialog caller={element} open={!!element} onClose={onDialogClose}/> */}
        </Toolbar> 
    </AppBar>
  );
}
