import Grid from '@mui/material/Grid';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useGlobalState } from '../GlobalStateProvider';
import PendulumApi from '../lib/api';
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
      </Grid>
    </React.Fragment >
  );
}
