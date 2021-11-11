import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import uiKeyring from '@polkadot/ui-keyring';
import BigNumber from 'big.js';
import React from 'react';
import { useGlobalState } from '../../GlobalStateProvider';
import PendulumApi from '../../lib/api';
import { SupportedAssetsMap } from '../../lib/assets';
import AmmTabs from './Tabs';
export const AMM_ASSETS = [SupportedAssetsMap['USDC'], SupportedAssetsMap['EUR']];

export const AMM_LP_TOKEN_CODE = 'LPT';

export type BalancePair = [BigNumber, BigNumber];

function AmmView() {
  const { state } = useGlobalState();

  const [reserves, setReserves] = React.useState<BalancePair>([BigNumber(0), BigNumber(0)]);
  const [lpBalance, setLpBalance] = React.useState<BigNumber>(BigNumber(0));
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
        contract.getLpBalance().then(setLpBalance).catch(console.error);
        contract.getTotalSupply().then(setTotalSupply).catch(console.error);
      }
    };
    const interval = setInterval(fetchValues, 5000);
    fetchValues();
    return () => clearInterval(interval);
  }, [contract]);

  return (
    <Box sx={{ width: '100%', paddingBottom: 2 }}>
      {contract ? (
        <AmmTabs reserves={reserves} totalSupply={totalSupply} contract={contract} lpBalance={lpBalance} />
      ) : (
        <Typography variant='h6'>Could not instantiate AMM contract.</Typography>
      )}
    </Box>
  );
}

export default AmmView;
