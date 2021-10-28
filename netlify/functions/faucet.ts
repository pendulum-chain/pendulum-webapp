import { Handler } from "@netlify/functions";
import PendulumApi from "../../src/lib/api";
import Faucet from '../../src/lib/faucet';
import config from '../../src/lib/config';

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

const handler: Handler = async (event, context) => {
  const api = new PendulumApi(config);
  await api.init();
  const faucet = new Faucet(api);
  
  if (!process.env.FAUCET_MNEMONIC_SEED) {
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