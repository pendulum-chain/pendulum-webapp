import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import { Avatar, Backdrop, Theme, Tooltip } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { useState } from 'react';
import logo from '../assets/logo.svg';
import { useGlobalState } from '../GlobalStateProvider';
import AccountDialog from './AccountDialog';
import NodeSelectionDrawer from './NodeSelection';
import Tools from './Tools';

const useStyles = makeStyles((theme) => ({
  appBar: {
    boxShadow: 'none',
    backgroundColor: '#ffffff',
    height: 'auto',
    justifyContent: 'center'
  },
  accountNameTypography: {
    letterSpacing: '0px',
    color: '#1F1F1F',
    opacity: 0.8,
    fontSize: '20px'
  },
  accountAddressTypography: {
    fontWeight: 1000,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    width: 150,
    textAlign: 'left',
    letterSpacing: '0px',
    color: '#1F1F1F',
    opacity: 0.8
  },
  accountButton: {
    display: 'flex',
    flexDirection: 'column',
    textTransform: 'none',
    boxShadow: 'none'
  },
  connectAccountButton: {
    display: 'flex',
    flexDirection: 'row',
    textTransform: 'none',
    boxShadow: 'none',
    height: '50px',
    padding: '0 1.4em',
    fontWeight: 'bold',
    position: 'absolute',
    top: '2em',
    right: '2em'
  },
  connectAccountButtonIcon: {
    marginRight: '0.8em',
  }
}));

export default function Topbar() {
  const classes = useStyles();
  const { state } = useGlobalState();
  const [backdropOpen, setBackdropOpen] = useState(true);
  const [accountDialogElement, setAccountDialogElement] = useState<EventTarget | null>(null);
  const [toolsDialogElement, setToolsDialogElement] = useState<EventTarget | null>(null);

  const onAccountDialogClose = () => {
    setAccountDialogElement(null);
  };

  const onToolsDialogClose = () => {
    setToolsDialogElement(null);
  };

  const handleClose = () => {
    setBackdropOpen(false);
  };

  const handleToggle = () => {
    setBackdropOpen(!backdropOpen);
  };


  const elipsis = (a: string) =>
    a.slice(0, 4) + '..' + a.slice(-6)

  return (
    <AppBar color='inherit' elevation={0} className={classes.appBar} position='relative'>
      <Toolbar sx={{ flexWrap: 'nowrap', alignItems: 'flex-start', flexDirection: 'column', padding: 2 }}>
        <Box sx={{ alignItems: 'center', display: 'flex', width: '100%' }}>
          <img src={logo} className='App-logo' alt='logo' style={{ margin: '0.3em ' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='h6' color='inherit' style={{ fontSize: '28px' }}>
              Pendulum <NodeSelectionDrawer buttonStyle={{ color: '#bdbdbd', verticalAlign: 'baseline', fontSize: '12px', fontWeight: 400, padding: 0 }} />
            </Typography>
          </Box>
          {state.accountSecret ? (
            <Button
              className={classes.accountButton}
              onClick={(e) => setAccountDialogElement(e.currentTarget)}
              variant='text'
            >
              <Box flexDirection='row' display='flex'>
                <Box flexDirection='column' flex={2} margin='8px 30px 10px 0'>
                  <Avatar sx={{ bgcolor: '#59c4e2' }}>
                    {state.accountName?.slice(0, 1)}
                  </Avatar>
                </Box>
                <Box flexDirection='column' flex={8}>
                  <Typography variant='body1' color='textPrimary' className={classes.accountNameTypography}>
                    {state.accountName}
                  </Typography>
                  <Tooltip title={state.accountExtraData ? state.accountExtraData.address : ''}>
                    <Typography variant='body1' color='textPrimary' className={classes.accountAddressTypography}>
                      {state.accountExtraData?.address ? elipsis(state.accountExtraData.address) : ''}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
            </Button>
          ) : (
            <Backdrop
              sx={{ color: '#fff', zIndex: (theme: Theme) => theme.zIndex.drawer + 1 }}
              open={backdropOpen}
            >
              <Button
                className={classes.connectAccountButton}
                onClick={(e) => setAccountDialogElement(e.currentTarget)}
                variant='contained'
              >
                <ElectricalServicesIcon className={classes.connectAccountButtonIcon} />
                Connect account
              </Button>
            </Backdrop>
          )}
          <AccountDialog caller={accountDialogElement} open={!!accountDialogElement} onClose={onAccountDialogClose} />
          <Tools caller={toolsDialogElement} open={!!toolsDialogElement} onClose={onToolsDialogClose} />
        </Box>
      </Toolbar>
    </AppBar >
  );
}
