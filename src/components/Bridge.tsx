import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { useGlobalState } from '../GlobalStateProvider';
import { useRealTimeBalances } from '../hooks/useRealTimeBalances';
import { Button } from '@mui/material';

export interface Balance {
  asset: string;
  free: string;
  reserved: string;
  frozen: string;
}

export default function Bridge() {
  const { state } = useGlobalState();
  const { balancePairs } = useRealTimeBalances(state.accountExtraData);

  return (
    <React.Fragment>
      <Container maxWidth='sm' component='main'>
        <Typography component='h1' variant='h4' align='center' color='text.primary' margin='01em 0'>
          {state.accountSecret ? 'Account balances' : 'Connect your account'}
        </Typography>
      </Container>

      <TableContainer component={Paper} sx={{ maxWidth: 800, marginLeft: 'auto', marginRight: 'auto' }}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell align='right'>Stellar</TableCell>
              <TableCell align='right'>Pendulum</TableCell>
              <TableCell align='center'>Deposit</TableCell>
              <TableCell align='center'>Withdraw</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balancePairs.map((balancePair, index) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component='th' scope='row'>
                  {balancePair.assetCode}
                  <br />
                  <Typography variant='caption' sx={{ color: '#666' }}>
                    {balancePair.assetIssuer.slice(0, 8)}...
                    {balancePair.assetIssuer.slice(balancePair.assetIssuer.length - 8)}
                  </Typography>
                </TableCell>
                <TableCell align='right'>{balancePair.stellarBalance}</TableCell>
                <TableCell align='right'>{balancePair.pendulumBalance}</TableCell>
                <TableCell align='center'>
                  <Button onClick={() => {}} variant='outlined'>
                    Deposit
                  </Button>
                </TableCell>
                <TableCell align='center'>
                  <Button onClick={() => {}} variant='outlined'>
                    Withdraw
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
}
