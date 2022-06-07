import { createSvgIcon } from '@mui/material';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { Theme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import { createStyles, makeStyles } from '@mui/styles';
import React from 'react';
import { Link, Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { ReactComponent as BridgeSvg } from './assets/bridge.svg';
import { ReactComponent as DashboardSvg } from './assets/dashboard.svg';
import { ReactComponent as GovernanceSvg } from './assets/governance.svg';
import { ReactComponent as StakeSvg } from './assets/stake.svg';
import { ReactComponent as SwapSvg } from './assets/swap.svg';
import Alert from './components/Alert';
import AMM from './components/AMM';
import Bridge from './components/Bridge';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import Topbar from './components/Topbar';
import { useGlobalState } from './GlobalStateProvider';

const DashboardIcon = createSvgIcon(<DashboardSvg />, 'Dashboard');
const StakeIcon = createSvgIcon(<StakeSvg />, 'Stake');
const GovernanceIcon = createSvgIcon(<GovernanceSvg />, 'Governance');
const SwapIcon = createSvgIcon(<SwapSvg />, 'Swap');
const BridgeIcon = createSvgIcon(<BridgeSvg />, 'Bridge');

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column'
    },
    body: { display: 'flex', flexDirection: 'row', flexGrow: 1 },
    content: { alignSelf: 'center', flexGrow: 1 },
    navigation: { display: 'flex', flexDirection: 'column', flexShrink: 0 },
    navigationBar: {
      flexWrap: 'nowrap',
      alignItems: 'flex-start',
      justifyContent: 'center',
      flexDirection: 'column',
      flexGrow: 1,
      gap: 16,
      padding: 16
    },
    navButton: {
      border: 'none',
      display: 'flex',
      flexDirection: 'row',
      textTransform: 'none',
      height: '50px',
      padding: '0 1.4em',
      color: theme.palette.text.primary,
      fontWeight: 'normal',
      fontSize: '20px'
    },
    disabledButton: {
      backgroundColor: 'white'
    },
    navButtonIcon: {
      marginRight: '0.8em',
      filter: 'brightness(0.1) saturate(100%)'
    },
    selected: {
      backgroundColor: theme.palette.primary.main
    },
    selectedIcon: {
      filter: ' brightness(1)'
    },
    disabledIcon: {
      filter: 'brightness(0.8)'
    }
  })
);

type NavElements = 'dashboard' | 'swap' | 'bridge';

export default function MainContent() {
  const classes = useStyles();
  const { state, setState } = useGlobalState();

  const location = useLocation();
  const [selected, setSelected] = React.useState<NavElements>('dashboard');

  React.useEffect(() => {
    const path = location.pathname.split('/')[1];
    setSelected(path as NavElements);
  }, [location]);

  return (
    <div className={'App' + (state.accountSecret ? '' : ' disconnected')}>
      <header className='App-header'>
        <Topbar />
      </header>
      <div className={classes.body}>
        <nav className={classes.navigation}>
          <Toolbar className={classes.navigationBar}>
            <Link to='/dashboard' style={{ textDecoration: 'none', display: 'inline-block' }}>
              <Button className={classes.navButton} variant={selected === 'dashboard' ? 'contained' : 'outlined'}>
                <DashboardIcon className={classes.navButtonIcon} /> Dashboard
              </Button>
            </Link>
            <Link to='/swap' style={{ textDecoration: 'none', display: 'inline-block' }}>
              <Button className={classes.navButton} variant={selected === 'swap' ? 'contained' : 'outlined'}>
                <SwapIcon className={classes.navButtonIcon} /> Swap
              </Button>
            </Link>
            <Link to='/bridge' style={{ textDecoration: 'none', display: 'inline-block' }}>
              <Button className={classes.navButton} variant={selected === 'bridge' ? 'contained' : 'outlined'}>
                <BridgeIcon className={classes.navButtonIcon} /> Bridge
              </Button>
            </Link>
            <Button
              className={classes.navButton}
              classes={{ disabled: classes.disabledButton }}
              variant='contained'
              disabled
            >
              <StakeIcon className={`${classes.navButtonIcon} ${classes.disabledIcon}`} /> Staking
            </Button>
            <Button className={classes.navButton} variant='contained' disabled>
              <GovernanceIcon className={`${classes.navButtonIcon} ${classes.disabledIcon}`} /> Governance
            </Button>
          </Toolbar>
        </nav>
        <main className={classes.content}>
          <Switch>
            <Route exact path='/dashboard' component={Dashboard} />
            <Route exact path='/'>
              <Redirect to='/dashboard' />
            </Route>
            <Route exact path='/swap' component={AMM} />
            <Route exact path='/bridge' component={Bridge} />
          </Switch>
        </main>
      </div>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={6000}
        open={Boolean(state.toast)}
        onClose={() => setState({ ...state, toast: undefined })}
      >
        {state.toast && <Alert severity={state.toast.type}>{state.toast.message}</Alert>}
      </Snackbar>
      <Footer />
    </div>
  );
}
