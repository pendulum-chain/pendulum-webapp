import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import BigNumber from 'big.js';
import { AMM_ASSETS, AMM_LP_TOKEN_CODE, BalancePair } from '.';

interface Props {
  reserves: BalancePair;
  poolTokenTotal: BigNumber;
}

function ReservesView(props: Props) {
  const { reserves, poolTokenTotal } = props;

  return (
    <Box display='flex' flexDirection='column' alignItems='center'>
      <Typography variant='h4' align='center' color='text.primary' gutterBottom>
        Reserves
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography variant='h6' align='center' color='text.primary' gutterBottom>
          {`${AMM_ASSETS[0].code}: ${reserves[0]}`}
        </Typography>
        <Divider orientation='vertical' flexItem sx={{ marginX: 2 }} />
        <Typography variant='h6' align='center' color='text.primary' gutterBottom>
          {`${AMM_ASSETS[1].code}: ${reserves[1]}`}
        </Typography>
      </Box>
      <Typography variant='h4' align='center' color='text.primary' gutterBottom>
        Total Pool Token Supply
      </Typography>
      <Typography variant='h6' align='center' color='text.primary' gutterBottom>
        {`${poolTokenTotal} ${AMM_LP_TOKEN_CODE}`}
      </Typography>
    </Box>
  );
}

export default ReservesView;
