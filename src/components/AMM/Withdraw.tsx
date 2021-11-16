import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import BigNumber from 'big.js';
import React from 'react';
import { AMM_ASSETS, AMM_LP_TOKEN_CODE, BalancePair } from '.';
import { AmmContractType } from '../../lib/api';
import { usePromiseTracker } from '../../lib/promises';
import Alert from '../Alert';
import AssetSelector from '../AssetSelector';
import AssetTextField from '../AssetTextField';

function calculateWithdraw(amount: BigNumber, reserves: BalancePair, poolTokenTotal: BigNumber) {
  const amount0 = poolTokenTotal.gt(0) ? amount.times(reserves[0]).div(poolTokenTotal) : BigNumber(0);
  const amount1 = poolTokenTotal.gt(0) ? amount.times(reserves[1]).div(poolTokenTotal) : BigNumber(0);

  const withdrawAmounts: BalancePair = [amount0, amount1];

  return withdrawAmounts;
}

interface Props {
  withdraw: AmmContractType['withdrawAsset'];
  reserves: BalancePair;
  poolTokenTotal: BigNumber;
}

function WithdrawalView(props: Props) {
  const { reserves, poolTokenTotal, withdraw } = props;
  const [toast, setToast] = React.useState<string | undefined>(undefined);
  const [userAmount, setUserAmount] = React.useState('');
  const submission = usePromiseTracker();

  const [estimatedReturns, setEstimatedReturns] = React.useState<BalancePair | undefined>(undefined);

  React.useEffect(() => {
    if (userAmount) {
      try {
        const result = calculateWithdraw(BigNumber(userAmount), reserves, poolTokenTotal);

        setEstimatedReturns(result);
      } catch (error) {
        console.error(error);
      }
    } else {
      setEstimatedReturns(undefined);
    }
  }, [userAmount, reserves, poolTokenTotal]);

  const onWithdrawClick = React.useCallback(() => {
    submission
      .track(withdraw(userAmount).catch((e) => setToast(e?.message)))
      .then(() => setToast('Withdrawal successful!'))
      .catch((e) => setToast(e?.message));
  }, [submission, userAmount, withdraw]);

  return (
    <Card
      style={{
        padding: '0.5em',
        borderRadius: '8px'
      }}
    >
      <CardHeader
        title={'Withdraw'}
        sx={{
          borderBottom: '1px #eee solid'
        }}
      />
      <CardContent sx={{ mb: 3 }}>
        <Typography align='left' sx={{ mb: 3 }}>
          LPT stands for Liquidity Pool Token. You'll receive the specified amount in the balance of both USDC and EUR.
        </Typography>
        <AssetTextField
          assetCode={
            <AssetSelector
              assets={[{ code: AMM_LP_TOKEN_CODE, issuer: 'none' }]}
              value={{ code: AMM_LP_TOKEN_CODE, issuer: 'none' }}
              disabled
            />
          }
          fullWidth
          integerOnly={false}
          type='number'
          label={`Amount`}
          placeholder='Amount of tokens to withdraw'
          value={userAmount}
          onChange={(e) => setUserAmount(e.target.value)}
        />
        {estimatedReturns && (
          <Typography
            variant='body1'
            mb={1}
            mt={3}
          >{`The estimated returns for your LPT are ${estimatedReturns[0].toFixed(8)} ${
            AMM_ASSETS[0].code
          } and ${estimatedReturns[1].toFixed(8)} ${AMM_ASSETS[1].code}`}</Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'center' }}>
        <Button
          color='primary'
          disabled={!userAmount || submission.state === 'pending'}
          startIcon={submission.state === 'pending' ? <CircularProgress size={16} /> : null}
          variant='contained'
          onClick={onWithdrawClick}
        >
          Withdraw
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

export default WithdrawalView;
