import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#9e47ff',
      main: '#6200ee',
      dark: '#0400ba',
      contrastText: '#fff'
    },
    secondary: {
      light: '##ff6690',
      main: '#ed2863',
      dark: '#b4003a',
      contrastText: '#000'
    }
  }
});

export default theme;
