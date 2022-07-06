import Divider from '@mui/material/Divider';

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { u8aToHex, hexToU8a } from '@polkadot/util';
import PendulumApi from '../../lib/api';
import { StrKey as StellarKey } from 'stellar-base';

import { useState } from 'react';
import { Keyring } from '@polkadot/api';
import { AccountKeyPairs } from '../../interfaces';

enum EncodingType {
  Ed25519 = 'ed25519',
  Sr25519 = 'sr25519'
}

export default function Tools(props: any) {
  const [userInputKey, setUserInputKey] = useState('');
  const [hexaKeyType, setHexaKeyType] = useState<'' | 'seed' | 'public'>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stellarPrivateKey, setStellarPrivateKey] = useState('');
  const [stellarPublicKey, setStellarPublicKey] = useState('');
  const [hexaPrivateKey, setHexaPrivateKey] = useState('');
  const [hexaPublicKey, setHexaPublicKey] = useState('');
  const [ss58PublicKey, setSs58PublicKey] = useState('');

  const api = PendulumApi.get();
  const keyring = new Keyring({ type: EncodingType.Ed25519 });

  const close = () => {
    props.onClose();
  };

  const setAllKeys = (keys: AccountKeyPairs) => {
    const pair = keyring.addFromSeed(hexToU8a(keys.seed), { name: 'converter' }, EncodingType.Ed25519);
    setStellarPrivateKey(keys.stellar_seed);
    setHexaPrivateKey(keys.seed);
    setStellarPublicKey(keys.stellar_address);
    setHexaPublicKey(u8aToHex(pair.addressRaw));
    setSs58PublicKey(keyring.encodeAddress(pair.addressRaw));
  };

  const setPublicKeys = (addressRaw: Uint8Array) => {
    const pair = keyring.addFromAddress(u8aToHex(addressRaw), { name: 'converter' }, null, EncodingType.Ed25519);
    setStellarPrivateKey('');
    setHexaPrivateKey('');
    setStellarPublicKey(StellarKey.encodeEd25519PublicKey(pair.addressRaw as Buffer));
    setHexaPublicKey(u8aToHex(pair.addressRaw));
    setSs58PublicKey(keyring.encodeAddress(pair.addressRaw));
  };

  const convert = () => {
    setErrorMessage('');
    if (StellarKey.isValidEd25519SecretSeed(userInputKey)) {
      // Stellar private key provided
      setAllKeys(api.addAccount(userInputKey, 'converter'));
    } else if (StellarKey.isValidEd25519PublicKey(userInputKey)) {
      // Stellar public key provided
      setPublicKeys(StellarKey.decodeEd25519PublicKey(userInputKey));
    } else if (userInputKey.startsWith('0x')) {
      // Hexa key provided (assume private)
      if (hexaKeyType === 'seed') {
        setAllKeys(api.addAccount(userInputKey, 'converter'));
      } else if (hexaKeyType === 'public') {
        setPublicKeys(hexToU8a(userInputKey));
      }
    } else if (userInputKey.startsWith('5')) {
      // SS58 address provided
      setPublicKeys(keyring.decodeAddress(userInputKey));
    } else {
      setErrorMessage('Invalid address');
    }
  };

  const reset = () => {
    setErrorMessage('');
    setStellarPrivateKey('');
    setHexaPrivateKey('');
    setStellarPublicKey('');
    setHexaPublicKey('');
    setSs58PublicKey('');
  };

  return (
    <Popover
      open={props.open}
      onClose={close}
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
        <Box>
          <Typography variant='h6'>Tools</Typography>
          <Typography variant='caption'>
            Address encoding converter (supported formats are Stellar, raw bytes (hexa), and SS58). Paste your address
            to see the conversions.
          </Typography>
          <TextField
            id='name'
            label='Address'
            type='text'
            fullWidth
            variant='outlined'
            style={{ marginTop: '2em' }}
            value={userInputKey}
            error={!!errorMessage}
            helperText={errorMessage}
            onChange={(e) => {
              setUserInputKey(e.target.value);
              if (e.target.value.startsWith('0x')) {
                setHexaKeyType('seed');
              } else {
                setHexaKeyType('');
              }
            }}
          />
          {hexaKeyType !== '' && (
            <FormControlLabel
              control={
                <Switch
                  onChange={(v) => {
                    if (v) {
                      setHexaKeyType('public');
                    }
                  }}
                />
              }
              label='Consider as a public key'
            />
          )}
          {errorMessage === '' && stellarPublicKey !== '' && (
            <>
              <Divider sx={{ marginBottom: '20px', marginTop: '20px' }}>Stellar format</Divider>
              <Typography variant='caption'>
                {(stellarPrivateKey ? 'Private key: ' + stellarPrivateKey + '\n' : '') +
                  'Public key: ' +
                  stellarPublicKey}
              </Typography>
              <Divider sx={{ marginBottom: '20px', marginTop: '20px' }}>Raw bytes (hexa)</Divider>
              <Typography variant='caption'>
                {(hexaPrivateKey ? 'Private key: ' + hexaPrivateKey + '\n' : '') + 'Public key: ' + hexaPublicKey}
              </Typography>
              <Divider sx={{ marginBottom: '20px', marginTop: '20px' }}>SS58 format</Divider>
              <Typography variant='caption'>{'Public key: ' + ss58PublicKey}</Typography>
            </>
          )}
          <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2em' }}>
            <span>
              <Button onClick={reset} style={{ alignSelf: 'flex-start' }}>
                Reset
              </Button>
              <Button onClick={convert} style={{ alignSelf: 'flex-start' }}>
                Convert
              </Button>
            </span>
          </Box>
        </Box>
      </Box>
    </Popover>
  );
}
