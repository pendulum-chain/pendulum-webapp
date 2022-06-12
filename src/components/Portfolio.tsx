import { Box, CardHeader, createSvgIcon, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { ReactComponent as LumenSvg } from '../assets/xlm.svg';
import { ReactComponent as PenSvg } from '../assets/pen.svg';
import { ReactComponent as KsmSvg } from '../assets/ksm.svg';
import { Balance } from './PortfolioRow';
import PortfolioRow, { BalanceRow } from './PortfolioRow';
import { Key } from 'react';

const PenIcon = createSvgIcon(<PenSvg width={'32px'} height={'32px'} viewBox='0 0 32 32' />, 'PenIcon');
const KsmIcon = createSvgIcon(<KsmSvg width={'32px'} height={'32px'} viewBox='0 0 32 32' />, 'KsmIcon');
const LumenIcon = createSvgIcon(<LumenSvg width={'32px'} height={'32px'} viewBox='0 0 32 32' />, 'LumenIcon');

interface Props {
  balances: Balance[] | undefined;
}

const rows: BalanceRow[] = [
  {
    icon: <PenIcon width={'32px'} height={'32px'} viewBox='0 0 32 32' />,
    assetCode: 'PEN',
    longName: 'Pendulum',
    assetBalance: { asset: 'PEN', free: '1230' },
    exchangeRateUsd: 0.125
  },
  {
    icon: <KsmIcon width={'32px'} height={'32px'} viewBox='0 0 32 32' />,
    assetCode: 'KSM',
    longName: 'Kusama',
    assetBalance: { asset: 'KSM', free: '12.1' },
    exchangeRateUsd: 127.8
  },
  {
    icon: <LumenIcon width={'32px'} height={'32px'} viewBox='0 0 32 32' />,
    assetCode: 'EUR',
    longName: 'Stellar',
    assetBalance: { asset: 'EUR', free: '20' },
    exchangeRateUsd: 1.1
  },
  {
    icon: <LumenIcon width={'32px'} height={'32px'} viewBox='0 0 32 32' />,
    assetCode: 'USDC',
    longName: 'Stellar',
    assetBalance: { asset: 'USDC', free: '18' },
    exchangeRateUsd: 1
  },
  {
    icon: <LumenIcon width={'32px'} height={'32px'} viewBox='0 0 32 32' />,
    assetCode: 'TZS',
    longName: 'Stellar',
    assetBalance: { asset: 'TZS', free: '18' },
    exchangeRateUsd: 0.125
  }
];

export default function Portfolio(props: Props) {
  const balances = rows.map(({ assetBalance }) => parseFloat(assetBalance.free));
  // FIXME this needs to take the exchange rate into account
  const total = balances.reduce((sum, b) => (sum += b), 0);
  return (
    <Card
      style={{
        padding: '0.5em'
      }}
    >
      <CardContent>
        <Typography variant='h5'>Portfolio</Typography>
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
        </Box>
        {rows.map((row, index) => (
          <Box
            key={row.assetCode as Key}
            sx={{ marginTop: index === 0 ? 1 : 0, marginBottom: index !== rows.length - 1 ? 1 : 0 }}
          >
            <PortfolioRow data={row} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
