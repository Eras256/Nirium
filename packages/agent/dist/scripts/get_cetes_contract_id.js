/**
 * Get CETES Contract Address for Soroban vaults
 * Tests both old and new Stellar testnet network passphrases
 */
import { Asset, Contract, Networks } from '@stellar/stellar-sdk';
const CETES_ASSET = {
    code: 'CETES',
    issuer: 'GC3CW7EDYRTWQ635VDIGY6S4ZUF5L6TQ7AA4MWS7LEQDBLUSZXV7UPS4',
};
try {
    const asset = new Asset(CETES_ASSET.code, CETES_ASSET.issuer);
    // Try with Networks.TESTNET constant (most reliable)
    const contractTestnet = new Contract(asset.contractId(Networks.TESTNET));
    const addressTestnet = contractTestnet.address().toString();
    console.log('═══════════════════════════════════════════════════════════');
    console.log('CETES Asset Information');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Code:', CETES_ASSET.code);
    console.log('Issuer:', CETES_ASSET.issuer);
    console.log('\nUsing Networks.TESTNET:');
    console.log('Contract Address:', addressTestnet);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\nAdd this to your swarm script:');
    console.log(`const CETES_ASSET_ID = '${addressTestnet}'; // CETES`);
}
catch (error) {
    console.error('Error:', error);
}
//# sourceMappingURL=get_cetes_contract_id.js.map