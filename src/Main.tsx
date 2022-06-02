import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { Theme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import { createStyles, makeStyles } from '@mui/styles';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import Alert from './components/Alert';
import AMM from './components/AMM';
import Bridge from './components/Bridge';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import Topbar from './components/Topbar';
import { useGlobalState } from './GlobalStateProvider';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: '#f8f8f8',
      display: 'flex',
      flexDirection: 'column'
    },
    body: { display: 'flex', flexDirection: 'row', flexGrow: 1 },
    content: { alignSelf: 'center', flexGrow: 1 },
    navigation: { display: 'flex', flexDirection: 'column', flexGrow: 1 },
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
      fontWeight: 600,
      fontSize: 24,
      textTransform: 'none'
    }
  })
);

export default function MainContent() {
  const classes = useStyles();
  const { state, setState } = useGlobalState();

  return (
    <div className={'App' + (state.accountSecret ? '' : ' disconnected')}>
      <header className='App-header'>
        <Topbar />
      </header>
      <div className={classes.body}>
        <nav className={classes.navigation}>
          <Toolbar className={classes.navigationBar}>
            <Link to='/dashboard' style={{ textDecoration: 'none', display: 'inline-block' }}>
              <Button className={classes.navButton} variant='contained'>
                Dashboard
              </Button>
            </Link>
            <Link to='/amm' style={{ textDecoration: 'none', display: 'inline-block' }}>
              <Button className={classes.navButton} variant='contained'>
                Swap
              </Button>
            </Link>
            <Link to='/bridge' style={{ textDecoration: 'none', display: 'inline-block' }}>
              <Button className={classes.navButton} variant='contained'>
                Bridge
              </Button>
            </Link>
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
