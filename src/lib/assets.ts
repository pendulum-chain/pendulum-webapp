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
