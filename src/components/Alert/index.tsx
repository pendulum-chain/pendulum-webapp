import MuiAlert, { AlertProps } from '@mui/material/Alert';
import * as React from 'react';

interface Props extends AlertProps {
  children?: React.ReactNode;
}

const Alert = React.forwardRef(function Alert(props: Props, ref: React.Ref<any>) {
  return (
    <MuiAlert elevation={6} ref={ref} variant='filled' {...props}>
      {props.children}
    </MuiAlert>
  );
});

export default Alert;
