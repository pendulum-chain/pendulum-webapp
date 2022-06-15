import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import BigNumber from 'big.js';
import React from 'react';
import { useAMMContract } from '../../hooks/useAMMContract';
import { DefaultAssetsMap } from '../../lib/assets';
import AmmTabs from './Tabs';

export const AMM_ASSETS = [DefaultAssetsMap['USDC'], DefaultAssetsMap['EUR']];

export const AMM_LP_TOKEN_CODE = 'LPT';

export type BalancePair = [BigNumber, BigNumber];

function AmmView() {
  const [reserves, setReserves] = React.useState<BalancePair>([BigNumber(0), BigNumber(0)]);
  const [lpBalance, setLpBalance] = React.useState<BigNumber>(BigNumber(0));
  const [totalSupply, setTotalSupply] = React.useState<BigNumber>(BigNumber(0));

  const contract = useAMMContract();

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

  // if (!state.accountSecret) {
  //   return (
  //     <>
  //       <Container maxWidth='sm' component='main'>
  //         <Typography component='h1' variant='h4' align='center' color='text.primary' margin='1.2em 0'>
  //           Connect your account
  //         </Typography>
  //       </Container>
  //       \{' '}
  //     </>
  //   );
  // }

  return (
    <Card sx={{ paddingBottom: 2, margin: '1.2em 0' }}>
      {contract ? (
        <AmmTabs reserves={reserves} totalSupply={totalSupply} contract={contract} lpBalance={lpBalance} />
      ) : (
        <Container maxWidth='sm' component='main'>
          <Typography component='h1' variant='h4' align='center' color='text.primary' margin='1.2em 0'>
            Could not instantiate AMM contract
          </Typography>
        </Container>
      )}
    </Card>
  );
}

export default AmmView;
