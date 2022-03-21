# Pendulum WebApp

Web application for Pendulum.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Before running

Make sure to set the envorinment variables :

- `process.env.REACT_APP_FAUCET_MNEMONIC_SEED` variable for the faucet mnemonic

- `process.env.REACT_APP_ASSET_ISSUER_SECRET` for the USDC and EUR issuer secret

You can optionally provide these environment variables to change the connection parameters of the known nodes:

- `process.env.REACT_APP_ROCOCO_WSS_ENDPOINT` used as the endpoint for the 'Rococo Testnet' node

- `process.env.REACT_APP_ROCOCO_AMM_ADDRESS` for specifying the deployed AMM of the 'Rococo Testnet' node


### Install libtool
Make sure you have [libtool](https://www.gnu.org/software/libtool/) installed in your system.

For linux systems: `sudo apt install libtool`

For Mac systems: `brew install libtool` ([brew](https://brew.sh/) is required)


## Run

In the project directory, you can run:

### `yarn install`
Install dependencies

### `yarn start`
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Build

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
