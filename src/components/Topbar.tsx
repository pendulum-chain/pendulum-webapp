import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { useGlobalState } from "../GlobalStateProvider";
import AccountDialog from './AccountDialog';
import { useState } from 'react';

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
  const [ dialogOpen, setDialogOpen ] = useState(false);

  const onDialogClose = () => {
    setDialogOpen(false);
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
            state.accountSecret
            ? <Box style={{ justifyContent: "center", alignContent: "center"}}>
              <Typography >{state.accountName}</Typography>
              <Typography variant="caption">{state.accountSecret}</Typography>
              </Box>
            : <Button onClick={() => setDialogOpen(true)} variant="outlined">Connect account</Button>
          }
        <AccountDialog open={dialogOpen} onClose={onDialogClose}/>
        </Toolbar> 
    </AppBar>
  );
}
