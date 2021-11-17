import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { useGlobalState } from '../GlobalStateProvider';
import { useState } from 'react';
import logo from '../assets/logo.svg';
import GitHubIcon from '@mui/icons-material/GitHub';
import AccountDialog from './AccountDialog';
import { Tooltip } from '@mui/material';

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
      <Toolbar sx={{ flexWrap: 'nowrap', alignItems: 'center' }}>
        <img src={logo} className='App-logo' alt='logo' style={{ margin: '0.5em ' }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant='h6' color='inherit'>
            Pendulum
          </Typography>
        </Box>
        <nav style={{ display: 'flex', marginRight: 6 }}>
          <Link to='/balances' style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Button style={{ display: 'block' }}>Balances</Button>
          </Link>
          <Link to='/bridge' style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Button style={{ display: 'block' }}>Bridge</Button>
          </Link>
          <Link to='/amm' style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Button style={{ display: 'block', minWidth: 'initial' }}>AMM</Button>
          </Link>
        </nav>
        <Tooltip title='Visit us on GitHub to know more about the project!'>
          <a
            target='_blank'
            rel='noreferrer'
            href='https://github.com/pendulum-chain/'
            style={{ textDecoration: 'none', margin: '0 0.5em' }}
          >
            <GitHubIcon color='primary' style={{ width: '24px', height: '24px' }} />
          </a>
        </Tooltip>
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
