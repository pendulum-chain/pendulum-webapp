import Snackbar from '@mui/material/Snackbar';
import { Theme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';
import { Redirect, Route, Switch } from 'react-router-dom';
import Alert from './components/Alert';
import AMM from './components/AMM';
import Balances from './components/Balances';
import Bridge from './components/Bridge';
import Topbar from './components/Topbar';
import { useGlobalState } from './GlobalStateProvider';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: '#f8f8f8'
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
      <main className={classes.root}>
        <Switch>
          <Route exact path='/balances' component={Balances} />
          <Route exact path='/'>
            <Redirect to='/balances' />
          </Route>
          <Route exact path='/bridge' component={Bridge} />
          <Route exact path='/amm' component={AMM} />
        </Switch>
      </main>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={6000}
        open={Boolean(state.toast)}
        onClose={() => setState({ ...state, toast: undefined })}
      >
        {state.toast && <Alert severity={state.toast.type}>{state.toast.message}</Alert>}
      </Snackbar>
    </div>
  );
}
