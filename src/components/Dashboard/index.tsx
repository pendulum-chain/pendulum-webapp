import { Card, CardHeader, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { useAMMContract } from '../../hooks/useAMMContract';
import SwapView from '../AMM/Swap';
import Portfolio from '../Portfolio';

export default function Dashboard() {
  const contract = useAMMContract();

  return (
    <React.Fragment>
      <Grid container spacing={5} sx={{ paddingLeft: 1, justifyContent: 'center' }}>
        <Grid item key='portfolio' sx={{ flexGrow: 1, maxWidth: 500 }}>
          <Portfolio />
        </Grid>
        <Grid item key='swap' sx={{ flexGrow: 2, maxWidth: 600 }}>
          <Card style={{ padding: '1em 0' }}>
            <CardHeader title='Swap' />
            {contract ? (
              <SwapView swap={contract.swapAsset} contract={contract} />
            ) : (
              <Typography marginLeft='2em'>Not ready yet...</Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
