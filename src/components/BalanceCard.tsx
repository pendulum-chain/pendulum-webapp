import { useState, useEffect } from 'react';
import { Card, CardActions, CardContent, Tooltip, Button, Typography } from '@mui/material';
import PendulumApi from '../lib/api';
import { Balance } from './Balances';
import { useGlobalState } from '../GlobalStateProvider';

export default function BalanceCard(props: any) {
  const { state } = useGlobalState();
  let { balance: prevBalance } = props;
  const [newBalance, setNewBalance] = useState<Balance>(prevBalance);

  useEffect(() => {
    async function bind() {
      const api = await PendulumApi.get();
      const address = state.accountExtraData?.address;
      if (address) {
        api.bindToBalance(address, prevBalance.asset, setNewBalance);
      }
    }
    bind();
  }, [state, prevBalance, setNewBalance]);

  return (
    <Card
      style={{
        padding: '0.5em',
        borderRadius: '8px'
      }}
    >
      <CardContent>
        <Typography component='h2' color='text.primary' style={{ fontWeight: 300, fontSize: '1.5rem' }}>
          {newBalance.free}
        </Typography>
        <Typography sx={{ color: '#aaa', mb: 2 }}>Free balance</Typography>
        <Typography sx={{ color: '#aaa' }}>{newBalance.reserved} reserved</Typography>
        <Typography sx={{ color: '#aaa' }}>{newBalance.frozen} frozen</Typography>
      </CardContent>
      <CardActions>
        <Tooltip title='Bridge to Stellar' arrow>
          <Button fullWidth variant='outlined'>
            Send
          </Button>
        </Tooltip>
        <Tooltip title='Bridge to Stellar' arrow>
          <Button fullWidth variant='contained'>
            Receive
          </Button>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
