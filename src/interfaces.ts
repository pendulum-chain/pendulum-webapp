export interface AccountKeyPairs {
  seed: string;
  address: string;
  stellar_seed?: string;
  stellar_address?: string;
}

export interface ICreateAccount {
  accountName: string;
  accountSecret: string;
  accountExtraData: AccountKeyPairs;
}
