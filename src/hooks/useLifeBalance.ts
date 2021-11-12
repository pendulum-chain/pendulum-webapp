import { useEffect, useMemo, useState } from 'react';

import PendulumApi, { PendulumAssetBalance } from '../lib/api';
import { Asset, stringifyAsset } from '../lib/assets';

const createAddressAssetKey = (address: string, assetString: string) => `${address}#${assetString}`;

// subscribe to a set of assets for a given address
// returns an object `balances` that is indexed by the stringified assets
// this hook will re-execute whenever any of the subscribed balances changes
export function useRealTimeBalances(address: string, assets: Asset[]) {
  const [balances, setBalances] = useState<Record<string, PendulumAssetBalance>>({});
  const [boundAddressAssets, setBoundAddressAssets] = useState<Set<string>>(new Set());

  useEffect(() => {
    const api = PendulumApi.get();
    let newBoundAddressAssets = new Set(boundAddressAssets);

    assets.forEach((asset) => {
      const assetString = stringifyAsset(asset);
      const addressAsset = createAddressAssetKey(address, assetString);

      if (!newBoundAddressAssets.has(addressAsset)) {
        newBoundAddressAssets.add(addressAsset);

        api.bindToBalance(address, asset, (newValue) => {
          setBalances((balances) => ({ ...balances, [addressAsset]: newValue }));
        });
      }
    });

    setBoundAddressAssets(newBoundAddressAssets);
  }, [assets, address, boundAddressAssets]);

  const subscribedBalances = useMemo(() => {
    const result: Record<string, PendulumAssetBalance | undefined> = {};

    assets.forEach((asset) => {
      const assetString = stringifyAsset(asset);
      const addressAsset = createAddressAssetKey(address, assetString);
      result[assetString] = balances[addressAsset];
    });
  }, [address, assets, balances]);

  return { balances: subscribedBalances };
}
