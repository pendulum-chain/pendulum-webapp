import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import BalanceCard from './BalanceCard';
import { useGlobalState } from '../GlobalStateProvider';
import PendulumApi from '../lib/api';
import { useEffect, useState } from 'react';

interface Balance {
  asset: string,
  free: string,
  reserved: string,
  frozen: string
}

export default function Balances() {
  const { state } = useGlobalState();
  const [balances, setBalances] = useState<Balance[]>([]);

  useEffect(() => {
    async function fetch() {
      const api = await PendulumApi.get();
      const address = state.accountExtraData?.address;
      if (address) {
        let fetchedBalances = await api.getBalances(address);
        console.log(fetchedBalances);
        setBalances(fetchedBalances);
      }
    }
    fetch();
  }, [state, setBalances]);

  return (
    <React.Fragment>
      <Container maxWidth="sm" component="main">
        <Typography
          component="h1"
          variant="h4"
          align="center"
          color="text.primary"
          gutterBottom
        >
          {state.accountSecret ? "Balances" : "No balances to show."}
        </Typography>
      </Container>
      <Container maxWidth="md" component="main">
        <Grid container spacing={5} alignItems="flex-end">
          {balances.map((balance) => (
            <Grid
              item
              key={balance.asset}
              xs={12}
              sm={6}
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
