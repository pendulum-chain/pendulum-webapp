import { Box, CardHeader, createSvgIcon, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Key, useCallback, useEffect, useState } from 'react';
// import { ReactComponent as KsmSvg } from '../assets/ksm.svg';
import { ReactComponent as PenSvg } from '../assets/pen.svg';
import { ReactComponent as LumenSvg } from '../assets/xlm.svg';
import { useGlobalState } from '../GlobalStateProvider';
import PendulumApi from '../lib/api';
import PortfolioRow, { Balance, BalanceRow } from './PortfolioRow';

const PenIcon = createSvgIcon(<PenSvg width={'32px'} height={'32px'} viewBox='0 0 32 32' />, 'PenIcon');
// const KsmIcon = createSvgIcon(<KsmSvg width={'32px'} height={'32px'} viewBox='0 0 32 32' />, 'KsmIcon');
const LumenIcon = createSvgIcon(<LumenSvg width={'32px'} height={'32px'} viewBox='0 0 32 32' />, 'LumenIcon');

interface Props {
  balances: Balance[] | undefined;
}

const rows = new Map<string, BalanceRow>();

rows.set('PEN', {
  icon: <PenIcon width={'32px'} height={'32px'} viewBox='0 0 32 32' />,
  longName: 'Pendulum',
  assetBalance: { asset: 'PEN', free: '0' },
  exchangeRateUsd: 0.125
});
rows.set('EUR', {
  icon: <LumenIcon width={'32px'} height={'32px'} viewBox='0 0 32 32' />,
  longName: 'Stellar',
  assetBalance: { asset: 'EUR', free: '0' },
  exchangeRateUsd: 1.1
});

rows.set('USDC', {
  icon: <LumenIcon width={'32px'} height={'32px'} viewBox='0 0 32 32' />,
  longName: 'Stellar',
  assetBalance: { asset: 'USDC', free: '0' },
  exchangeRateUsd: 1
});

export default function Portfolio(props: Props) {
  const { state } = useGlobalState();
  const [balances, setBalances] = useState<Balance[] | undefined>(undefined);
  const [total, setTotal] = useState<number>(0);
  const [gain] = useState<number>(0);
  const recalculateTotal = () => {
    const balances = Array.from(rows.values()).map(
      ({ assetBalance, exchangeRateUsd }) => parseFloat(assetBalance.free) * exchangeRateUsd
    );
    setTotal(balances.reduce((sum, b) => (sum += b), 0));
  };

  const round = (n: number) => {
    return Math.round(n * 1000) / 1000;
  };

  const updateAndRecalculateTotal = (asset: string, newBalance: Balance) => {
    let val = rows.get(asset);
    if (val) {
      val.assetBalance = newBalance;
      rows.set(asset, val);
      // setGain(round(val?.exchangeRateUsd * parseFloat(newBalance.free)));
    }
    recalculateTotal();
  };

  const addBalancesToRows = useCallback((fetchedBalances: Balance[]) => {
    fetchedBalances.forEach((b) => {
      let val = rows.get(b.asset);
      console.log(b);
      if (val) {
        val.assetBalance = b;
        rows.set(b.asset, val);
      }
    });
  }, []);

  useEffect(() => {
    async function fetch() {
      const api = PendulumApi.get();
      const address = state.accountExtraData?.address;
      if (address) {
        try {
          let fetchedBalances = await api.getBalances(address);
          setBalances((prevBalances) => {
            addBalancesToRows(prevBalances || fetchedBalances);
            return fetchedBalances;
          });
          recalculateTotal();
        } catch (error) {
          console.error('Could not fetch balances', error);
          setBalances([]);
        }
      } else {
        setBalances([]);
      }
    }
    fetch();
  }, [addBalancesToRows, state, state.currentNode]);

  return (
    <Card sx={{ padding: '1em 0' }}>
      <CardHeader title='Portfolio' />
      <CardContent sx={{ padding: 0 }}>
        <Box
          sx={{
            alignItems: 'center',
            background: '#fff',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 2,
            marginTop: 1,
            padding: 2
          }}
        >
          <Typography variant='caption'>Total balance</Typography>
          <Typography variant='h5'>${round(total)}</Typography>
          <Typography
            variant='caption'
            style={{
              color: '#229322',
              fontWeight: 100,
              padding: '0.5em 1em',
              marginTop: '0.5em',
              backgroundColor: '#F8F8F8',
              borderRadius: '40px'
            }}
          >
            + ${gain} + {gain === 0 ? 0 : round(total / gain)}%
          </Typography>
        </Box>
        <Box sx={{ padding: 2 }}>
          {Array.from(rows.values()).map((row, index) => (
            <Box
              key={row.assetBalance.asset as Key}
              sx={{ marginTop: index === 0 ? 1 : 0, marginBottom: index !== rows.size - 1 ? 1 : 0 }}
            >
              <PortfolioRow data={row} update={updateAndRecalculateTotal} />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
