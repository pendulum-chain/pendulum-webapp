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
import { SupportedAssetsMap } from '../../lib/assets';

export const AMM_ASSETS = [SupportedAssetsMap['USDC'], SupportedAssetsMap['EUR']];

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
    const fetchValues = () => {
      if (contract) {
        contract.getReserves().then(setReserves).catch(console.error);
        contract.getTotalSupply().then(setTotalSupply).catch(console.error);
      }
    };
    const interval = setInterval(fetchValues, 5000);
    fetchValues();
    return () => clearInterval(interval);
  }, [contract]);

  return (
    <Container maxWidth='md' component='main' sx={{ paddingBottom: 2 }}>
      {contract ? (
        <>
          <ReservesView reserves={reserves} poolTokenTotal={totalSupply} />
          <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          <DepositView deposit={contract.depositAsset} reserves={reserves} poolTokenTotal={totalSupply} />
          <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          <SwapView swap={contract.swapAsset} reserves={reserves} />
        </>
      ) : (
        <Typography variant='h4'>Could not instantiate AMM contract.</Typography>
      )}
    </Container>
  );
}

export default AmmView;
