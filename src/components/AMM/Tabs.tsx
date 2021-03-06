import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import DepositView from './Deposit';
import ReservesView from './Reserves';
import SwapView from './Swap';
import BigNumber from 'big.js';
import { BalancePair } from '.';
import { AmmContractType } from '../../lib/api';
import { TabContext, TabPanel, TabList } from '@mui/lab';
import WithdrawalView from './Withdraw';

type AmmTabsProps = {
  contract: AmmContractType;
  lpBalance: BigNumber;
  reserves: BalancePair;
  totalSupply: BigNumber;
};

export default function AmmTabs(props: AmmTabsProps) {
  const [value, setValue] = React.useState('1');
  const { contract, reserves, lpBalance, totalSupply } = props;
  const deposit: AmmContractType['depositAsset'] = contract.depositAsset;

  const tabChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box>
      <TabContext value={value}>
        <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={tabChange} centered textColor='secondary' indicatorColor='secondary'>
            <Tab label='Swap' value='1' />
            <Tab label='Supply' value='2' />
            <Tab label='Withdraw' value='3' />
            <Tab label='Reserves' value='4' />
          </TabList>
        </Box>
        <Box
          sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
        >
          <TabPanel value='1'>
            <SwapView contract={contract} swap={contract.swapAsset} />
          </TabPanel>
          <TabPanel value='2'>
            <DepositView deposit={deposit} reserves={reserves} poolTokenTotal={totalSupply} />
          </TabPanel>
          <TabPanel value='3'>
            <WithdrawalView withdraw={contract.withdrawAsset} reserves={reserves} poolTokenTotal={totalSupply} />
          </TabPanel>
          <TabPanel value='4'>
            <ReservesView reserves={reserves} poolTokenTotal={totalSupply} lpBalance={lpBalance} />
          </TabPanel>
        </Box>
      </TabContext>
    </Box>
  );
}
