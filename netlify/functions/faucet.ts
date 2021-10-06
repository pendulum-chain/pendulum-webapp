import { Handler } from "@netlify/functions";
import Faucet from '../../lib/faucet';

function fail(msg: string) {
  return {
    statusCode: 500,
    body: JSON.stringify({ message: msg}),
  };
}

function ok(msg: string) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: msg}),
  }
}

const config = {
  token: "",
  prefix: "/",
  symbol: "PEN",
  decimals: 12,
  ws: "wss://latest---pendulum-demo-node-5agyjkoilq-uc.a.run.app:443",
  address_type: 42, // https://github.com/paritytech/substrate/blob/e232d78dd5bafa3bbaae9ac9db08f99e238392db/primitives/core/src/crypto.rs#L444
  amount: 10000,
  mnemonic: process.env.FAUCET_MNEMONIC_SEED, // Don'y include the secret key here, it will be set by environment variables
  limit: 2 // The time limit for sending requests is in hours.
}

const handler: Handler = async (event, context) => {
  const faucet = new Faucet(config);
  await faucet.init();
  
  if (!config.mnemonic) {
    return fail("Faucet not configured correctly.")
  }

  const { to } = event.queryStringParameters;
  console.log(event.path)
  if (!to) {
    return fail("Must provide a valid address")
  }
  const res = await faucet.send(to);
  return ok(res)
};

export { handler };