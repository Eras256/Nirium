const { Asset, Networks } = require('@stellar/stellar-sdk');
const usdc = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');
console.log("Contract ID:", usdc.contractId(Networks.TESTNET));
