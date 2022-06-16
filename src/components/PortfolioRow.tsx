import { IconProps, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { ReactElement, useEffect, useState } from 'react';
import { useGlobalState } from '../GlobalStateProvider';
import PendulumApi from '../lib/api';

interface Props {
  data: BalanceRow;
  update: (asset: string, balance: Balance) => void;
}

export interface Balance {
  asset: string;
  free: string;
  reserved?: string;
  frozen?: string;
}

export interface BalanceRow {
  icon: ReactElement<IconProps>;
  longName: String;
  assetBalance: Balance;
  exchangeRateUsd: number;
}

export default function PortfolioRow(props: Props) {
  const { state } = useGlobalState();
  const { update: updateParent } = props;
  let { icon, longName, assetBalance: prevBalance, exchangeRateUsd } = props.data;
  const [newBalance, setNewBalance] = useState<Balance>(prevBalance);

  // const shouldGetMoreTokens = parseInt(newBalance.free) < MIN_BALANCE;

  // const getPenTokensFromFaucet = async () => {
  //   const faucet = new Faucet();
  //   if (state.accountExtraData?.address && shouldGetMoreTokens) {
  //     setLoading(true);
  //     await faucet.send(state.accountExtraData?.address, MIN_BALANCE);
  //     setLoading(false);
  //   }
  // };


  useEffect(() => {
    function updateBalance(b: Balance) {
      updateParent(prevBalance.asset, b);
      setNewBalance(b);
    }

    async function bind() {
      const api = PendulumApi.get();
      const address = state.accountExtraData?.address;
      if (address) {
        api.bindToBalance(address, prevBalance.asset, updateBalance);
      }
    }
    bind();
  }, [state.accountExtraData, prevBalance, updateParent]);

  return (
    <Grid container spacing={5}>
      <Grid item xs={1}>
        {icon}
      </Grid>
      <Grid item xs={3}>
        <Typography variant={'body1'}>{prevBalance.asset}</Typography>
        <Typography fontWeight={'light'}>{longName}</Typography>
      </Grid>
      <Grid item xs={3} sx={{ textAlign: 'end' }}>
        <Typography fontWeight={'light'} variant='body1'>
          ${exchangeRateUsd}
        </Typography>
        <Typography fontWeight={'light'}>{parseFloat(newBalance.free)}</Typography>
      </Grid>
      <Grid item xs={3} sx={{ textAlign: 'end' }}>
        <Typography>${Math.round(parseFloat(newBalance.free) * exchangeRateUsd * 100) / 100}</Typography>
        <Typography> </Typography>
      </Grid>
    </Grid>
  );
}
