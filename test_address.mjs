
import { Address } from '@stellar/stellar-sdk';
console.log('Type:', typeof Address);
try {
    const a = new Address('GBTBVK3C236G4O324NXXL6M7A4G4MHSCR3YMN63MJFLRMDAMOXZBD4PT');
    console.log('Constructor works');
} catch (e) {
    console.log('Constructor failed:', e.message);
}

try {
    const b = Address.fromString('GBTBVK3C236G4O324NXXL6M7A4G4MHSCR3YMN63MJFLRMDAMOXZBD4PT');
    console.log('fromString works');
} catch (e) {
    console.log('fromString failed:', e.message);
}
