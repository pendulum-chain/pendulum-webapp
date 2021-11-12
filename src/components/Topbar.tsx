import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { useGlobalState } from '../GlobalStateProvider';
import { useState } from 'react';
import logo from '../logo.svg';
import AccountDialog from './AccountDialog';

const useStyles = makeStyles((theme) => ({
  appBar: {
    boxShadow: 'none',
    backgroundColor: '#ffffff',
    height: '80px',
    justifyContent: 'center'
  }
}));

export default function Topbar() {
  const classes = useStyles();
  const { state } = useGlobalState();
  const [element, setElement] = useState<EventTarget | null>(null);

  const onDialogClose = () => {
    setElement(null);
  };

  return (
    <AppBar
      position='fixed'
      color='inherit'
      elevation={0}
      style={{ borderBottom: '1px solid #eee' }}
      className={classes.appBar}
    >
      <Toolbar sx={{ flexWrap: 'nowrap' }}>
        <img src={logo} className='App-logo' alt='logo' style={{ margin: '0.5em ' }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant='h6' color='inherit'>
            Pendulum
          </Typography>
        </Box>
        <nav>
          <Link to='/balances' style={{ textDecoration: 'none' }}>
            <Button>Balances</Button>
          </Link>
          <Link to='/amm' style={{ textDecoration: 'none' }}>
            <Button>AMM</Button>
          </Link>
        </nav>
        {state.accountSecret ? (
          <Button onClick={(e) => setElement(e.currentTarget)} variant='outlined'>
            {state.accountName}
          </Button>
        ) : (
          <Button onClick={(e) => setElement(e.currentTarget)} variant='outlined'>
            Connect account
          </Button>
        )}
        <AccountDialog caller={element} open={!!element} onClose={onDialogClose} />
      </Toolbar>
    </AppBar>
  );
}
