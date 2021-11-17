import { AppBar, Button, createSvgIcon, Divider, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import { ReactComponent as DiscordSvg } from '../assets/font-awesome-icons/discord-brands.svg';
import { ReactComponent as EnvelopeSvg } from '../assets/font-awesome-icons/envelope-open-text-solid.svg';
import { ReactComponent as MediumSvg } from '../assets/font-awesome-icons/medium-brands.svg';
import { ReactComponent as TelegramSvg } from '../assets/font-awesome-icons/telegram-brands.svg';
import { ReactComponent as TwitterSvg } from '../assets/font-awesome-icons/twitter-brands.svg';

const MediumIcon = createSvgIcon(<MediumSvg />, 'Medium');
const TwitterIcon = createSvgIcon(<TwitterSvg />, 'Twitter');
const TelegramIcon = createSvgIcon(<TelegramSvg />, 'Telegram');
const EnvelopeIcon = createSvgIcon(<EnvelopeSvg />, 'Newsletter');
const DiscordIcon = createSvgIcon(<DiscordSvg />, 'Discord');

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    fontSize: '1em',
    marginRight: '1em',
    marginLeft: '1em',
    color: theme.palette.text.secondary
  }
}));

function FooterLink(props: any) {
  return (
    <a
      href={props.href}
      target='_blank'
      rel='noreferrer'
      style={{
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      {props.children}
    </a>
  );
}

export default function Footer() {
  const classes = useStyles();
  return (
    <AppBar
      elevation={0}
      position='static'
      className='App-footer'
      color='inherit'
      style={{ display: 'flex', flexDirection: 'row' }}
    >
      <FooterLink href='https://github.com/pendulum-chain/'>
        <GitHubIcon fontSize='medium' className={classes.icon} />
      </FooterLink>

      <FooterLink href='https://twitter.com/pendulum_chain'>
        <TwitterIcon className={classes.icon} />
      </FooterLink>

      <FooterLink href='https://pendulum-chain.medium.com/'>
        <MediumIcon className={classes.icon} />
      </FooterLink>

      <FooterLink href='https://t.me/pendulum_chain'>
        <TelegramIcon className={classes.icon} />
      </FooterLink>

      <FooterLink href='https://discord.com/invite/NBGVC75Fsf'>
        <DiscordIcon className={classes.icon} />
      </FooterLink>

      <FooterLink href='https://pendulumchain.org/newsletter'>
        <EnvelopeIcon className={classes.icon} />
      </FooterLink>

      <Divider orientation='vertical' style={{ justifySelf: 'center', height: '30px' }} />

      <FooterLink href='https://pendulumchain.org/contact'>
        <Button color='secondary' variant='text' className={classes.icon} sx={{ ml: 2 }}>
          {`Contact us!`}
        </Button>
      </FooterLink>
    </AppBar>
  );
}
