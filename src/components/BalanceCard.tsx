import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalState } from '../GlobalStateProvider';
import PendulumApi from '../lib/api';
import Faucet from '../lib/faucet';
import { Balance } from './PortfolioRow';

const MIN_BALANCE = 100;

interface Props {
  balance: Balance;
}

export default function BalanceCard(props: Props) {
  const { state } = useGlobalState();
  let { balance: prevBalance } = props;
  const [newBalance, setNewBalance] = useState<Balance>(prevBalance);
  const [loading, setLoading] = useState(false);

  const isNative = prevBalance.asset === 'PEN';
  const shouldGetMoreTokens = parseInt(newBalance.free) < MIN_BALANCE;

  const getPenTokensFromFaucet = async () => {
    const faucet = new Faucet();
    if (state.accountExtraData?.address && shouldGetMoreTokens) {
      setLoading(true);
      await faucet.send(state.accountExtraData?.address, MIN_BALANCE);
      setLoading(false);
    }
  };

  useEffect(() => {
    async function bind() {
      const api = PendulumApi.get();
      const address = state.accountExtraData?.address;
      if (address) {
        api.bindToBalance(address, prevBalance.asset, setNewBalance);
      }
    }
    bind();
  }, [state.accountExtraData, prevBalance]);

  return (
    <Card
      style={{
        padding: '0.5em'
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
        {isNative ? (
          <Tooltip
            title={`If your balance is low enough (less than ${MIN_BALANCE} PEN), you can always ask the Pendulum faucet to give you some more tokens.`}
            arrow
          >
            <span style={{ width: '100%' }}>
              <LoadingButton
                disabled={!shouldGetMoreTokens}
                loading={loading}
                onClick={() => getPenTokensFromFaucet()}
                fullWidth
                variant='outlined'
              >
                Get tokens
              </LoadingButton>
            </span>
          </Tooltip>
        ) : (
          <>
            <Tooltip title='Bridge to Stellar' arrow>
              <Link to='/bridge' style={{ textDecoration: 'none' }}>
                <Button fullWidth variant='outlined'>
                  Deposit
                </Button>
              </Link>
            </Tooltip>
            <Tooltip title='Bridge to Stellar' arrow>
              <Link to='/bridge' style={{ textDecoration: 'none' }}>
                <Button fullWidth variant='contained'>
                  Withdraw
                </Button>
              </Link>
            </Tooltip>
          </>
        )}
      </CardActions>
    </Card>
  );
}
