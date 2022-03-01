import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import BigNumber from 'big.js';
import React from 'react';
import { AmmContractType } from '../../lib/api';
import { Asset, assetEquals } from '../../lib/assets';
import { usePromiseTracker } from '../../lib/promises';
import AssetSelector from '../AssetSelector';
import AssetTextField from '../AssetTextField';
import { AMM_ASSETS, BalancePair } from './';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useGlobalState } from '../../GlobalStateProvider';

function calculateSwap(amountToReceive: string, assetToReceive: Asset, reserves: BalancePair) {
  const assetToSend = assetEquals(assetToReceive, AMM_ASSETS[0]) ? AMM_ASSETS[1] : AMM_ASSETS[0];
  const amountToSend = assetEquals(assetToSend, AMM_ASSETS[0])
    ? BigNumber(amountToReceive)
        .times(reserves[1])
        .div(reserves[0].minus(BigNumber(amountToReceive)))
    : BigNumber(amountToReceive)
        .times(reserves[0])
        .div(reserves[1].minus(BigNumber(amountToReceive)));

  return { amountToSend, assetToSend };
}

interface Props {
  swap: AmmContractType['swapAsset'];
  reserves: BalancePair;
}

function SwapView(props: Props) {
  const { swap, reserves } = props;

  const { state, setState } = useGlobalState();

  const [error, setError] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState('');
  const [returnedAmount, setReturnedAmount] = React.useState('');

  const [assetIn, setAssetIn] = React.useState<Asset>(AMM_ASSETS[0]);
  const [assetOut, setAssetOut] = React.useState<Asset>(AMM_ASSETS[1]);

  const selectableAssets = AMM_ASSETS;

  const submission = usePromiseTracker();

  React.useEffect(() => {
    if (amount && assetIn && assetOut) {
      const result = calculateSwap(amount, assetIn, reserves);
      if (result.amountToSend.lt(0)) {
        setError('Invalid amount');
        setReturnedAmount('');
      } else {
        setError(null);
        setReturnedAmount(result.amountToSend.toString());
      }
    } else {
      setError(null);
      setReturnedAmount('');
    }
  }, [amount, assetIn, assetOut, reserves]);

  const onSwapClick = React.useCallback(() => {
    const swapAsset1 = assetEquals(assetIn, AMM_ASSETS[0]);

    submission
      .track(
        swap(amount, swapAsset1).catch((e) => setState({ ...state, toast: { message: e?.message, type: 'error' } }))
      )
      .then(() => setState({ ...state, toast: { message: 'Swap successful!', type: 'success' } }))
      .catch((e) => setState({ ...state, toast: { message: e?.message, type: 'error' } }));
  }, [assetIn, amount, swap, submission, state, setState]);

  const disabled = !amount || !assetIn || !assetOut || submission.state === 'pending';

  return (
    <Card
      style={{
        padding: '0.5em',
        borderRadius: '8px'
      }}
    >
      <CardHeader
        title={'Swap'}
        titleTypographyProps={{ align: 'center' }}
        sx={{
          borderBottom: '1px #eee solid'
        }}
      />
      <CardContent>
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
          error={Boolean(error)}
          integerOnly={false}
          type='number'
          fullWidth
          label={error ? error : 'You receive'}
          margin='normal'
          placeholder={'Amount you expect to receive'}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <CompareArrowsIcon htmlColor='#999' />
        <AssetTextField
          assetCode={<AssetSelector assets={selectableAssets} disabled showXLM value={assetIn} />}
          disabled
          fullWidth
          label={'You spend'}
          margin='none'
          placeholder={'Amount of the asset you want to get out'}
          value={returnedAmount}
        />
      </CardContent>
      <CardActions sx={{ justifyContent: 'center' }}>
        <Button
          color='primary'
          disabled={disabled}
          variant='contained'
          startIcon={submission.state === 'pending' ? <CircularProgress size={16} /> : null}
          style={{ marginTop: 16 }}
          onClick={onSwapClick}
        >
          Swap Assets
        </Button>
      </CardActions>
    </Card>
  );
}

export default SwapView;
