import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import uiKeyring from '@polkadot/ui-keyring';
import BigNumber from 'big.js';
import React from 'react';
import { useGlobalState } from '../../GlobalStateProvider';
import PendulumApi from '../../lib/api';
import DepositView from './Deposit';
import ReservesView from './Reserves';
import SwapView from './Swap';

export const AMM_ASSETS = [
  { code: 'USDC', issuer: 'GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC' },
  { code: 'EUR', issuer: 'GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC' }
];

export const AMM_LP_TOKEN_CODE = 'USDC-EUR LP';

export type BalancePair = [BigNumber, BigNumber];

function AmmView() {
  const { state } = useGlobalState();

  const [reserves, setReserves] = React.useState<BalancePair>([BigNumber(0), BigNumber(0)]);
  const [totalSupply, setTotalSupply] = React.useState<BigNumber>(BigNumber(0));

  const contract = React.useMemo(() => {
    try {
      const userKeypair = uiKeyring.keyring.pairs.find((pair) => pair.address === state.accountExtraData?.address);
      if (userKeypair) {
        userKeypair.unlock(undefined);
        return PendulumApi.get().getAMMContract(userKeypair);
      } else {
        return undefined;
      }
    } catch (error) {
      console.error(error);
    }
  }, [state.accountExtraData]);

  React.useEffect(() => {
    if (contract) {
      contract.getReserves().then(setReserves);
      contract.getTotalSupply().then(setTotalSupply);
    }
  }, [contract]);

  return (
    <Container maxWidth='md' component='main'>
      {contract ? (
        <>
          <ReservesView reserves={reserves} />
          <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          <DepositView deposit={contract.depositAsset} reserves={reserves} poolTokenTotal={totalSupply} />
          <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          <SwapView />
        </>
      ) : (
        <Typography variant='h4'>Could not instantiate AMM contract.</Typography>
      )}
    </Container>
  );
}

export default AmmView;
