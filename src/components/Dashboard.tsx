import { Card, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import BigNumber from 'big.js';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useGlobalState } from '../GlobalStateProvider';
import { useAMMContract } from '../hooks/useAMMContract';
import PendulumApi from '../lib/api';
import { BalancePair } from './AMM';
import SwapView from './AMM/Swap';
import Portfolio from './Portfolio';
import { Balance } from './PortfolioRow';

export default function Dashboard() {
  const { state } = useGlobalState();
  const [balances, setBalances] = useState<Balance[] | undefined>(undefined);
  const [reserves, setReserves] = useState<BalancePair>([BigNumber(0), BigNumber(0)]);

  const contract = useAMMContract();

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

    contract?.getReserves().then(setReserves).catch(console.error);
  }, [contract, state, state.currentNode]);

  return (
    <React.Fragment>
      <Grid container spacing={5}>
        <Grid item key='portfolio' sx={{ flexGrow: 1 }}>
          <Portfolio balances={balances} />
        </Grid>
        <Grid item key='swap' sx={{ flexGrow: 2 }}>
          <Card style={{ padding: '2em' }}>
            <Typography variant='h5'>Swap</Typography>
            {contract ? (
              <SwapView swap={contract.swapAsset} reserves={reserves} />
            ) : (
              <Typography>Could not instantiate AMM contract</Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
