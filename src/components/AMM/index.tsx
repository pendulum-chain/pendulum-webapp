import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import BigNumber from 'big.js';
import DepositView from './Deposit';
import ReservesView from './Reserves';
import SwapView from './Swap';

export const AMM_ASSETS = [
  { code: 'USDC', issuer: 'GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC' },
  { code: 'EUR', issuer: 'GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC' }
];

export const AMM_LP_TOKEN_CODE = 'USDC_EUR_LPT';

export type BalancePair = [BigNumber, BigNumber];

function AmmView() {
  const reserves: BalancePair = [BigNumber(0), BigNumber(0)];
  const poolTokenTotal = BigNumber(0);
  return (
    <Container maxWidth='md' component='main'>
      <ReservesView reserves={reserves} />
      <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
      <DepositView reserves={reserves} poolTokenTotal={poolTokenTotal} />
      <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
      <SwapView />
    </Container>
  );
}

export default AmmView;
