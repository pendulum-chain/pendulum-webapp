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
export const usdcAsset = {
  AlphaNum4: {
    code: 'USDC',
    issuer: [
      20, 209, 150, 49, 176, 55, 23, 217, 171, 154, 54, 110, 16, 50, 30, 226, 102, 231, 46, 199, 108, 171, 97, 144, 240,
      161, 51, 109, 72, 34, 159, 139
    ]
  }
};

export const euroAsset = {
  AlphaNum4: {
    code: 'EUR\0',
    issuer: [
      20, 209, 150, 49, 176, 55, 23, 217, 171, 154, 54, 110, 16, 50, 30, 226, 102, 231, 46, 199, 108, 171, 97, 144, 240,
      161, 51, 109, 72, 34, 159, 139
    ]
  }
};
