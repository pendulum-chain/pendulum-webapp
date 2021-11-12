import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    text: {
      primary: '#333',
      secondary: '#555'
    },
    primary: {
      light: '#a369ff',
      main: '#6a3bed',
      dark: '#6200ea',
      contrastText: '#fff'
    },
    secondary: {
      light: '##ff6690',
      main: '#ed2863',
      dark: '#b4003a',
      contrastText: '#000'
    },
    error: {
      light: '#FFCDD2',
      main: '#F44336',
      dark: '#D32F2F',
      contrastText: '#fff'
    },
    success: {
      light: '#C8E6C9',
      main: '#8BC34A',
      dark: '#388E3C',
      contrastText: '#fff'
    }
  },
  components: {
    MuiCardHeader: {
      styleOverrides: {
        title: {
          fontSize: '1.3rem',
          fontWeight: 500
        },
        root: {
          paddingBottom: 8
        }
      }
    }
  }
});

export default theme;
