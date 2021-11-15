const config = {
  address_type: 42,
  amm_address: '5GpPQ9z15SppwB7XV1g1cJEGvTk5zXWEW9FjwuhC4y6JzNwb',
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
  ws: 'wss://testnet-1.pendulum.satoshipay.tech:443'
};

export type Config = typeof config;
export default config;
