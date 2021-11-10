import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import BigNumber from 'big.js';
import { Card, CardHeader, CardContent, CardActions } from '@mui/material';
import { AMM_ASSETS, AMM_LP_TOKEN_CODE, BalancePair } from '.';
import { BALANCE_FACTOR } from '../../lib/api';

interface Props {
  reserves: BalancePair;
  lpBalance: BigNumber;
  poolTokenTotal: BigNumber;
}

function ReservesView(props: Props) {
  const { reserves, lpBalance, poolTokenTotal } = props;

  return (
    <Card
      style={{
        padding: '0.5em',
        borderRadius: '8px',
        border: '1px #eee solid'
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
        <Box display='flex' flexDirection='column' justifyContent='space-evenly'>
          <Box marginBottom={2}>
            <Typography variant='h5' align='center' color='text.primary' gutterBottom>
              Pool Total Supply
            </Typography>
            <Typography variant='h6' align='center' color='text.secondary' gutterBottom>
              {`${poolTokenTotal.div(BALANCE_FACTOR).toString()} ${AMM_LP_TOKEN_CODE}`}
            </Typography>
          </Box>
          <Box display='flex' flexDirection='row' justifyContent='space-evenly'>
            <Box>
              <Typography variant='h5' align='center' color='text.primary' gutterBottom>
                User
              </Typography>
              <Typography variant='h6' align='center' color='text.secondary' gutterBottom>
                {lpBalance.div(BALANCE_FACTOR).toString()} {AMM_LP_TOKEN_CODE}
              </Typography>
            </Box>
            <Divider orientation='vertical' flexItem sx={{ marginX: 2 }} />
            <Box display='flex' flexDirection='column' alignItems='center'>
              <Typography variant='h5' align='center' color='text.primary' gutterBottom>
                AMM
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h6' align='center' color='text.secondary' gutterBottom>
                  {`${AMM_ASSETS[0].code}: ${reserves[0].div(BALANCE_FACTOR).toString()}`}
                </Typography>
                <Typography variant='h6' align='center' color='text.secondary' gutterBottom>
                  {`${AMM_ASSETS[1].code}: ${reserves[1].div(BALANCE_FACTOR).toString()}`}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center' }}></CardActions>
    </Card>
  );
}

export default ReservesView;
