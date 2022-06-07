import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { textAlign } from '@mui/system';

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
    <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
      {assetCode}
      <TextField
        {...textfieldProps}
        InputProps={{ disableUnderline: true }}
        onChange={onChange}
        inputProps={{ style: { textAlign: 'end', fontSize: 'x-large' } }}
        variant='standard'
        fullWidth={false}
        style={{
          flexGrow: 6,
          ...textfieldProps.style
        }}
      />
    </Box>
  );
});

export default AssetTextField;
