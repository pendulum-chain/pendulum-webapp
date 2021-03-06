import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import { GlobalStateProvider } from './GlobalStateProvider';
import MainContent from './Main';
import theme from './theme';
import { StyledEngineProvider } from '@mui/material/styles';

function App(props: { initialState: any }) {
  return (
    <ThemeProvider theme={theme}>
      <StyledEngineProvider injectFirst>
        <Router>
          <GlobalStateProvider value={props.initialState}>
            <MainContent />
          </GlobalStateProvider>
        </Router>
      </StyledEngineProvider>
    </ThemeProvider>
  );
}

export default App;
