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
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

import { Keypair, Asset } from 'stellar-sdk';

import PendulumApi, { BALANCE_FACTOR } from '../lib/api';
import { useGlobalState } from '../GlobalStateProvider';
import { useRealTimeBalances } from '../hooks/useRealTimeBalances';
import { CardHeader } from '@mui/material';

export interface Balance {
  asset: string;
  free: string;
  reserved: string;
  frozen: string;
}

const NoMaxWidthTooltip = styled(({ className, ...props }: { className: string } & TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none'
  }
});

export default function Bridge() {
  const { state } = useGlobalState();
  const { balancePairs } = useRealTimeBalances(state.accountExtraData);
  const [selectedAsset, setSelectedAsset] = React.useState<string>('');
  const [amountString, setAmounString] = React.useState<string>('');
  const [actionPending, setActionPending] = React.useState(false);

  const deposit = async () => {
    if (actionPending) return;
    setActionPending(true);

    try {
      const api = PendulumApi.get();
      const stellarSecret = state.accountExtraData?.stellar_seed;
      if (stellarSecret === undefined) return;
      if (!selectedAsset) return;

      console.log('stellarSecret', stellarSecret, JSON.stringify(state.accountExtraData, null, 2));

      const [issuer, code] = selectedAsset.split(':');
      const stellarAsset = new Asset(code, issuer);
      await api.createClaimableDeposit(Keypair.fromSecret(stellarSecret), amountString, stellarAsset);
      await new Promise((resolve) => setTimeout(resolve, 10000));
    } finally {
      setActionPending(false);
    }
  };

  const withdraw = async () => {
    if (actionPending) return;
    setActionPending(true);

    try {
      const api = PendulumApi.get();
      const stellarSecret = state.accountExtraData?.stellar_seed;
      if (stellarSecret === undefined) return;
      if (!selectedAsset) return;

      const keyRingPair = api.getSubstrateKeypairfromStellarSecret(stellarSecret);

      const [issuer, code] = selectedAsset.split(':');
      await api.withdrawToStellar(keyRingPair, code, issuer, Number(amountString) * BALANCE_FACTOR);
      await new Promise((resolve) => setTimeout(resolve, 15000));
    } finally {
      setActionPending(false);
    }
  };

  return (
    <React.Fragment>
      <Container maxWidth='sm' component='main'>
        <Typography component='h1' variant='h4' align='center' color='text.primary' margin='1.2em 0'>
          {state.accountSecret ? 'Account balances'}
        </Typography>
      </Container>

      {state.accountSecret && (
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
                      <NoMaxWidthTooltip title={balancePair.assetIssuer} className='dummy'>
                        <Typography variant='caption' sx={{ color: '#666' }}>
                          {balancePair.assetIssuer.slice(0, 8)}...
                          {balancePair.assetIssuer.slice(balancePair.assetIssuer.length - 8)}
                        </Typography>
                      </NoMaxWidthTooltip>
                    </TableCell>
                    <TableCell align='right'>{balancePair.stellarBalance}</TableCell>
                    <TableCell align='right'>
                      {Number(balancePair.pendulumBalance.trim().split(' ')[0]).toFixed(7)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Card sx={{ marginTop: 4 }}>
            <CardHeader
              title={'Bridge'}
              titleTypographyProps={{ align: 'center' }}
              sx={{
                borderBottom: '1px #eee solid'
              }}
            />
            <CardContent>
              <Typography
                align='center'
                color='gray'
                sx={{ mb: 3 }}
              >{`Move assets from Stellar to Pendulum and viceversa without fees.`}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
                <TextField
                  label='Amount'
                  type='number'
                  value={amountString}
                  onChange={(event) => setAmounString(event.target.value)}
                  sx={{ marginRight: 1 }}
                />
                <FormControl sx={{ marginRight: 2 }}>
                  <InputLabel id='demo-simple-select-label'>Asset</InputLabel>
                  <Select
                    value={selectedAsset}
                    label='Asset'
                    sx={{ minWidth: 100 }}
                    onChange={(event) => setSelectedAsset(event.target.value)}
                  >
                    {balancePairs.map((balancePair, index) => (
                      <MenuItem key={index} value={`${balancePair.assetIssuer}:${balancePair.assetCode}`}>
                        {balancePair.assetCode}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  onClick={deposit}
                  variant='outlined'
                  sx={{ marginRight: 2 }}
                  disabled={!selectedAsset || !amountString || actionPending}
                >
                  To Pendulum
                </Button>
                <Button
                  sx={{ marginRight: 2 }}
                  onClick={withdraw}
                  variant='outlined'
                  disabled={!selectedAsset || !amountString || actionPending}
                >
                  To Stellar
                </Button>
                {actionPending && <CircularProgress />}
              </Box>
            </CardContent>
          </Card>
        </Container>
      )}
    </React.Fragment>
  );
}
