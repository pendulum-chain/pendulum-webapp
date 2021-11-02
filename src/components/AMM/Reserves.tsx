import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { AMM_ASSETS, BalancePair } from '.';

interface Props {
  reserves: BalancePair;
}

function ReservesView(props: Props) {
  const { reserves } = props;

  return (
    <Box display='flex' flexDirection='column' alignItems='center'>
      <Typography component='h1' variant='h4' align='center' color='text.primary' gutterBottom>
        Reserves
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography component='h1' variant='h6' align='center' color='text.primary' gutterBottom>
          {`${AMM_ASSETS[0].code}: ${reserves[0]}`}
        </Typography>
        <Divider orientation='vertical' flexItem sx={{ marginX: 2 }} />
        <Typography component='h1' variant='h6' align='center' color='text.primary' gutterBottom>
          {`${AMM_ASSETS[1].code}: ${reserves[1]}`}
        </Typography>
      </Box>
    </Box>
  );
}

export default ReservesView;
