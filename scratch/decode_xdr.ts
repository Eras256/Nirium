import { xdr } from '@stellar/stellar-sdk';

const resultXdr = 'AAAAAAAAAGT/////AAAAAQAAAAAAAAAB/////gAAAAA=';
const result = xdr.TransactionResult.fromXDR(resultXdr, 'base64');

console.log('Transaction Result:', JSON.stringify(result, null, 2));

if (result.result().switch().name === 'txFailed' || result.result().switch().name === 'txSuccess') {
    const results = result.result().results();
    results.forEach((opResult, index) => {
        console.log(`Operation ${index} Result Switch:`, opResult.switch().name);
        
        // Check if opInner
        if (opResult.switch().name === 'opInner') {
            const tr = opResult.tr();
            console.log(`Operation ${index} Type:`, tr.switch().name);
            
            // Handle different operation types
            if (tr.switch().name === 'payment') {
                const pResult = tr.paymentResult();
                console.log(`Operation ${index} Payment Result:`, pResult.switch().name);
            } else if (tr.switch().name === 'pathPaymentStrictReceive') {
                const ppResult = tr.pathPaymentStrictReceiveResult();
                console.log(`Operation ${index} PathPayment Result:`, ppResult.switch().name);
            }
        }
    });
}
