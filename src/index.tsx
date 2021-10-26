import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { cryptoWaitReady } from "@polkadot/util-crypto";
import keyring from '@polkadot/ui-keyring';
import PendulumApi from './lib/api'

const config = {
  token: "",
  prefix: "/",
  symbol: "PEN",
  decimals: 12,
  ws: "wss://latest---pendulum-demo-node-5agyjkoilq-uc.a.run.app:443",
  address_type: 42, // https://github.com/paritytech/substrate/blob/e232d78dd5bafa3bbaae9ac9db08f99e238392db/primitives/core/src/crypto.rs#L444
  amount: 10000,
  limit: 2 // The time limit for sending requests is in hours.
}

cryptoWaitReady().then(async () => {
  //  We can still add ed25519 accounts
  keyring.loadAll({ ss58Format: 42, type: 'sr25519' });
  const api = PendulumApi.create(config);
  await api.init();

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
  });

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
