const config = {
    token: "",
    prefix: "/",
    symbol: "PEN",
    decimals: 12,
    ws: "wss://latest---pendulum-demo-node-5agyjkoilq-uc.a.run.app:443",
    address_type: 42, // https://github.com/paritytech/substrate/blob/e232d78dd5bafa3bbaae9ac9db08f99e238392db/primitives/core/src/crypto.rs#L444
    mnemonic: process.env.FAUCET_MNEMONIC_SEED,
    amount: 10000,
    limit: 2 // The time limit for sending requests is in hours.
}

export default config;