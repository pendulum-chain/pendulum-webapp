import { Box, CardHeader, createSvgIcon, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Key, useCallback, useEffect, useState } from 'react';
// import { ReactComponent as KsmSvg } from '../assets/ksm.svg';
import { ReactComponent as PenSvg } from '../../assets/pen.svg';
import { ReactComponent as LumenSvg } from '../../assets/xlm.svg';
import { useGlobalState } from '../../GlobalStateProvider';
import { useExchangeRates } from '../../hooks/useExchangeRate';
import { useRealTimeBalances } from '../../hooks/useRealTimeBalances';
import { stringifyAsset } from '../../lib/assets';
import PortfolioRow from './PortfolioRow';

const PenIcon = createSvgIcon(<PenSvg width={'37px'} height={'37px'} viewBox='0 0 37 37' />, 'PenIcon');
// const KsmIcon = createSvgIcon(<KsmSvg width={'32px'} height={'32px'} viewBox='0 0 32 32' />, 'KsmIcon');
const LumenIcon = createSvgIcon(<LumenSvg width={'32px'} height={'32px'} viewBox='0 0 128 128' />, 'LumenIcon');

interface Props {}

export default function Portfolio(props: Props) {
  const { state } = useGlobalState();

  const { balancePairs, nativeBalance } = useRealTimeBalances(state.accountExtraData);
  const { assetExchangeRates, nativeExchangeRate } = useExchangeRates(
    balancePairs.map((b) => b.asset),
    'USD'
  );

  const [total, setTotal] = useState<number>(0);
  const [gain] = useState<number>(0);

  const recalculateTotal = useCallback(() => {
    let sum = parseFloat(nativeBalance.free) * nativeExchangeRate;
    balancePairs.forEach((bp) => {
      const rate = assetExchangeRates.get(bp.asset);
      if (rate !== undefined) {
        sum += parseFloat(bp.pendulumBalance.free) * rate;
      }
    });

    setTotal(sum);
  }, [balancePairs, assetExchangeRates, nativeBalance, nativeExchangeRate]);

  useEffect(() => {
    recalculateTotal();
  }, [recalculateTotal]);

  const round = (n: number) => {
    return Math.round(n * 1000) / 1000;
  };

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
          <PortfolioRow
            assetBalance={nativeBalance}
            longName='Pendulum'
            exchangeRateUsd={0.125}
            icon={<PenIcon viewBox='0 0 32 32' />}
          />
          {balancePairs.map((bp, index) => (
            <Box
              key={stringifyAsset(bp.asset) as Key}
              sx={{ marginTop: index === 0 ? 1 : 0, marginBottom: index !== balancePairs.length - 1 ? 1 : 0 }}
            >
              <PortfolioRow
                assetBalance={bp.pendulumBalance}
                longName='Stellar'
                exchangeRateUsd={assetExchangeRates.get(bp.asset) || 0}
                icon={<LumenIcon viewBox='0 0 32 32' />}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
