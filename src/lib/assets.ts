import { Keypair } from 'stellar-base';

export type AssetOrAssetCode = Asset | string;

export interface PendulumAssetAlphaNum4 {
  AlphaNum4: {
    code: string;
    issuer: Uint8Array;
  };
}

export interface PendulumAssetAlphaNum12 {
  AlphaNum12: {
    code: string;
    issuer: Uint8Array;
  };
}

export type PendulumAsset = PendulumAssetAlphaNum4 | PendulumAssetAlphaNum12;

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

export const DefaultAssetsMap: Record<Asset['code'], Asset> = {
  USDC: { code: 'USDC', issuer: 'GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC' },
  EUR: { code: 'EUR', issuer: 'GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC' }
};

const pad = (s: string, n: number = 4): string => (n > s.length ? s + new Array(n - s.length).fill('\0').join() : s);

export const convertAssetToPendulumAsset = (asset: AssetOrAssetCode): PendulumAsset => {
  if (typeof asset === 'string') {
    asset = DefaultAssetsMap[asset];
  }

  const { code, issuer } = asset;

  const issuerPubKey = Keypair.fromPublicKey(issuer).rawPublicKey();

  return code.length <= 4
    ? {
        AlphaNum4: {
          code: pad(code),
          issuer: issuerPubKey
        }
      }
    : {
        AlphaNum12: {
          code: pad(code, 12),
          issuer: issuerPubKey
        }
      };
};
