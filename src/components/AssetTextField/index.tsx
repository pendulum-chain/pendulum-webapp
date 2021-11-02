import React from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';

type AssetTextFieldProps = TextFieldProps & {
  assetCode: React.ReactNode;
  assetStyle?: React.CSSProperties;
};

export const AssetTextField = React.memo(function AssetTextField(props: AssetTextFieldProps) {
  const { assetCode, assetStyle, ...textfieldProps } = props;
  return (
    <TextField
      {...textfieldProps}
      inputProps={{
        pattern: '[0-9]*',
        inputMode: 'decimal'
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment
            disableTypography
            position='end'
            style={{
              pointerEvents: typeof assetCode === 'string' ? 'none' : undefined,
              ...assetStyle
            }}
          >
            {assetCode}
          </InputAdornment>
        ),
        ...textfieldProps.InputProps,
        style: { paddingRight: 0 }
      }}
      style={{
        ...textfieldProps.style
      }}
    />
  );
});

export default AssetTextField;
