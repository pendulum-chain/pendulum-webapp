import './App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { Switch, Route, Redirect, BrowserRouter as Router } from 'react-router-dom';
import Balances from './components/Balances';
import Swap from './components/Swap';
import Topbar from './components/Topbar';
import { GlobalStateProvider } from "./GlobalStateProvider";

function App() {
  const saved = localStorage.getItem("state");
  const initialValue = JSON.parse(saved || "");

  return (
    <Router>
      <GlobalStyles styles={{ ul: { margin: 0, padding: 0, listStyle: 'none' } }} />
      <CssBaseline />
      <GlobalStateProvider value={initialValue}>
        <div className="App">
          <header className="App-header">
              <Topbar />
          </header>
          <main className="App-body">
            <Switch>
                <Route exact path="/balances" component={Balances} />
                <Route exact path="/">
                  <Redirect to="/balances" />
                </Route>
                <Route exact path="/swap" component={Swap} />
              </Switch>
          </main>
        </div>
      </GlobalStateProvider>
    </Router>
  );
}

export default App;
