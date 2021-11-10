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

type AmmTabsProps = {
  reserves: BalancePair;
  totalSupply: BigNumber;
  contract: AmmContractType;
};

export default function AmmTabs(props: AmmTabsProps) {
  const [value, setValue] = React.useState('1');
  const { contract, reserves, totalSupply } = props;
  const deposit: AmmContractType['depositAsset'] = contract.depositAsset;

  const tabChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={tabChange} centered>
            <Tab label='Provide' value='1' />
            <Tab label='Swap' value='2' />
            <Tab label='Rewards' value='3' />
            <Tab label='Total reserves' value='4' />
          </TabList>
        </Box>
        <Box sx={{ margin: '1em 10em' }}>
          <TabPanel value='1'>
            <DepositView deposit={deposit} reserves={reserves} poolTokenTotal={totalSupply} />
          </TabPanel>
          <TabPanel value='2'>
            <SwapView swap={contract.swapAsset} reserves={reserves} />
          </TabPanel>
          <TabPanel value='3'>Comming soon</TabPanel>
          <TabPanel value='4'>
            <ReservesView reserves={reserves} poolTokenTotal={totalSupply} />
          </TabPanel>
        </Box>
      </TabContext>
    </Box>
  );
}
