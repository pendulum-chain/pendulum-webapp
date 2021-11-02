import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CardHeader } from '@mui/material';

export default function BalanceCard(props: any) {
  let { balance } = props;
  return (<Card
    style={{
      padding: '0.5em',
      borderRadius: '8px'
    }}
  >
    <CardHeader
      title={balance.asset}
      titleTypographyProps={{ align: 'center' }}
      subheaderTypographyProps={{
        align: 'center',
      }}
      sx={{
        borderBottom: '1px #eee solid'
      }}
    />
    <CardContent>
      <Typography component="h2" variant="h6" color="text.primary">
        {balance.free}
      </Typography>
      <Typography sx={{ color: "#aaa", mb:2 }}>
        Free balance
      </Typography>

      <Typography sx={{ color: "#aaa" }}>
        {balance.reserved} reserved
      </Typography>
      <Typography sx={{ color: "#aaa" }}>
        {balance.frozen} frozen
      </Typography>
    </CardContent>
    <CardActions>
      <Button fullWidth variant='outlined'>Send</Button>
      <Button fullWidth variant='contained'>Receive</Button>
    </CardActions>
  </Card>)
}
