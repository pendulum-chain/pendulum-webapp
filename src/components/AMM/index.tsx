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

  return (
    <Card sx={{ padding: 2, maxWidth: '600px', margin: 'auto', width: '50%' }}>
      {contract ? (
        <AmmTabs reserves={reserves} totalSupply={totalSupply} contract={contract} lpBalance={lpBalance} />
      ) : (
        <Container maxWidth='sm' component='main'>
          <Typography component='h1' variant='h4' align='center' color='text.primary' margin='1.2em 0'>
            Not ready yet...
          </Typography>
        </Container>
      )}
    </Card>
  );
}

export default AmmView;
