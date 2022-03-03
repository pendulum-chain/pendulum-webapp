import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import BalanceCard from './BalanceCard';
import { useGlobalState } from '../GlobalStateProvider';
import PendulumApi from '../lib/api';
import { useEffect, useState } from 'react';

export interface Balance {
  asset: string;
  free: string;
  reserved: string;
  frozen: string;
}

export default function Balances() {
  const { state } = useGlobalState();
  const [balances, setBalances] = useState<Balance[] | undefined>(undefined);

  useEffect(() => {
    async function fetch() {
      const api = PendulumApi.get();
      const address = state.accountExtraData?.address;
      if (address) {
        try {
          let fetchedBalances = await api.getBalances(address);
          setBalances(fetchedBalances);
        } catch (error) {
          console.error('Could not fetch balances', error);
          setBalances([]);
        }
      } else {
        setBalances([]);
      }
    }
    fetch();
  }, [state, state.currentNode]);

  return (
    <React.Fragment>
      <Container maxWidth='sm' component='main'>
        <Typography component='h1' variant='h4' align='center' color='text.primary' margin='1.2em 0'>
          {state.accountSecret ? 'Balances overview' : 'Connect your account'}
        </Typography>
      </Container>

      {balances && balances.length > 0 && (
        <Container maxWidth='md' component='main'>
          <Grid container spacing={5} alignItems='flex-end'>
            {balances.map((balance) => (
              <Grid item key={balance.asset} xs={12} sm={6} md={4}>
                <BalanceCard balance={balance} />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </React.Fragment>
  );
}
