import { Card, CardHeader, Typography } from '@mui/material';
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
      <Grid container spacing={5} paddingLeft={1}>
        <Grid item key='portfolio' sx={{ flexGrow: 1, maxWidth: 500 }}>
          <Portfolio balances={balances} />
        </Grid>
        <Grid item key='swap' sx={{ flexGrow: 2, maxWidth: 600 }}>
          <Card style={{ padding: '1em 0' }}>
            <CardHeader title='Swap' />
            {/* <Typography variant='h5' fontWeight='bold' padding='1em'></Typography> */}
            {contract ? (
              <SwapView swap={contract.swapAsset} reserves={reserves} />
            ) : (
              <Typography marginLeft='2em'>Not ready yet...</Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
