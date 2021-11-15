import { Divider, Box, Button, Popover, TextField, Typography, Link } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useEffect, useState } from 'react';
import { useGlobalState } from '../GlobalStateProvider';
import PendulumApi from '../lib/api';
import OneClickSetup from '../lib/OneClickSetup';

export default function AccountDialog(props: any) {
  const { state, setState } = useGlobalState();
  const [accountName, setAccountName] = useState(state.accountName || '');
  const [accountSecret, setAccountSecret] = useState(state.accountSecret || '');
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const api = PendulumApi.get();

  useEffect(() => {
    localStorage.setItem('state', JSON.stringify(state));
  }, [state]);

  const handleOneClickSetup = async () => {
    const setup = new OneClickSetup();
    setup.setNotifyCallback((infoMessage: string) => setState({ infoMessage }));

    setLoadingSetup(true);
    const res = await setup.createAccount();
    if (res) {
      setState({ ...res, infoMessage: undefined });
      setAccountName(res.accountName);
      setAccountSecret(res.accountSecret);
      setShowSecretKey(true);
    }
    setLoadingSetup(false);
  };

  const forgetAccount = () => {
    setState({ accountName: '', accountSecret: '', accountExtraData: undefined });
    setAccountName('');
    setAccountSecret('');
  };

  const connectAccount = () => {
    const accountExtraData = api.addAccountFromStellarSeed(accountSecret, accountName);
    setState({ accountName, accountSecret, accountExtraData });
    props.onClose();
  };

  return (
    <Popover
      open={props.open}
      onClose={props.onClose}
      anchorEl={props.caller}
      sx={{
        position: 'absolute',
        top: '70px'
      }}
    >
      <Box
        sx={{
          width: '450px',
          padding: '20px'
        }}
      >
        <Box style={{ textAlign: 'center' }}>
          <LoadingButton
            style={{ margin: '10px 0' }}
            loading={loadingSetup}
            onClick={(e) => handleOneClickSetup()}
            variant='contained'
          >
            One-click setup
          </LoadingButton>
          {state.infoMessage && (
            <Typography style={{ color: '#666' }} variant='subtitle1'>
              {state.infoMessage + ' '}
            </Typography>
          )}
          {showSecretKey && !loadingSetup && state.accountExtraData?.stellar_seed && (
            <div>
              <Typography display='inline' style={{ color: '#666' }}>
                Done! Your Stellar secret is
              </Typography>
              <Typography
                variant='body2'
                style={{
                  border: '1px solid #ed2863',
                  padding: '5px',
                  margin: '5px',
                  color: ' #ed2863',
                  borderRadius: '5px',
                  backgroundColor: '#f8f8f8',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word'
                }}
              >
                {state.accountExtraData?.stellar_seed}
              </Typography>
              <Typography display='inline' style={{ color: '#666' }}>
                {'Store it in a safe place. '}
              </Typography>
              <Link
                variant='body1'
                component='button'
                onClick={() => {
                  setState({ ...state, infoMessage: undefined });
                  setShowSecretKey(false);
                }}
              >
                Dismiss
              </Link>
            </div>
          )}
        </Box>
        <Divider sx={{ marginBottom: '20px', marginTop: '20px' }} />
        <Box>
          <Typography variant='h6'>{state.accountSecret ? 'Edit' : 'Connect existing'} account</Typography>
          <Typography variant='caption'>
            To import your existing Stellar account into Pendulum, please paste your secret key here. It wont be shared,
            only stored locally.
          </Typography>
          <TextField
            id='name'
            label='Account name'
            type='text'
            fullWidth
            variant='outlined'
            style={{ marginBottom: '2em', marginTop: '2em' }}
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
          <TextField
            id='secret-key'
            label='Stellar secret key'
            type='password'
            fullWidth
            variant='outlined'
            style={{ marginBottom: '2em' }}
            value={accountSecret}
            onChange={(e) => setAccountSecret(e.target.value)}
          />
          <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
            {state.accountSecret && (
              <Button
                onClick={forgetAccount}
                variant='text'
                style={{ fontSize: '12px', color: '#ed2863', alignSelf: 'flex-end' }}
              >
                Forget account
              </Button>
            )}
            <span>
              <Button onClick={props.onClose} style={{ alignSelf: 'flex-start' }}>
                Cancel
              </Button>
              <Button onClick={connectAccount} style={{ alignSelf: 'flex-start' }}>
                {state.accountSecret ? 'Save' : 'Connect account'}
              </Button>
            </span>
          </Box>
        </Box>
      </Box>
    </Popover>
  );
}
