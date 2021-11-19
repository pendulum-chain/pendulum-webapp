import { Switch, Route, Redirect } from 'react-router-dom';
import Balances from './components/Balances';
import AMM from './components/AMM';
import Topbar from './components/Topbar';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Bridge from './components/Bridge';
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
  const { state } = useGlobalState();

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
    </div>
  );
}
