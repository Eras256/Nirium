const { xdr } = require('@stellar/stellar-sdk');

// Create a valid but empty SorobanAuthorizationEntry
const entry = new xdr.SorobanAuthorizationEntry({
    credentials: xdr.SorobanCredentials.sourceAccount(),
    rootInvocation: new xdr.SorobanAuthorizedInvocation({
        function: xdr.SorobanAuthorizedFunction.contractFnCall(
            new xdr.SorobanAuthorizedContractFunction({
                contractAddress: xdr.Address.account(require('@stellar/stellar-sdk').Keypair.random().xdrPublicKey()),
                functionName: 'dummy',
                args: []
            })
        ),
        subInvocations: []
    })
});

console.log(entry.toXDR('base64'));
