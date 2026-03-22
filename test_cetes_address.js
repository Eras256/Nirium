// Quick test to verify CETES address is correct
import { CETES_ASSET_ID } from './apps/web/lib/sorobanContracts.ts';

console.log('═══════════════════════════════════════════════════════════');
console.log('CETES Address Verification');
console.log('═══════════════════════════════════════════════════════════');
console.log('Current CETES_ASSET_ID:', CETES_ASSET_ID);
console.log('Expected (correct):    CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC');
console.log('Old (incorrect):       CAWKHFX7V5Y42FVN64WJUVOVFYVZPKNLQ4ANZFD3UJFSR7Z3PXL2BQGY');
console.log('═══════════════════════════════════════════════════════════');

if (CETES_ASSET_ID === 'CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC') {
    console.log('✅ CETES address is CORRECT!');
} else if (CETES_ASSET_ID === 'CAWKHFX7V5Y42FVN64WJUVOVFYVZPKNLQ4ANZFD3UJFSR7Z3PXL2BQGY') {
    console.log('❌ CETES address is WRONG (old value)!');
    console.log('   Need to clear cache and restart dev server');
} else {
    console.log('⚠️  CETES address is unexpected:', CETES_ASSET_ID);
}
