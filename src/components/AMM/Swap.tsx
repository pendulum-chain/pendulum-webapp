import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Asset, assetEquals } from '../../lib/assets';
import { usePromiseTracker } from '../../lib/promises';
import AssetSelector from '../AssetSelector';
import AssetTextField from '../AssetTextField';
import { AMM_ASSETS } from './';

interface Props {}

function SwapView(props: Props) {
  const [amount, setAmount] = React.useState('');
  const [returnedAmount, setReturnedAmount] = React.useState('');

  const [assetIn, setAssetIn] = React.useState<Asset>(AMM_ASSETS[0]);
  const [assetOut, setAssetOut] = React.useState<Asset>(AMM_ASSETS[1]);

  const selectableAssets = AMM_ASSETS;

  const [mode, setMode] = React.useState<'in' | 'out'>('in');
  const submission = usePromiseTracker();

  React.useEffect(() => {
    if (amount && assetIn && assetOut) {
      const result = { out: { amount: 0 }, in: { amount: 0 } };
      setReturnedAmount(mode === 'in' ? String(result.out.amount) : String(result.in.amount));
    } else {
      setReturnedAmount('');
    }
  }, [amount, assetIn, assetOut, mode]);

  const swapMode = React.useCallback(() => {
    setMode((prev) => {
      if (prev === 'in') {
        return 'out';
      } else {
        return 'in';
      }
    });
  }, []);

  const onSwapClick = React.useCallback(() => {
    // TODO send transaction
  }, []);

  const disabled = !amount || !assetIn || !assetOut;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography component='h1' variant='h4' align='center' color='text.primary' gutterBottom>
        Swap
      </Typography>
      <AssetTextField
        assetCode={
          <AssetSelector
            assets={selectableAssets}
            onChange={(asset) => {
              setAssetIn(asset);
              const otherAsset = selectableAssets.find((a) => !assetEquals(a, asset));
              if (otherAsset) setAssetOut(otherAsset);
            }}
            value={mode === 'in' ? assetIn : assetOut}
          />
        }
        fullWidth
        label={mode === 'in' ? 'You spend' : 'You receive'}
        margin='normal'
        placeholder={mode === 'in' ? 'Amount you want to spend' : 'Amount you expect to receive'}
        type='number'
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <AssetTextField
        assetCode={<AssetSelector assets={selectableAssets} disabled showXLM value={mode === 'in' ? assetOut : assetIn} />}
        disabled
        fullWidth
        label={mode === 'in' ? 'You receive' : 'You spend'}
        margin='normal'
        placeholder={mode === 'in' ? 'Amount of the asset you want to put in' : 'Amount of the asset you want to get out'}
        type='number'
        value={returnedAmount}
      />
      <Button
        color='primary'
        disabled={disabled}
        variant='outlined'
        startIcon={submission.state === 'pending' ? <CircularProgress size={16} /> : null}
        style={{ marginTop: 16 }}
        onClick={onSwapClick}
      >
        Swap Assets
      </Button>
    </Box>
  );
}

export default SwapView;
