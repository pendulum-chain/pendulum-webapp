# playground
Draft repository for a playground web application for Pendulum

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## before running

- Make sure to set the envorinment (`process.env.FAUCET_MNEMONIC_SEED`) variable for the faucet mnemonic
as set in the `config.ts` file under `src/lib`
- Set the `ISSUER_SECRET` for the USDC and issuer key under `constants.ts` file

## Run

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Build
### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\