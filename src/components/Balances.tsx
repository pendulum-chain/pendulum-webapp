import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import BalanceCard from './BalanceCard';

const balances = [
  {
    asset: 'USDT',
    amount: '10',
    free: '10',
    reserved: '0',
    button1: 'Send',
    button2: 'Receive'
  },
  {
    asset: 'EUR',
    amount: '11',
    free: '10',
    reserved: '0',
    button1: 'Send',
    button2: 'Receive'
  },
  {
    asset: 'PEN',
    amount: '10000',
    free: '10',
    reserved: '0',
    button1: 'Send',
    button2: 'Receive'
  },
];


export default function Balances() {
  return (
    <React.Fragment>
      <Container maxWidth="sm" component="main">
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Balances
        </Typography>
      </Container>
      {/* End hero unit */}
      <Container maxWidth="md" component="main">
        <Grid container spacing={5} alignItems="flex-end">
          {balances.map((balance) => (
            // Enterprise card is full width at sm breakpoint
            <Grid
              item
              key={balance.asset}
              xs={12}
              sm={balance.asset === 'Enterprise' ? 12 : 6}
              md={4}
            >
             <BalanceCard balance={balance} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </React.Fragment>
  );
}
