import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { useEffect, useState } from 'react';
import { useGlobalState } from '../GlobalStateProvider';
import PendulumApi from '../lib/api';
import Faucet from '../lib/faucet';
import { SvgIcon } from '@mui/material';

const MIN_BALANCE = 100;

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
  icon: typeof SvgIcon,
  assetCode: String,
  longName: String,
  assetBalance: Balance,
  exchangeRateUsd: Number
};

export default function PortfolioRow(props: Props) {
  const { state } = useGlobalState();
  let { assetBalance: prevBalance } = props.data;
  const [newBalance, setNewBalance] = useState<Balance>(prevBalance);
  const [loading, setLoading] = useState(false);

  const isNative = prevBalance.asset === 'PEN';
  const shouldGetMoreTokens = parseInt(newBalance.free) < MIN_BALANCE;

  const getPenTokensFromFaucet = async () => {
    const faucet = new Faucet();
    if (state.accountExtraData?.address && shouldGetMoreTokens) {
      setLoading(true);
      await faucet.send(state.accountExtraData?.address, MIN_BALANCE);
      setLoading(false);
    }
  };

  useEffect(() => {
    async function bind() {
      const api = PendulumApi.get();
      const address = state.accountExtraData?.address;
      if (address) {
        api.bindToBalance(address, prevBalance.asset, setNewBalance);
      }
    }
    bind();
  }, [state.accountExtraData, prevBalance]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        PEN
      </Grid>
      <Grid item xs={6}>
        Toekn
      </Grid>
      <Grid item xs={6}>
        Blsbla
      </Grid>
    </Grid>
  );
}
