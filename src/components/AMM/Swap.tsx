import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import BigNumber from 'big.js';
import React from 'react';
import { Asset, assetEquals } from '../../lib/assets';
import { usePromiseTracker } from '../../lib/promises';
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
    if (assetEquals(assetIn, AMM_ASSETS[0])) {
      submission.track(swap(returnedAmount, true).catch(console.error)).catch(console.error);
    } else {
      submission.track(swap(returnedAmount, false).catch(console.error)).catch(console.error);
    }
  }, [assetIn, returnedAmount, swap, submission]);

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
        type='number'
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
