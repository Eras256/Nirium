import { Horizon } from '@stellar/stellar-sdk';

async function check() {
    const server = new Horizon.Server("https://horizon-testnet.stellar.org");
    try {
        const account = await server.loadAccount("GBU5BD5RONSND3PL4JCARUXTBD7ON5O2TWZPBFY4O4OLQI5NI44TYYSZ");
        console.log(JSON.stringify(account.balances, null, 2));
    } catch (e) {
        console.error(e);
    }
}
check();
