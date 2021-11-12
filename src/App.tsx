import './App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Switch, Route, Redirect, BrowserRouter as Router } from 'react-router-dom';
import Balances from './components/Balances';
import AMM from './components/AMM';
import Topbar from './components/Topbar';
import { GlobalStateProvider } from './GlobalStateProvider';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme, ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import Bridge from './components/Bridge';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: '#f8f8f8'
    }
  })
);

function App() {
  const saved = localStorage.getItem('state');
  const initialValue = JSON.parse(saved || '{}');
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <GlobalStateProvider value={initialValue}>
          <div className='App'>
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
        </GlobalStateProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
