import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import BalanceCard from './BalanceCard';
import { useGlobalState } from '../GlobalStateProvider';
import PendulumApi from '../lib/api';
import { useEffect, useState } from 'react';
import disconnected from '../assets/disconnected.png';

interface Balance {
  asset: string;
  free: string;
  reserved: string;
  frozen: string;
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
        setBalances(fetchedBalances);
      } else {
        setBalances([]);
      }
    }
    fetch();
  }, [state, setBalances]);

  return (
    <React.Fragment>
      <Container maxWidth='sm' component='main'>
        <Typography component='h1' variant='h4' align='center' color='text.primary' margin='01em 0'>
          {state.accountSecret ? 'Account balances' : 'Connect your account'}
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
      {(!balances || balances.length === 0) && (
        <Container maxWidth='md' component='main' style={{ textAlign: 'center' }}>
          <img alt='sad' width='md' height='600' src={disconnected} style={{ borderRadius: '20px' }} />
        </Container>
      )}
    </React.Fragment>
  );
}
