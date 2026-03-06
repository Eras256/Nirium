import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';
import { FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit/modules/freighter';

StellarWalletsKit.init({
    modules: defaultModules(),
    selectedModuleId: FREIGHTER_ID,
    network: 'TESTNET' as any
});
StellarWalletsKit.setWallet(FREIGHTER_ID);
console.log("OK");
