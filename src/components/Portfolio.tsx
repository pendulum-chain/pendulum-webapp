import { Box, CardHeader, createSvgIcon, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { ReactComponent as LumenSvg } from '../assets/lumen.svg';
import { ReactComponent as PenSvg } from '../assets/pen.svg';
import { ReactComponent as KsmSvg } from '../assets/ksm.svg';
import { Balance } from './PortfolioRow';
import PortfolioRow, { BalanceRow } from './PortfolioRow';
import { Key } from 'react';

const PenIcon = createSvgIcon(<PenSvg width={'32px'} height={'32px'} viewBox='0 0 32 32' />, 'PenIcon');
const KsmIcon = createSvgIcon(<KsmSvg width={'32px'} height={'32px'} viewBox='0 0 32 32' />, 'KsmIcon');
const LumenIcon = createSvgIcon(<LumenSvg width={'32px'} height={'32px'} viewBox='0 0 32 32' />, 'LumenIcon');

interface Props {
  balances: Balance[] | undefined
}

const rows: BalanceRow[] = [
  {
    icon: <PenIcon width={'32px'} height={'32px'} viewBox='0 0 32 32' />,
    assetCode: 'PEN',
    longName: 'Pendulum',
    assetBalance: { asset: 'PEN', free: '1230' },
    exchangeRateUsd: 0.125,
  },
  {
    icon: <KsmIcon width={'32px'} height={'32px'} viewBox='0 0 32 32' />,
    assetCode: 'KSM',
    longName: 'Kusama',
    assetBalance: { asset: 'KSM', free: '12.1' },
    exchangeRateUsd: 127.80,
  },
  {
    icon: <LumenIcon width={'32px'} height={'32px'} viewBox='0 0 32 32' />,
    assetCode: 'EUR',
    longName: 'Stellar',
    assetBalance: { asset: 'EUR', free: '20' },
    exchangeRateUsd: 1.1,
  },
  {
    icon: <LumenIcon width={'32px'} height={'32px'} viewBox='0 0 32 32' />,
    assetCode: 'USDC',
    longName: 'Stellar',
    assetBalance: { asset: 'USDC', free: '18' },
    exchangeRateUsd: 1,
  },
  {
    icon: <LumenIcon width={'32px'} height={'32px'} viewBox='0 0 32 32' />,
    assetCode: 'TZS',
    longName: 'Stellar',
    assetBalance: { asset: 'TZS', free: '18' },
    exchangeRateUsd: 0.125,
  }
];

export default function Portfolio(props: Props) {
  const balances = rows.map(({ assetBalance }) => parseFloat(assetBalance.free));
  const total = balances.reduce((sum, b) => sum += b, 0);
  return (
    <Card
      style={{
        padding: '0.5em'
      }}
    >
      <CardContent>
        <Box sx={{ backgroundColor: '#fff', borderRadius: '20px', padding: '10px', marginBottom: '1em' }}>
          <Typography variant='h5'>Portfolio</Typography>
          <Box sx={{ alignContent: 'center', justifyContent: 'center' }}>
            <Typography variant='caption'>Total balance</Typography>
            <Typography variant='h6'>${total}</Typography>
          </Box>
        </Box>
        {
          rows.map(row => (<PortfolioRow key={row.assetCode as Key} data={row} />))
        }
      </CardContent>
    </Card >
  );
}
