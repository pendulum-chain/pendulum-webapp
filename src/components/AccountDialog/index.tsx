import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useEffect, useState } from 'react';
import { useGlobalState } from '../../GlobalStateProvider';
import PendulumApi from '../../lib/api';
import OneClickSetup from '../../lib/OneClickSetup';

interface Props {
  caller: Element | null;
  onClose: () => void;
  open: boolean;
}

export default function AccountDialog(props: Props) {
  const { state, setState } = useGlobalState();
  const [accountName, setAccountName] = useState(state.accountName || '');
  const [accountSecret, setAccountSecret] = useState(state.accountSecret || '');
  const [secretFormat, setSecretFormat] = useState<'stellar' | 'hexa'>('hexa');
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [revealSecretInInput, setRevealSecretInInput] = useState(false);

  const api = PendulumApi.get();

  useEffect(() => {
    localStorage.setItem('state', JSON.stringify(state));
  }, [state]);

  const handleOneClickSetup = async () => {
    const setup = new OneClickSetup();
    setup.setNotifyCallback((infoMessage: string) => setState({ ...state, infoMessage }));

    setLoadingSetup(true);
    const res = await setup.createAccount();
    if (res) {
      setState({ ...state, ...res, infoMessage: undefined });
      setAccountName(res.accountName);
      setAccountSecret(res.accountSecret);
      setShowSecretKey(true);
    }
    setLoadingSetup(false);
  };

  const forgetAccount = () => {
    setState({ ...state, accountName: '', accountSecret: '', accountExtraData: undefined });
    setAccountName('');
    setAccountSecret('');
  };

  const connectAccount = () => {
    const accountExtraData = api.addAccount(accountSecret, accountName);
    setState({ ...state, accountName, accountSecret, accountExtraData });
    close();
  };

  const toggleSecretFormat = () => {
    setSecretFormat(secretFormat === 'hexa' ? 'stellar' : 'hexa');
  };

  const close = () => {
    setRevealSecretInInput(false);
    props.onClose();
  };

  return (
    <Popover
      open={props.open}
      onClose={close}
      anchorEl={props.caller}
      sx={{
        position: 'absolute',
        top: '70px',
        right: '20px'
      }}
    >
      <Box
        sx={{
          width: '450px',
          padding: '20px',
          border: '1px solid #e9e9e9',
          borderRadius: '20px'
        }}
      >
        <Box style={{ textAlign: 'center' }}>
          <LoadingButton
            style={{ margin: '10px 0' }}
            loading={loadingSetup}
            onClick={() => handleOneClickSetup()}
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
            type={revealSecretInInput ? 'text' : 'password'}
            fullWidth
            variant='outlined'
            style={{ marginBottom: '2em' }}
            value={secretFormat === 'hexa' ? accountSecret : state.accountExtraData?.stellar_seed}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  {revealSecretInInput && (
                    <Tooltip
                      title={secretFormat === 'hexa' ? 'Show secret in Stellar format' : 'Show secret in hexa format'}
                    >
                      <Button
                        onClick={() => toggleSecretFormat()}
                        variant='text'
                        color='secondary'
                        size='small'
                        style={{
                          borderRadius: '9px',
                          width: '40px',
                          minWidth: 0,
                          padding: 0,
                          textTransform: 'none'
                        }}
                      >
                        {secretFormat === 'hexa' ? 'S' : '0x'}
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip title='Reveal password'>
                    <IconButton
                      aria-label='Reveal/hide password'
                      onClick={() => setRevealSecretInInput(!revealSecretInInput)}
                      onMouseDown={() => setRevealSecretInInput(!revealSecretInInput)}
                    >
                      {revealSecretInInput ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
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
