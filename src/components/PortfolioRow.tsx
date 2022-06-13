import { IconProps, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { ReactElement } from 'react';

interface Props {
  data: BalanceRow;
}

export interface Balance {
  asset: string;
  free: string;
  reserved?: string;
  frozen?: string;
}

export interface BalanceRow {
  icon: ReactElement<IconProps>;
  assetCode: String;
  longName: String;
  assetBalance: Balance;
  exchangeRateUsd: number;
}

export default function PortfolioRow(props: Props) {
  // const { state } = useGlobalState();
  let { icon, assetCode, longName, assetBalance, exchangeRateUsd } = props.data;
  // const [newBalance, setNewBalance] = useState<Balance>(prevBalance);

  // const shouldGetMoreTokens = parseInt(newBalance.free) < MIN_BALANCE;

  // const getPenTokensFromFaucet = async () => {
  //   const faucet = new Faucet();
  //   if (state.accountExtraData?.address && shouldGetMoreTokens) {
  //     setLoading(true);
  //     await faucet.send(state.accountExtraData?.address, MIN_BALANCE);
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   async function bind() {
  //     const api = PendulumApi.get();
  //     const address = state.accountExtraData?.address;
  //     if (address) {
  //       api.bindToBalance(address, prevBalance.asset, setNewBalance);
  //     }
  //   }
  //   bind();
  // }, [state.accountExtraData, prevBalance]);

  return (
    <Grid container spacing={5}>
      <Grid item xs={1}>
        {icon}
      </Grid>
      <Grid item xs={3}>
        <Typography variant={'body1'}>{assetCode}</Typography>
        <Typography fontWeight={'light'}>{longName}</Typography>
      </Grid>
      <Grid item xs={3} sx={{ textAlign: 'end' }}>
        <Typography fontWeight={'light'} variant='body1'>
          ${exchangeRateUsd}
        </Typography>
        <Typography fontWeight={'light'}>{parseFloat(assetBalance.free)}</Typography>
      </Grid>
      <Grid item xs={3} sx={{ textAlign: 'end' }}>
        <Typography>${Math.round(parseFloat(assetBalance.free) * exchangeRateUsd * 100) / 100}</Typography>
        <Typography> </Typography>
      </Grid>
    </Grid>
  );
}
