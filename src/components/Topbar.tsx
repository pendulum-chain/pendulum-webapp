import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

export default function Topbar() {
  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
    >
      <Toolbar sx={{ flexWrap: 'nowrap' }}>
      <Box sx={{ flexGrow: 1}}>
          <Typography variant="h6" color="inherit">Pendulum</Typography>
      </Box>
          <nav>
            <Link to="/balances" style={{ textDecoration: 'none' }}>
              <Button>Balances</Button>
            </Link>
            <Link to="/swap" style={{ textDecoration: 'none' }}>
              <Button>Swap</Button>
            </Link>
          </nav>
        <Button href="#" variant="outlined" sx={{ my: 1, mx: 1.5 }}>
          Connect account
        </Button>
      </Toolbar>
    </AppBar>
  );
}
