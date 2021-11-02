import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import { makeStyles } from '@mui/styles';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import React from 'react';
import { Asset, assetEquals, stringifyAsset } from '../../lib/assets';

interface AssetItemProps {
  asset: Asset;
  disabled?: boolean;
  // key + value props are expected here from React/Material-ui validation mechanisms
  key: string;
  value: string;
}

const AssetItem = React.memo(
  React.forwardRef(function AssetItem(props: AssetItemProps, ref: React.Ref<HTMLLIElement>) {
    return (
      <MenuItem {...props} key={props.key} ref={ref} value={props.value}>
        <ListItemText>{props.asset.code}</ListItemText>
      </MenuItem>
    );
  })
);

const useAssetSelectorStyles = makeStyles({
  helperText: {
    maxWidth: 100,
    whiteSpace: 'nowrap'
  },
  input: {
    minWidth: 72
  },
  select: {
    fontSize: 18,
    fontWeight: 400
  },
  unselected: {
    opacity: 0.5
  }
});

interface AssetSelectorProps {
  autoFocus?: TextFieldProps['autoFocus'];
  assets: Asset[];
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  disabledAssets?: Asset[];
  helperText?: TextFieldProps['helperText'];
  inputError?: string;
  label?: TextFieldProps['label'];
  margin?: TextFieldProps['margin'];
  minWidth?: number | string;
  name?: string;
  onChange?: (asset: Asset) => void;
  showXLM?: boolean;
  style?: React.CSSProperties;
  value?: Asset;
}

function AssetSelector(props: AssetSelectorProps) {
  const { assets, onChange } = props;

  const classes = useAssetSelectorStyles();

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<{ name?: any; value: any }>, child: React.ComponentElement<AssetItemProps, any>) => {
      const matchingAsset = assets.find((asset) => assetEquals(asset, child.props.asset));

      if (matchingAsset) {
        if (onChange) {
          onChange(matchingAsset);
        }
      } else {
        // tslint:disable-next-line no-console
        console.error(`Invariant violation: Trustline ${child.props.asset.code} selected, but no matching asset found.`);
      }
    },
    [assets, onChange]
  );

  return (
    <TextField
      autoFocus={props.autoFocus}
      className={props.className}
      disabled={props.disabled}
      error={Boolean(props.inputError)}
      helperText={props.helperText}
      label={props.inputError ? props.inputError : props.label}
      margin={props.margin}
      onChange={handleChange as any}
      name={props.name}
      placeholder='Select an asset'
      select
      style={{ flexShrink: 0, ...props.style }}
      value={props.value ? props.value.code : ''}
      FormHelperTextProps={{
        className: classes.helperText
      }}
      InputProps={{
        classes: {
          root: classes.input
        },
        style: {
          minWidth: props.minWidth
        }
      }}
      SelectProps={{
        classes: {
          root: props.value ? undefined : classes.unselected,
          select: classes.select
        },
        displayEmpty: !props.value,
        renderValue: () => (props.value ? props.value.code : 'Select')
      }}
    >
      {props.value ? null : (
        <MenuItem disabled value=''>
          Select an asset
        </MenuItem>
      )}
      {assets.map((asset) => (
        <AssetItem
          asset={asset}
          disabled={props.disabledAssets && props.disabledAssets.some((someAsset) => assetEquals(someAsset, asset))}
          key={stringifyAsset(asset)}
          value={asset.code}
        />
      ))}
    </TextField>
  );
}

export default React.memo(AssetSelector);
