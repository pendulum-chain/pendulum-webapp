import { useState } from 'react';
import { Asset, stringifyAsset } from '../lib/assets';

type Currency = 'USD';
type ExchangeRate = number;

interface ExchangeRates {
  [asset: string]: ExchangeRate;
}

const exchangeRatesUSD: ExchangeRates = {
  PEN: 0.125,
  'GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC:EUR': 1.1,
  'GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC:USDC': 1
};

export function useExchangeRates(baseAssets: Asset[], targetCurrency: Currency) {
  const [exchangeRates] = useState<ExchangeRates>(exchangeRatesUSD);

  const map = new Map<Asset, ExchangeRate>();

  baseAssets.forEach((asset) => {
    if (exchangeRates[stringifyAsset(asset)]) {
      map.set(asset, exchangeRates[stringifyAsset(asset)]);
    }
  });

  return { assetExchangeRates: map, nativeExchangeRate: exchangeRates['PEN'] };
}

export function useExchangeRate(baseAsset: Asset | undefined, targetCurrency: Currency) {
  const { assetExchangeRates, nativeExchangeRate } = useExchangeRates(baseAsset ? [baseAsset] : [], targetCurrency);

  return { exchangeRate: assetExchangeRates.values().next().value, nativeExchangeRate };
}
