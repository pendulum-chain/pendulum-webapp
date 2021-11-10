import { Keypair } from 'stellar-base';
export interface Asset {
  issuer: string;
  code: string;
}

export function stringifyAsset(asset: Asset) {
  return `${asset.issuer}:${asset.code}`;
}

export function assetEquals(a: Asset, b: Asset) {
  return a.code === b.code && a.issuer === b.issuer;
}

export const SupportedAssetsMap: Record<Asset['code'], Asset> = {
  USDC: { code: 'USDC', issuer: 'GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC' },
  EUR: { code: 'EUR', issuer: 'GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC' }
};

const pad = (s: string, n: number = 4): string => (n > s.length ? s + new Array(n - s.length).fill('\0').join() : s);

export const assetFilter = (assetCode: Asset['code']) => {
  const issuerPubKey = Keypair.fromPublicKey(SupportedAssetsMap[assetCode].issuer).rawPublicKey();
  return {
    AlphaNum4: {
      code: pad(assetCode),
      issuer: issuerPubKey
    }
  };
};
