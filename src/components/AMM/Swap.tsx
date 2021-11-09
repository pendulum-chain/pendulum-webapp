import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import BigNumber from 'big.js';
import React from 'react';
import { Asset, assetEquals } from '../../lib/assets';
import { usePromiseTracker } from '../../lib/promises';
import Alert from '../Alert';
import AssetSelector from '../AssetSelector';
import AssetTextField from '../AssetTextField';
import { AMM_ASSETS, BalancePair } from './';

function calculateSwap(amountToReceive: string, assetToReceive: Asset, reserves: BalancePair) {
  const assetToSend = assetEquals(assetToReceive, AMM_ASSETS[0]) ? AMM_ASSETS[1] : AMM_ASSETS[0];
  const amountToSend = assetEquals(assetToSend, AMM_ASSETS[0])
    ? BigNumber(amountToReceive)
        .times(reserves[1])
        .div(reserves[0].minus(BigNumber(amountToReceive)))
        .toString()
    : BigNumber(amountToReceive)
        .times(reserves[0])
        .div(reserves[1].minus(BigNumber(amountToReceive)))
        .toString();

  return { amountToSend, assetToSend };
}

interface Props {
  swap: (amount: string, swapAsset1: boolean) => Promise<void>;
  reserves: BalancePair;
}

function SwapView(props: Props) {
  const { swap, reserves } = props;

  const [toast, setToast] = React.useState<string | undefined>(undefined);

  const [amount, setAmount] = React.useState('');
  const [returnedAmount, setReturnedAmount] = React.useState('');

  const [assetIn, setAssetIn] = React.useState<Asset>(AMM_ASSETS[0]);
  const [assetOut, setAssetOut] = React.useState<Asset>(AMM_ASSETS[1]);

  const selectableAssets = AMM_ASSETS;

  const submission = usePromiseTracker();

  React.useEffect(() => {
    if (amount && assetIn && assetOut) {
      const result = calculateSwap(amount, assetIn, reserves);
      setReturnedAmount(result.amountToSend);
    } else {
      setReturnedAmount('');
    }
  }, [amount, assetIn, assetOut, reserves]);

  const onSwapClick = React.useCallback(() => {
    const swapAsset1 = assetEquals(assetIn, AMM_ASSETS[0]);
    submission
      .track(swap(amount, swapAsset1).catch((e) => setToast(e?.message)))
      .then(() => setToast('Swap successful!'))
      .catch((e) => setToast(e?.message));
  }, [assetIn, amount, swap, submission]);

  const disabled = !amount || !assetIn || !assetOut || submission.state === 'pending';

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
              setAssetOut(asset);
              const otherAsset = selectableAssets.find((a) => !assetEquals(a, asset));
              if (otherAsset) setAssetIn(otherAsset);
            }}
            value={assetOut}
          />
        }
        fullWidth
        label={'You receive'}
        margin='normal'
        placeholder={'Amount you expect to receive'}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <AssetTextField
        assetCode={<AssetSelector assets={selectableAssets} disabled showXLM value={assetIn} />}
        disabled
        fullWidth
        label={'You spend'}
        margin='normal'
        placeholder={'Amount of the asset you want to get out'}
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
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={6000}
        open={Boolean(toast)}
        onClose={() => setToast(undefined)}
      >
        {submission.state === 'resolved' ? (
          <Alert severity='success'>{toast}</Alert>
        ) : (
          <Alert severity='error'>{toast}</Alert>
        )}
      </Snackbar>
    </Box>
  );
}

export default SwapView;
