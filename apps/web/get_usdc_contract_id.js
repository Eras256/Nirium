const { Asset } = require('@stellar/stellar-sdk');
const usdc = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');
console.log(usdc.contractId(require('@stellar/stellar-sdk').Networks.TESTNET));
