import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import Footer from './components/Footer';
import { GlobalStateProvider } from './GlobalStateProvider';
import MainContent from './Main';
import theme from './theme';

function App() {
  const saved = localStorage.getItem('state');
  const initialValue = JSON.parse(saved || '{}');

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <GlobalStateProvider value={initialValue}>
          <MainContent />
          <Footer />
        </GlobalStateProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
