const config = {
    token: "",
    prefix: "/",
    symbol: "PEN",
    decimals: 12,
    ws: "wss://latest---pendulum-demo-node-5agyjkoilq-uc.a.run.app:443",
    address_type: 42, // https://github.com/paritytech/substrate/blob/e232d78dd5bafa3bbaae9ac9db08f99e238392db/primitives/core/src/crypto.rs#L444
    mnemonic: process.env.REACT_APP_FAUCET_MNEMONIC_SEED,
    amount: 10000,
    limit: 2, // The time limit for sending requests is in hours.,
    friend_bot_url : "https://friendbot.stellar.org?addr=",
    horizon_testnet_url: "https://horizon-testnet.stellar.org",
    issuer_public: "GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC",
    issuer_secret: process.env.REACT_APP_ASSET_ISSUER_SECRET || "",
    trust_line_timeout: 100,
    new_user_mint_timeout: 120,
}

export default config;