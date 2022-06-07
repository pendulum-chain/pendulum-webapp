import AddIcon from '@mui/icons-material/Add';
import { Tooltip } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import BigNumber from 'big.js';
import React from 'react';
import { AMM_ASSETS, AMM_LP_TOKEN_CODE, BalancePair } from '.';
import { useGlobalState } from '../../GlobalStateProvider';
import { AmmContractType, BALANCE_FACTOR } from '../../lib/api';
import { Asset, assetEquals } from '../../lib/assets';
import { usePromiseTracker } from '../../lib/promises';
import AssetSelector from '../AssetSelector';
import AssetTextField from '../AssetTextField';

const MINIMUM_LIQUIDITY = 1; // TODO fetch from AMM

function calculateDeposit(asset: Asset, amount: BigNumber, reserves: BalancePair, poolTokenTotal: BigNumber) {
  const [amount0, amount1] = assetEquals(asset, AMM_ASSETS[0])
    ? [amount, reserves[0].gt(0) ? amount.times(reserves[1]).div(reserves[0]) : amount]
    : [reserves[1].gt(0) ? amount.times(reserves[0]).div(reserves[1]) : amount, amount];

  // scale amounts to pendulum scale
  const [amount0NativeScale, amount1NativeScale] = [amount0.times(BALANCE_FACTOR), amount1.times(BALANCE_FACTOR)];

  const liquidityNativeScale =
    poolTokenTotal.eq(0) || reserves[0].eq(0) || reserves[1].eq(0)
      ? amount0NativeScale.times(amount1NativeScale).sqrt().minus(MINIMUM_LIQUIDITY)
      : BigNumber(
          (() => {
            const a = amount0NativeScale.times(poolTokenTotal).div(reserves[0]);
            const b = amount1NativeScale.times(poolTokenTotal).div(reserves[1]);
            return a.lt(b) ? a : b; // Math.min(a,b);
          })()
        );

  const liquidity = liquidityNativeScale.div(BALANCE_FACTOR);

  const deposit = {
    depositAmounts: { amount0, amount1 },
    liquidityTokens: liquidity.round(2, 0 /* round down */)
  } as const;

  return deposit;
}

interface Props {
  deposit: AmmContractType['depositAsset'];
  reserves: BalancePair;
  poolTokenTotal: BigNumber;
}

function DepositView(props: Props) {
  const { deposit, reserves, poolTokenTotal } = props;
  const { state, setState } = useGlobalState();

  const selectableAssets = AMM_ASSETS;

  const [error, setError] = React.useState<string | null>(null);
  const [userAmount, setUserAmount] = React.useState('1');
  const [calculatedAmount, setCalculatedAmount] = React.useState('');
  const [asset1, setAsset1] = React.useState<Asset>(selectableAssets[0]);
  const [asset2, setAsset2] = React.useState<Asset>(selectableAssets[1]);
  const [estimatedLPT, setEstimatedLPT] = React.useState('');
  const submission = usePromiseTracker();

  React.useEffect(() => {
    if (userAmount) {
      try {
        const result = calculateDeposit(asset1, BigNumber(userAmount), reserves, poolTokenTotal);

        if (result.depositAmounts.amount0.lt(0) || result.depositAmounts.amount1.lt(0)) {
          setError('Invalid amount');
        } else {
          if (assetEquals(asset1, AMM_ASSETS[0])) {
            setCalculatedAmount(String(result.depositAmounts.amount1));
          } else {
            setCalculatedAmount(String(result.depositAmounts.amount0));
          }

          setEstimatedLPT(String(result.liquidityTokens));
          setError(null);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setCalculatedAmount('');
      setEstimatedLPT('');
    }
  }, [userAmount, asset1, reserves, poolTokenTotal]);

  const onProvideClick = React.useCallback(() => {
    const depositAsset1 = assetEquals(asset1, AMM_ASSETS[0]);
    submission
      .track(
        deposit(userAmount, depositAsset1).catch((e) =>
          setState({ ...state, toast: { message: e?.message, type: 'error' } })
        )
      )
      .then(() => setState({ ...state, toast: { message: 'Deposit successful!', type: 'success' } }))
      .catch((e) => setState({ ...state, toast: { message: e?.message, type: 'error' } }));
  }, [asset1, deposit, userAmount, submission, state, setState]);

  return (
    <>
      <Card
        sx={{
          background: '#fff'
        }}
      >
        <CardContent>
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
            error={Boolean(error)}
            integerOnly={false}
            type='number'
            fullWidth
            margin='normal'
            value={userAmount}
            onChange={(e) => setUserAmount(e.target.value)}
          />
          <AddIcon htmlColor='#999' />
          <AssetTextField
            assetCode={<AssetSelector assets={selectableAssets} disabled value={asset2} />}
            disabled
            fullWidth
            margin='none'
            value={calculatedAmount}
          />
          {estimatedLPT && (
            <Typography mb={1} mt={3}>
              Estimated return: {estimatedLPT}{' '}
              <Tooltip title='Used for tracking your contribution to the liquidity pool'>
                <b>{AMM_LP_TOKEN_CODE}</b>
              </Tooltip>
            </Typography>
          )}
        </CardContent>
      </Card>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 1 }}>
        <Button
          color='primary'
          disabled={!userAmount || submission.state === 'pending'}
          startIcon={submission.state === 'pending' ? <CircularProgress size={16} /> : null}
          variant='contained'
          onClick={onProvideClick}
        >
          Provide
        </Button>
      </Box>
    </>
  );
}

export default DepositView;
