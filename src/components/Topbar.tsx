import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { useGlobalState } from '../GlobalStateProvider';
import { useState } from 'react';
import logo from '../assets/logo.svg';
import AccountDialog from './AccountDialog';
import Tools from './Tools';
import NodeSelectionDrawer from './NodeSelection';

const useStyles = makeStyles((theme) => ({
  appBar: {
    boxShadow: 'none',
    backgroundColor: '#ffffff',
    height: 'auto',
    justifyContent: 'center'
  },
  accountAddressTypography: {
    fontWeight: 1000,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    width: 150
  },
  accountButton: {
    display: 'flex',
    flexDirection: 'column',
    textTransform: 'none'
  }
}));

export default function Topbar() {
  const classes = useStyles();
  const { state } = useGlobalState();
  const [accountDialogElement, setAccountDialogElement] = useState<EventTarget | null>(null);
  const [toolsDialogElement, setToolsDialogElement] = useState<EventTarget | null>(null);

  const onAccountDialogClose = () => {
    setAccountDialogElement(null);
  };

  const onToolsDialogClose = () => {
    setToolsDialogElement(null);
  };

  return (
    <AppBar color='inherit' elevation={0} className={classes.appBar} position='relative'>
      <Toolbar sx={{ flexWrap: 'nowrap', alignItems: 'flex-start', flexDirection: 'column', padding: 2 }}>
        <Box sx={{ alignItems: 'center', display: 'flex', width: '100%' }}>
          <img src={logo} className='App-logo' alt='logo' style={{ margin: '0.3em ' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='h6' color='inherit'>
              Pendulum
            </Typography>
          </Box>
          {state.accountSecret ? (
            <Button
              className={classes.accountButton}
              onClick={(e) => setAccountDialogElement(e.currentTarget)}
              variant='text'
            >
              <Typography variant='body1' color='textPrimary'>
                {state.accountName}
              </Typography>
              <Typography variant='body1' color='textPrimary' className={classes.accountAddressTypography}>
                {state.accountExtraData?.address}
              </Typography>
            </Button>
          ) : (
            <Button onClick={(e) => setAccountDialogElement(e.currentTarget)} variant='contained'>
              Connect account
            </Button>
          )}
          <AccountDialog caller={accountDialogElement} open={!!accountDialogElement} onClose={onAccountDialogClose} />
          <Tools caller={toolsDialogElement} open={!!toolsDialogElement} onClose={onToolsDialogClose} />
        </Box>
        <NodeSelectionDrawer buttonStyle={{ marginLeft: '3.4em', marginTop: '-0.8em', fontWeight: 400, padding: 0 }} />
      </Toolbar>
    </AppBar>
  );
}
