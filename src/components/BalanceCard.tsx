import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CardHeader, Tooltip } from '@mui/material';

export default function BalanceCard(props: any) {
  let { balance } = props;
  return (
    <Card
      style={{
        padding: '0.5em',
        borderRadius: '8px'
      }}
    >
      <CardContent>
        <Typography component='h2' color='text.primary' style={{ fontWeight: 300, fontSize: '1.5rem' }}>
          {balance.free}
        </Typography>
        <Typography sx={{ color: '#aaa', mb: 2 }}>Free balance</Typography>
        <Typography sx={{ color: '#aaa' }}>{balance.reserved} reserved</Typography>
        <Typography sx={{ color: '#aaa' }}>{balance.frozen} frozen</Typography>
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
