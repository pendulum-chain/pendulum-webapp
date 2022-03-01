import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import BigNumber from 'big.js';

import { useGlobalState } from '../../GlobalStateProvider';
import PendulumApi from '../../lib/api';
import { DefaultAssetsMap } from '../../lib/assets';
import AmmTabs from './Tabs';

export const AMM_ASSETS = [DefaultAssetsMap['USDC'], DefaultAssetsMap['EUR']];

export const AMM_LP_TOKEN_CODE = 'LPT';

export type BalancePair = [BigNumber, BigNumber];

function AmmView() {
  const { state } = useGlobalState();

  const [reserves, setReserves] = React.useState<BalancePair>([BigNumber(0), BigNumber(0)]);
  const [lpBalance, setLpBalance] = React.useState<BigNumber>(BigNumber(0));
  const [totalSupply, setTotalSupply] = React.useState<BigNumber>(BigNumber(0));

  const contract = React.useMemo(() => {
    try {
      if (state.currentNode?.amm_address && state.accountExtraData?.address) {
        const api = PendulumApi.get();
        if (state.accountExtraData === undefined) return;

        const userKeypair = api.getSubstrateKeypairfromStellarSecret(state.accountExtraData?.stellar_seed);

        if (userKeypair) {
          if (userKeypair.isLocked) {
            try {
              userKeypair.unlock(undefined);
            } catch {}
          }
          return PendulumApi.get().getAMMContract(userKeypair, state.currentNode?.amm_address);
        } else {
          return undefined;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [state.accountExtraData, state.currentNode]);

  React.useEffect(() => {
    const fetchValues = () => {
      if (contract) {
        contract.getReserves().then(setReserves).catch(console.error);
        contract.getLpBalance().then(setLpBalance).catch(console.error);
        contract.getTotalSupply().then(setTotalSupply).catch(console.error);
      }
    };
    const interval = setInterval(fetchValues, 2000);
    fetchValues();
    return () => clearInterval(interval);
  }, [contract]);

  if (!state.accountSecret) {
    return (
      <>
        <Container maxWidth='sm' component='main'>
          <Typography component='h1' variant='h4' align='center' color='text.primary' margin='01em 0'>
            Connect your account
          </Typography>
        </Container>
        \{' '}
      </>
    );
  }

  return (
    <Box sx={{ width: '100%', paddingBottom: 2 }}>
      {contract ? (
        <AmmTabs reserves={reserves} totalSupply={totalSupply} contract={contract} lpBalance={lpBalance} />
      ) : (
        <Container maxWidth='sm' component='main'>
          <Typography component='h1' variant='h4' align='center' color='text.primary' margin='01em 0'>
            Could not instantiate AMM contract
          </Typography>
        </Container>
      )}
    </Box>
  );
}

export default AmmView;
