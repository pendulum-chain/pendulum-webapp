import { Card, CardHeader, CardContent, CardActions } from '@mui/material';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import { AMM_LP_TOKEN_CODE } from '.';
import { AmmContractType } from '../../lib/api';
import { usePromiseTracker } from '../../lib/promises';
import Alert from '../Alert';
import Snackbar from '@mui/material/Snackbar';
import AssetSelector from '../AssetSelector';
import AssetTextField from '../AssetTextField';

interface Props {
  withdraw: AmmContractType['withdrawAsset'];
}

function WithdrawalView(props: Props) {
  const { withdraw } = props;
  const [toast, setToast] = React.useState<string | undefined>(undefined);
  const [userAmount, setUserAmount] = React.useState('');
  const submission = usePromiseTracker();

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
        borderRadius: '8px',
        border: '1px #eee solid'
      }}
    >
      <CardHeader
        title={'Withdraw'}
        titleTypographyProps={{ align: 'center' }}
        sx={{
          borderBottom: '1px #eee solid'
        }}
      />
      <CardContent sx={{ mb: 3, mt: 3 }}>
        <AssetTextField
          assetCode={
            <AssetSelector
              assets={[{ code: AMM_LP_TOKEN_CODE, issuer: 'none' }]}
              value={{ code: AMM_LP_TOKEN_CODE, issuer: 'none' }}
              disabled
            />
          }
          fullWidth
          label={`Amount`}
          placeholder='Amount of tokens to withdraw'
          value={userAmount}
          onChange={(e) => setUserAmount(e.target.value)}
        />
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
