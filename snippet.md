## Snippets for Withdraw and Deposit (Payment and claimable balances)

```javascript
/// Withdrawal
let secret = 'SCV7RZN.........';
let newPair = getSubstrateKeypairfromStellarSecret(secret);
let amount = 1000000000000; // Note that this amount represent 1 unit in Stellar (USDC or EUR)
withdrawToStellar(newPair, 'USDC', 'GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC', amount);

/// Deposit

let stellarKeypair = Keypair.fromSecret(secret);
let amount = '0.7';
let asset = new Asset('EUR', 'GAKNDFRRWA3RPWNLTI3G4EBSD3RGNZZOY5WKWYMQ6CQTG3KIEKPYWAYC');

// Deposit via claimable balances
createClaimableDeposit(stellarKeypair, amount, asset);

// Payment Deposit
makePaymentDeposit(stellarKeypair, amount, asset);
```
