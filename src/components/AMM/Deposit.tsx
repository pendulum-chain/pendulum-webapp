import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import BigNumber from 'big.js';
import React from 'react';
import { AMM_ASSETS, AMM_LP_TOKEN_CODE, BalancePair } from '.';
import { Asset, assetEquals } from '../../lib/assets';
import { usePromiseTracker } from '../../lib/promises';
import AssetSelector from '../AssetSelector';
import AssetTextField from '../AssetTextField';

const MINIMUM_LIQUIDITY = 1; // TODO fetch from AMM

function calculateDeposit(asset: Asset, amount: BigNumber, reserves: BalancePair, poolTokenTotal: BigNumber) {
  const [amount0, amount1] = assetEquals(asset, AMM_ASSETS[0])
    ? [amount, reserves[0].gt(0) ? amount.times(reserves[1]).div(reserves[0]) : amount]
    : [reserves[1].gt(0) ? amount.times(reserves[0]).div(reserves[1]) : amount, amount];

  const liquidity = poolTokenTotal.eq(0)
    ? amount0.times(amount1).sqrt().minus(MINIMUM_LIQUIDITY)
    : BigNumber(
        Math.min(
          amount0.times(poolTokenTotal).div(reserves[0]).toNumber(),
          amount1.times(poolTokenTotal).div(reserves[1]).toNumber()
        )
      );

  const deposit = {
    depositAmounts: { amount0, amount1 },
    liquidityTokens: liquidity.round(2, 0 /* round down */)
  } as const;

  return deposit;
}

interface Props {
  deposit: (amount: string, depositAsset1: boolean) => Promise<void>;
  reserves: BalancePair;
  poolTokenTotal: BigNumber;
}

function DepositView(props: Props) {
  const { deposit, reserves, poolTokenTotal } = props;

  const selectableAssets = AMM_ASSETS;

  const [userAmount, setUserAmount] = React.useState('');
  const [calculatedAmount, setCalculatedAmount] = React.useState('');
  const [asset1, setAsset1] = React.useState<Asset>(selectableAssets[0]);
  const [asset2, setAsset2] = React.useState<Asset>(selectableAssets[1]);
  const [estimatedLPT, setEstimatedLPT] = React.useState('');
  const submission = usePromiseTracker();

  React.useEffect(() => {
    if (userAmount) {
      try {
        const result = calculateDeposit(asset1, BigNumber(userAmount), reserves, poolTokenTotal);

        if (assetEquals(asset1, AMM_ASSETS[0])) {
          setCalculatedAmount(String(result.depositAmounts.amount1));
        } else {
          setCalculatedAmount(String(result.depositAmounts.amount0));
        }

        setEstimatedLPT(String(result.liquidityTokens));
      } catch (error) {
        console.error(error);
      }
    } else {
      setCalculatedAmount('');
      setEstimatedLPT('');
    }
  }, [userAmount, asset1, reserves, poolTokenTotal]);

  const onProvideClick = React.useCallback(() => {
    if (assetEquals(asset1, AMM_ASSETS[0])) {
      submission.track(deposit(userAmount, true).catch(console.error)).catch(console.error);
    } else {
      submission.track(deposit(userAmount, false).catch(console.error)).catch(console.error);
    }
  }, [asset1, deposit, userAmount, submission]);

  return (
    <Box display='flex' flexDirection='column' alignItems='center'>
      <Typography component='h1' variant='h4' align='center' color='text.primary' gutterBottom>
        Deposit
      </Typography>
      <AssetTextField
        assetCode={
          <AssetSelector
            assets={selectableAssets}
            onChange={(asset) => {
              setAsset1(asset);
              const otherAsset = selectableAssets.find((a) => !assetEquals(a, asset));
              if (otherAsset) setAsset2(otherAsset);
            }}
            value={asset1}
          />
        }
        fullWidth
        label={`Amount ${asset1.code}`}
        placeholder='Amount of tokens you want to deposit'
        type='number'
        value={userAmount}
        onChange={(e) => setUserAmount(e.target.value)}
      />
      <Typography variant='h5' style={{ marginTop: 16 }}>
        +
      </Typography>
      <AssetTextField
        assetCode={<AssetSelector assets={selectableAssets} disabled value={asset2} />}
        disabled
        fullWidth
        label={`Amount ${asset2.code}`}
        placeholder='Amount of tokens you want to deposit'
        type='number'
        value={calculatedAmount}
      />
      {estimatedLPT && (
        <Typography style={{ margin: '24px 0 16px' }} variant='h6'>
          Estimated return: {estimatedLPT} {AMM_LP_TOKEN_CODE}
        </Typography>
      )}
      <Button
        color='primary'
        disabled={!userAmount || submission.state === 'pending'}
        startIcon={submission.state === 'pending' ? <CircularProgress size={16} /> : null}
        variant='outlined'
        style={{ marginTop: 16 }}
        onClick={onProvideClick}
      >
        Provide
      </Button>
    </Box>
  );
}

export default DepositView;
