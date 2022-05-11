import { cryptoWaitReady } from '@polkadot/util-crypto';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { GlobalStateInterface } from './GlobalStateProvider';
import './index.css';
import PendulumApi from './lib/api';
import config from './lib/config';
import { getDefaultNode } from './lib/nodes';
import reportWebVitals from './reportWebVitals';

cryptoWaitReady().then(async () => {
  const api = PendulumApi.create(config);

  const saved = localStorage.getItem('state');
  const initialValue: Partial<GlobalStateInterface> = JSON.parse(saved || '{}');

  if (!initialValue.currentNode) {
    initialValue.currentNode = getDefaultNode();
  }
  try {
    await api.init(initialValue.currentNode.wss_endpoint);
  } catch (error) {
    initialValue.toast = { message: `Failed to connect to ${initialValue.currentNode.wss_endpoint}`, type: 'error' };
    console.error('Could not initialize api', error);
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
