import { useEffect, useMemo, useRef, useState } from 'react';
import { AccountKeyPairs } from '../interfaces';

import PendulumApi, { PendulumAssetBalance } from '../lib/api';
import { Asset, stringifyAsset } from '../lib/assets';
import { createBalanceEmitter, StellarBalances } from '../lib/stellarBalance';

const createAddressAssetKey = (address: string, assetString: string) => `${address}#${assetString}`;

// subscribe to a set of assets for a given address
// returns an object `balances` that is indexed by the stringified assets
// this hook will re-execute whenever any of the subscribed balances changes
export function usePendulumRealTimeBalances(address: string | undefined, assets: Asset[]) {
  const [balances, setBalances] = useState<Record<string, PendulumAssetBalance>>({});
  const boundAddressAssets = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (address === undefined) return;

    const api = PendulumApi.get();

    assets.forEach((asset) => {
      const assetString = stringifyAsset(asset);
      const addressAsset = createAddressAssetKey(address, assetString);

      if (!boundAddressAssets.current.has(addressAsset)) {
        boundAddressAssets.current.add(addressAsset);

        api.bindToBalance(address, asset, (newValue) => {
          setBalances((balances) => ({ ...balances, [addressAsset]: newValue }));
        });
      }
    });
  }, [assets, address]);

  const subscribedBalances = useMemo(() => {
    const result: Record<string, PendulumAssetBalance | undefined> = {};

    if (address === undefined) return result;

    assets.forEach((asset) => {
      const assetString = stringifyAsset(asset);
      const addressAsset = createAddressAssetKey(address, assetString);
      result[assetString] = balances[addressAsset];
    });

    return result;
  }, [address, assets, balances]);

  return { balances: subscribedBalances };
}

export function useStellarRealTimeBalances(accountId: string | undefined) {
  const [balances, setBalances] = useState<StellarBalances | undefined>(undefined);

  const balanceEmitter = useMemo(() => {
    return createBalanceEmitter((balanceMessage) => {
      switch (balanceMessage.type) {
        case 'balance':
          setBalances(balanceMessage.balances);
          break;

        case 'error': {
          console.log(balanceMessage.error);
        }
      }
    });
  }, []);

  useEffect(() => {
    balanceEmitter.setAccountId(accountId);
  }, [accountId, balanceEmitter]);

  return {
    balances
  };
}

export interface StellarPendulumBalance {
  assetCode: string;
  assetIssuer: string;
  stellarBalance: string;
  pendulumBalance: string;
}

export function useRealTimeBalances(keypairs: AccountKeyPairs | undefined) {
  const { balances: stellarBalances } = useStellarRealTimeBalances(keypairs?.stellar_address);

  const trustlines = useMemo(
    () =>
      stellarBalances !== undefined
        ? Object.keys(stellarBalances).map((assetString) => {
            const [code, issuer] = assetString.split(':');

            return {
              code,
              issuer
            };
          })
        : [],
    [stellarBalances]
  );

  const { balances: pendulumBalances } = usePendulumRealTimeBalances(keypairs?.address, trustlines);

  const balancePairs: StellarPendulumBalance[] = useMemo(() => {
    if (stellarBalances === undefined) return [];

    const result: StellarPendulumBalance[] = [];
    const sortedAssetStrings = Object.keys(stellarBalances).sort();

    for (const assetString of sortedAssetStrings) {
      const [assetCode, assetIssuer] = assetString.split(':');

      result.push({
        assetCode,
        assetIssuer,
        stellarBalance: stellarBalances[assetString] ?? '0.0000000',
        pendulumBalance: pendulumBalances[assetString]?.free ?? '0'
      });
    }

    return result;
  }, [stellarBalances, pendulumBalances]);

  return { balancePairs };
}
