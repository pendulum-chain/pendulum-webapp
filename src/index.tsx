import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import PendulumApi from './lib/api';
import config from './lib/config';

cryptoWaitReady().then(async () => {
  const api = PendulumApi.create(config);

  const saved = localStorage.getItem('state');
  const initialValue = JSON.parse(saved || '{}');

  if (initialValue.currentNode) {
    await api.init(initialValue.currentNode.url);
  }

  ReactDOM.render(
    <React.StrictMode>
      <App initialState={initialValue} />
    </React.StrictMode>,
    document.getElementById('root')
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
