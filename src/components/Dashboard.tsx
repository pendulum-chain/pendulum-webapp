import { Card, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useGlobalState } from '../GlobalStateProvider';
import PendulumApi from '../lib/api';
import AmmView from './AMM';
import Portfolio from './Portfolio';
import { Balance } from './PortfolioRow';

export default function Dashboard() {
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
      <Grid container spacing={5}>
        <Grid item key={'portfolio'}>
          <Portfolio balances={balances} />
        </Grid>
        <Grid item key={'portfolio'}>
          <Card style={{ width: '800px', height: '400px', padding: '2em' }}>
            <Typography variant='h5'>Swap</Typography>
            {/* <AmmView /> */}
          </Card>
        </Grid>
        <Grid item key={'portfolio'}>
        </Grid>
      </Grid>
    </React.Fragment >
  );
}
