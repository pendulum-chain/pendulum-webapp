import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import BigNumber from 'big.js';
import React from 'react';
import { useGlobalState } from '../../GlobalStateProvider';
import { AmmContractType } from '../../lib/api';
import { Asset, assetEquals } from '../../lib/assets';
import { usePromiseTracker } from '../../lib/promises';
import AssetSelector from '../AssetSelector';
import AssetTextField from '../AssetTextField';
import { Balance } from '../PortfolioRow';
import { AMM_ASSETS, BalancePair } from './';

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

interface AssetSelectionInfoProps {
  asset: Asset;
  balance?: Balance;
  onMaxClick?: () => void;
}

function AssetSelectionInfo(props: AssetSelectionInfoProps) {
  const { asset, balance, onMaxClick } = props;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 1 }}>
      <Typography variant='caption' sx={{ flexGrow: 1 }}>
        {balance ? `Balance: ${balance.free}` : ''}
      </Typography>
      {onMaxClick && (
        <Button onClick={onMaxClick} variant='text' sx={{ flexGrow: 1, color: 'black' }}>
          MAX
        </Button>
      )}
      <Typography variant='caption' sx={{ flexGrow: 1, textAlign: 'right' }}>
        ~$300.00
      </Typography>
    </Box>
  );
}

interface Props {
  balances?: Balance[];
  swap: AmmContractType['swapAsset'];
  reserves: BalancePair;
}

function SwapView(props: Props) {
  const { balances, swap, reserves } = props;

  console.log('balancse', balances);

  const { state, setState } = useGlobalState();

  const [error, setError] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState('1');
  const [returnedAmount, setReturnedAmount] = React.useState('');

  const [assetIn, setAssetIn] = React.useState<Asset>(AMM_ASSETS[0]);
  const [assetOut, setAssetOut] = React.useState<Asset>(AMM_ASSETS[1]);

  const selectableAssets = AMM_ASSETS;

  const submission = usePromiseTracker();

  React.useEffect(() => {
    if (amount && assetIn && assetOut) {
      try {
        const result = calculateSwap(amount, assetIn, reserves);
        if (result.amountToSend.lt(0)) {
          setError('Invalid amount');
          setReturnedAmount('');
        } else {
          setError(null);
          setReturnedAmount(result.amountToSend.toString());
        }
      } catch (error) {
        console.error(error);
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
    <>
      <Card
        sx={{
          background: '#fff',
          marginTop: 1
        }}
      >
        <CardContent>
          <Box>
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
              margin='normal'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <AssetSelectionInfo
              asset={assetOut}
              balance={balances?.find((b) => b.asset.toLowerCase() === assetOut.code.toLowerCase())}
              onMaxClick={() => undefined}
            />
          </Box>
          <Box sx={{ position: 'relative', marginTop: 3, marginBottom: 6 }}>
            <Divider sx={{ position: 'absolute', width: '100%' }} />
            <Avatar sx={{ position: 'absolute', left: '50%', top: -20, background: '#fff', border: 'black' }}>
              <ArrowUpwardIcon htmlColor='#999' />
            </Avatar>
          </Box>
          <AssetTextField
            assetCode={<AssetSelector assets={selectableAssets} disabled showXLM value={assetIn} />}
            disabled
            fullWidth
            margin='normal'
            value={returnedAmount}
          />
          <AssetSelectionInfo asset={assetIn} />
        </CardContent>
      </Card>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 1 }}>
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
      </Box>
    </>
  );
}

export default SwapView;
