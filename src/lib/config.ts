const config = {
  address_type: 42, // https://github.com/paritytech/substrate/blob/e232d78dd5bafa3bbaae9ac9db08f99e238392db/primitives/core/src/crypto.rs#L444
  amm_address: '5G89Ym4R1zhnSVpX5b2dLR1Bp4ZKCSpwyrZcF6vbNkBqDD3A', // hardcode to address of amm smart contract on pendulum node
  amount: 10000,
  decimals: 12,
  friend_bot_url: 'https://friendbot.stellar.org?addr=',
  horizon_testnet_url: 'https://horizon-testnet.stellar.org',
  issuer_public: 'GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC',
  issuer_secret: process.env.REACT_APP_ASSET_ISSUER_SECRET || '',
  limit: 2, // The time limit for sending requests is in hours.,
  mnemonic: process.env.REACT_APP_FAUCET_MNEMONIC_SEED,
  new_user_mint_timeout: 120,
  prefix: '/',
  symbol: 'PEN',
  token: '',
  trust_line_timeout: 100,
  ws: 'wss://latest---pendulum-demo-node-5agyjkoilq-uc.a.run.app:443'
};

export type Config = typeof config;
export default config;
