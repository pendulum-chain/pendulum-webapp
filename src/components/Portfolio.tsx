import { CardHeader, createSvgIcon, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { ReactComponent as LumenSvg } from '../assets/lumen.svg';
import { ReactComponent as PenSvg } from '../assets/pen.svg';
import { ReactComponent as KsmSvg } from '../assets/ksm.svg';
import { Balance } from './PortfolioRow';
import PortfolioRow, { BalanceRow } from './PortfolioRow';

const PenIcon = createSvgIcon(<PenSvg />, 'Dashboard');
const KsmIcon = createSvgIcon(<KsmSvg />, 'Dashboard');
const LumenIcon = createSvgIcon(<LumenSvg />, 'Dashboard');

interface Props {
  balances: Balance[] | undefined
}

const rows: BalanceRow[] = [
  {
    icon: PenIcon,
    assetCode: 'PEN',
    longName: 'Pendulum',
    assetBalance: { asset: 'PEN', free: '1230' },
    exchangeRateUsd: 0.125,
  },
  {
    icon: KsmIcon,
    assetCode: 'KSM',
    longName: 'Kusama',
    assetBalance: { asset: 'KSM', free: '12.1' },
    exchangeRateUsd: 127.80,
  },
  {
    icon: LumenIcon,
    assetCode: 'EUR',
    longName: 'Stellar',
    assetBalance: { asset: 'EUR', free: '20' },
    exchangeRateUsd: 1.1,
  },
  {
    icon: LumenIcon,
    assetCode: 'USDC',
    longName: 'Stellar',
    assetBalance: { asset: 'USDC', free: '18' },
    exchangeRateUsd: 1,
  },
  {
    icon: LumenIcon,
    assetCode: 'TZS',
    longName: 'Stellar',
    assetBalance: { asset: 'TZS', free: '18' },
    exchangeRateUsd: 0.125,
  }
];

export default function Portfolio(props: Props) {
  return (
    <Card
      style={{
        padding: '0.5em'
      }}
    >
      <CardHeader>
        <Typography variant='h5'>Portfolio</Typography>
      </CardHeader>
      <CardContent>
        {
          rows.map(row => (<PortfolioRow data={row} />))
        }
      </CardContent>
    </Card>
  );
}
