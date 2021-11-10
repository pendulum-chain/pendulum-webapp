import React from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';

type AssetTextFieldProps = TextFieldProps & {
  assetCode: React.ReactNode;
  assetStyle?: React.CSSProperties;
  integerOnly?: boolean;
};

export const AssetTextField = React.memo(function AssetTextField(props: AssetTextFieldProps) {
  const { assetCode, assetStyle, integerOnly = true, onChange: textFieldOnChange, ...textfieldProps } = props;

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (integerOnly) {
        const value = e.target.value;
        if (value.match(/^\d*$/)) {
          textFieldOnChange && textFieldOnChange(e);
        }
      } else {
        textFieldOnChange && textFieldOnChange(e);
      }
    },
    [integerOnly, textFieldOnChange]
  );

  return (
    <TextField
      {...textfieldProps}
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
      onChange={onChange}
      style={{
        ...textfieldProps.style
      }}
    />
  );
});

export default AssetTextField;
