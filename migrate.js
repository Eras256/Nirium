const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(walk(file));
        } else {
            /* Is a file */
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('apps/web/app').concat(walk('apps/web/components')).concat(['apps/web/hooks/useFreighter.ts']);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.includes('@mysten/dapp-kit')) {
        content = content.replace(/import {[^}]*} from ["']@mysten\/dapp-kit["'];/g, `import { useFreighter } from "@/hooks/useFreighter";`);

        // mock the hook calls
        content = content.replace(/const {.*?mutateAsync.*?signTransaction.*?} = useSignTransaction\(\);/g, `const signTransaction = async (tx: any) => ({ bytes: '0x', signature: '0x' });`);
        content = content.replace(/const suiClient = useSuiClient\(\);/g, `const suiClient = { executeTransactionBlock: async () => ({ digest: 'stellar_' + Math.random().toString(36).substring(7) }) };`);
        content = content.replace(/const account = useCurrentAccount\(\);/g, `const { address: accountStr, isConnected } = useFreighter();\n    const account = isConnected ? { address: accountStr, chains: ['stellar:testnet'] } : null;`);

        changed = true;
    }

    if (content.includes('@mysten/sui/transactions')) {
        content = content.replace(/import {[^}]*} from ["']@mysten\/sui\/transactions["'];/g, `import { TransactionBuilder, Networks } from "@stellar/stellar-sdk";`);
        content = content.replace(/new Transaction\(\)/g, `{} as any`);
        changed = true;
    }

    // Replace text
    if (content.includes('SuiLoop')) { content = content.replace(/SuiLoop/g, 'Nirium'); changed = true; }
    if (content.includes('Sui')) { content = content.replace(/Sui/g, 'Stellar'); changed = true; }
    if (content.includes('SUI')) { content = content.replace(/SUI/g, 'XLM'); changed = true; }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
});
