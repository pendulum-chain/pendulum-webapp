import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BigNumber from 'big.js';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import { AMM_ASSETS, AMM_LP_TOKEN_CODE, BalancePair } from '.';
import { BALANCE_FACTOR } from '../../lib/api';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  supplyRow: {
    display: 'flex',
    flexDirection: 'row',
    padding: 10
  },
  icon: {
    alignSelf: 'baseline',
    marginRight: '15px'
  }
}));
interface Props {
  reserves: BalancePair;
  lpBalance: BigNumber;
  poolTokenTotal: BigNumber;
}

function ReservesView(props: Props) {
  const classes = useStyles();
  const { reserves, lpBalance, poolTokenTotal } = props;

  return (
    <Card
      style={{
        padding: '0.5em',
        borderRadius: '8px'
      }}
    >
      <CardHeader
        title={'Supply'}
        sx={{
          borderBottom: '1px #eee solid'
        }}
      />
      <CardContent sx={{ textAlign: 'left' }}>
        <Box className={classes.supplyRow}>
          <AccountBalanceIcon fontSize='large' className={classes.icon} />
          <Box>
            <Typography variant='body1' color='text.primary' gutterBottom>
              Pool Total Supply
            </Typography>
            <Typography color='text.primary' style={{ fontWeight: 300, fontSize: '1.2rem' }}>
              {`${poolTokenTotal.div(BALANCE_FACTOR).toString()} ${AMM_LP_TOKEN_CODE}`}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.supplyRow}>
          <PeopleAltIcon fontSize='large' className={classes.icon} />
          <Box>
            <Typography variant='body1' color='text.primary' gutterBottom>
              Your share
            </Typography>
            <Typography color='text.primary' style={{ fontWeight: 300, fontSize: '1.2rem' }}>
              {lpBalance.div(poolTokenTotal).times(100).toFixed(4, 0).toString()} {'%'}
            </Typography>
            <Typography color='text.primary' style={{ fontWeight: 300, fontSize: '1.2rem' }}>
              {lpBalance.div(BALANCE_FACTOR).toString()} {AMM_LP_TOKEN_CODE}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.supplyRow}>
          <LocalAtmIcon fontSize='large' className={classes.icon} />
          <Box>
            <Typography variant='body1' color='text.primary' gutterBottom>
              AMM
            </Typography>
            <Typography color='text.primary' style={{ fontWeight: 300, fontSize: '1.2rem' }}>
              {`${AMM_ASSETS[0].code}: ${reserves[0].div(BALANCE_FACTOR).toString()}`}
            </Typography>
            <Typography color='text.primary' style={{ fontWeight: 300, fontSize: '1.2rem' }}>
              {`${AMM_ASSETS[1].code}: ${reserves[1].div(BALANCE_FACTOR).toString()}`}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center' }}></CardActions>
    </Card>
  );
}

export default ReservesView;
