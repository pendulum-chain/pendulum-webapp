import * as React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import { useGlobalState } from '../GlobalStateProvider';
import { useRealTimeBalances } from '../hooks/useRealTimeBalances';

export interface Balance {
  asset: string;
  free: string;
  reserved: string;
  frozen: string;
}

export default function Bridge() {
  const { state } = useGlobalState();
  const { balancePairs } = useRealTimeBalances(state.accountExtraData);
  const [selectedAsset, setSelectedAsset] = React.useState<string | undefined>(undefined);
  const [amountString, setAmounString] = React.useState<string>('');

  return (
    <React.Fragment>
      <Container maxWidth='sm' component='main'>
        <Typography component='h1' variant='h4' align='center' color='text.primary' margin='01em 0'>
          {state.accountSecret ? 'Account balances' : 'Connect your account'}
        </Typography>
      </Container>

      <Container maxWidth='md' component='main'>
        <TableContainer component={Paper}>
          <Table aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant='h6'>Asset</Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='h6'>Stellar</Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='h6'>Pendulum</Typography>
                </TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Card sx={{ marginTop: 4 }}>
          <CardContent>
            <Typography variant='h5'>Deposit/Withdraw</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
              <FormControl sx={{ marginRight: 2 }}>
                <InputLabel id='demo-simple-select-label'>Asset</InputLabel>
                <Select
                  value={selectedAsset}
                  label='Asset'
                  sx={{ minWidth: 100 }}
                  onChange={(event) => setSelectedAsset(event.target.value)}
                >
                  {balancePairs.map((balancePair, index) => (
                    <MenuItem value={`${balancePair.assetCode}:${balancePair.assetIssuer}`}>
                      {balancePair.assetCode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label='Amount'
                type='number'
                value={amountString}
                onChange={(event) => setAmounString(event.target.value)}
                sx={{ marginRight: 2 }}
              />
              <Button
                onClick={() => {}}
                variant='outlined'
                sx={{ marginRight: 2 }}
                disabled={selectedAsset === undefined || !amountString}
              >
                Deposit
              </Button>
              <Button onClick={() => {}} variant='outlined' disabled={selectedAsset === undefined || !amountString}>
                Withdraw
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </React.Fragment>
  );
}
