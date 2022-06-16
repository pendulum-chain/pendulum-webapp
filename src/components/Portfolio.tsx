import { Box, CardHeader, createSvgIcon, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Key, useState } from 'react';
// import { ReactComponent as KsmSvg } from '../assets/ksm.svg';
import { ReactComponent as PenSvg } from '../assets/pen.svg';
import { ReactComponent as LumenSvg } from '../assets/xlm.svg';
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

// FIXME this needs to take the exchange rate into account

export default function Portfolio(props: Props) {
  const [total, setTotal] = useState<number>(0);
  const [gain, setGain] = useState<number>(0)
  const recalculateTotal = () => {
    const balances = Array.from(rows.values()).map(({ assetBalance, exchangeRateUsd }) => parseFloat(assetBalance.free) * exchangeRateUsd);
    setTotal(balances.reduce((sum, b) => (sum += b), 0));
  }

  function updateAndRecalculateTotal(asset: string, newBalance: Balance) {
    let val = rows.get(asset);
    if (val) {
      val.assetBalance = newBalance;
      rows.set(asset, val);
      // setGain(Math.round(val?.exchangeRateUsd * parseFloat(newBalance.free) * 100) / 100);
    }
    recalculateTotal();
  }

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
          <Typography variant='h5'>${total}</Typography>
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
            + ${gain} + {gain === 0 ? 0 : Math.round(total / gain * 100) / 100}%
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
    </Card >
  );
}
