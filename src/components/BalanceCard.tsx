import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box, CardHeader } from '@mui/material';

export default function BalanceCard(props: any) {
  let { balance } = props;
  return (<Card
    sx={{
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'baseline',
          mb: 2,
        }}
      >
        <Typography component="h2" variant="h6" color="text.primary">
        {balance.amount} {balance.asset}
        </Typography>
      </Box>
        <Typography key={balance.free}>
            Free balance including staking rewards
        </Typography>
    </CardContent>
    <CardActions>
      <Button fullWidth variant='outlined'>{balance.button1}</Button>
      <Button fullWidth variant='contained'>{balance.button2}</Button>
    </CardActions>
  </Card>)
}
