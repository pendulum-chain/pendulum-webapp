import { Card, CardHeader, CardContent, CardActions } from '@mui/material';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import BigNumber from 'big.js';
import React from 'react';
import { AMM_ASSETS, AMM_LP_TOKEN_CODE, BalancePair } from '.';
import { AmmContractType } from '../../lib/api';
import { Asset, assetEquals } from '../../lib/assets';
import { usePromiseTracker } from '../../lib/promises';
import Alert from '../Alert';
import Snackbar from '@mui/material/Snackbar';
import AssetSelector from '../AssetSelector';
import AssetTextField from '../AssetTextField';

const MINIMUM_LIQUIDITY = 1; // TODO fetch from AMM

function calculateDeposit(asset: Asset, amount: BigNumber, reserves: BalancePair, poolTokenTotal: BigNumber) {
  const [amount0, amount1] = assetEquals(asset, AMM_ASSETS[0])
    ? [amount, reserves[0].gt(0) ? amount.times(reserves[1]).div(reserves[0]) : amount]
    : [reserves[1].gt(0) ? amount.times(reserves[0]).div(reserves[1]) : amount, amount];

  const liquidity =
    poolTokenTotal.eq(0) || reserves[0].eq(0) || reserves[1].eq(0)
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
  deposit: AmmContractType['depositAsset'];
  reserves: BalancePair;
  poolTokenTotal: BigNumber;
}

function DepositView(props: Props) {
  const { deposit, reserves, poolTokenTotal } = props;

  const selectableAssets = AMM_ASSETS;

  const [toast, setToast] = React.useState<string | undefined>(undefined);

  const [error, setError] = React.useState<string | null>(null);
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
      .track(deposit(userAmount, depositAsset1).catch((e) => setToast(e?.message)))
      .then(() => setToast('Deposit successful!'))
      .catch((e) => setToast(e?.message));
  }, [asset1, deposit, userAmount, submission]);

  return (
    <Card
      style={{
        padding: '0.5em',
        borderRadius: '8px',
        border: '1px #eee solid'
      }}
    >
      <CardHeader
        title={'Add liquidity'}
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
                setAsset1(asset);
                const otherAsset = selectableAssets.find((a) => !assetEquals(a, asset));
                if (otherAsset) setAsset2(otherAsset);
              }}
              value={asset1}
            />
          }
          error={Boolean(error)}
          fullWidth
          label={error ? error : `Amount ${asset1.code}`}
          placeholder='Amount of tokens you want to deposit'
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
          value={calculatedAmount}
        />
        {estimatedLPT && (
          <Typography style={{ margin: '24px 0 16px' }} variant='h6'>
            Estimated return: {estimatedLPT} {AMM_LP_TOKEN_CODE}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'center' }}>
        <Button
          color='primary'
          disabled={!userAmount || submission.state === 'pending'}
          startIcon={submission.state === 'pending' ? <CircularProgress size={16} /> : null}
          variant='outlined'
          onClick={onProvideClick}
        >
          Provide
        </Button>
      </CardActions>
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
    </Card>
  );
}

export default DepositView;
