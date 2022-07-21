import { IconProps, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { ReactElement } from 'react';
import { PendulumAssetBalance } from '../../lib/api';

interface Props {
  icon: ReactElement<IconProps>;
  longName: String;
  assetBalance: PendulumAssetBalance;
  exchangeRateUsd: number;
}

export default function PortfolioRow(props: Props) {
  let { icon, longName, assetBalance, exchangeRateUsd } = props;

  // const shouldGetMoreTokens = parseInt(newBalance.free) < MIN_BALANCE;

  // const getPenTokensFromFaucet = async () => {
  //   const faucet = new Faucet();
  //   if (state.accountExtraData?.address && shouldGetMoreTokens) {
  //     setLoading(true);
  //     await faucet.send(state.accountExtraData?.address, MIN_BALANCE);
  //     setLoading(false);
  //   }
  // };

  const round = (n: number) => {
    return Math.round(n * 1000) / 1000;
  };

  return (
    <Grid container spacing={5}>
      <Grid item xs={1}>
        {icon}
      </Grid>
      <Grid item xs={3}>
        <Typography variant={'body1'}>{assetBalance.asset}</Typography>
        <Typography fontWeight={'light'}>{longName}</Typography>
      </Grid>
      <Grid item xs={3} sx={{ textAlign: 'end' }}>
        <Typography fontWeight={'light'} variant='body1'>
          ${exchangeRateUsd}
        </Typography>
        <Typography fontWeight={'light'}>{round(parseFloat(assetBalance.free))}</Typography>
      </Grid>
      <Grid item xs={3} sx={{ textAlign: 'end' }}>
        <Typography>${round(parseFloat(assetBalance.free) * exchangeRateUsd)}</Typography>
        <Typography> </Typography>
      </Grid>
    </Grid>
  );
}
