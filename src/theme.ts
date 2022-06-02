import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    text: {
      primary: '#1F1F1F',
      secondary: '#555'
    },
    primary: {
      light: '#70DDDD',
      main: '#59C4E2',
      dark: '#44AADD',
      contrastText: '#fff'
    },
    secondary: {
      light: '#ff6690',
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
  typography: {
    fontFamily: ['Lexend', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(',')
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '40px',
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 32,
          paddingRight: 32
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.9em',
          fontWeight: 400
        }
      }
    },
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
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#E2E2EC',
          borderRadius: '40px'
        }
      }
    }
  }
});

export default theme;
