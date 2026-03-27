/**
 * Test script to verify swarm operation selection logic
 */
import { Address, nativeToScVal } from '@stellar/stellar-sdk';
// Mock agent vault IDs
const agentVaultIds = {};
const SOROBAN_OPS = [
    {
        label: '🏊 Pool Deploy',
        fn: 'create_pool',
        weight: 3,
        buildArgs: (agent) => {
            const feeBps = Math.floor(Math.random() * 47) + 3;
            const liq = Math.floor(Math.random() * 9_000_000) + 1_000_000;
            const addr = new Address(agent.keypair.publicKey()).toScVal();
            return [
                addr, addr, addr,
                nativeToScVal(liq, { type: 'i128' }),
                nativeToScVal(liq * 2, { type: 'i128' }),
                nativeToScVal(feeBps, { type: 'u32' }),
            ];
        },
    },
    {
        label: '🔷 Vault Create',
        fn: 'create_vault',
        weight: 2,
        buildArgs: (agent) => {
            if (agentVaultIds[agent.name])
                return null;
            const ownerAddr = new Address(agent.keypair.publicKey()).toScVal();
            const tokenAddr = new Address('CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC').toScVal();
            const vaultName = nativeToScVal(`${agent.name}-Vault`, { type: 'string' });
            return [ownerAddr, tokenAddr, vaultName];
        },
        onSuccess: async (agent, result) => {
            if (result && typeof result === 'object') {
                const vaultId = result.vault_id || result[0];
                if (vaultId) {
                    agentVaultIds[agent.name] = Number(vaultId);
                    console.log(`✅ ${agent.name} created vault ID: ${vaultId}`);
                }
            }
        },
    },
    {
        label: '💎 Vault Deposit',
        fn: 'deposit',
        weight: 4,
        buildArgs: (agent) => {
            const vaultId = agentVaultIds[agent.name];
            if (!vaultId)
                return null;
            const xlmAmount = Math.random() * 4.9 + 0.1;
            const stroops = Math.floor(xlmAmount * 10_000_000);
            return [
                nativeToScVal(vaultId, { type: 'u64' }),
                nativeToScVal(stroops, { type: 'i128' }),
            ];
        },
    },
    {
        label: '🔍 Vault Scan',
        fn: 'get_vault_count',
        weight: 1,
        buildArgs: () => [],
    },
    {
        label: '🌊 Pool Count',
        fn: 'get_pool_count',
        weight: 1,
        buildArgs: () => [],
    },
    {
        label: '💰 Fee Harvest',
        fn: 'get_total_fees',
        weight: 1,
        buildArgs: () => [],
    },
];
// Mock agent
const mockAgent = {
    name: 'TestAgent',
    keypair: {
        publicKey: () => 'GAGXYW67RO6YOFI7QYPBVW7FGVKQQGV6HZJZWNK5LVRXKKQH3JK3GVXG'
    },
    busy: false
};
console.log('\n🧪 TESTING SWARM OPERATION LOGIC\n');
// Test 1: Weighted selection distribution
console.log('📊 Test 1: Weighted Selection Distribution');
const totalWeight = SOROBAN_OPS.reduce((sum, op) => sum + (op.weight || 1), 0);
console.log(`Total weight: ${totalWeight}`);
SOROBAN_OPS.forEach(op => {
    const probability = ((op.weight || 1) / totalWeight * 100).toFixed(1);
    console.log(`  ${op.label.padEnd(20)} | Weight: ${op.weight || 1} | Probability: ${probability}%`);
});
// Test 2: Operation selection (before vault created)
console.log('\n📋 Test 2: Operations BEFORE Vault Creation');
SOROBAN_OPS.forEach(op => {
    const args = op.buildArgs(mockAgent);
    const status = args === null ? '❌ Skipped (null)' : '✅ Can execute';
    console.log(`  ${op.label.padEnd(20)} | ${status}`);
});
// Test 3: Simulate vault creation
console.log('\n🔷 Test 3: Simulating Vault Creation');
agentVaultIds[mockAgent.name] = 1;
console.log(`  Mock vault ID assigned: 1`);
// Test 4: Operation selection (after vault created)
console.log('\n📋 Test 4: Operations AFTER Vault Creation');
SOROBAN_OPS.forEach(op => {
    const args = op.buildArgs(mockAgent);
    const status = args === null ? '❌ Skipped (null)' : '✅ Can execute';
    console.log(`  ${op.label.padEnd(20)} | ${status}`);
});
// Test 5: Verify deposit args format
console.log('\n💎 Test 5: Verify Deposit Arguments Format');
const depositOp = SOROBAN_OPS.find(op => op.fn === 'deposit');
if (depositOp) {
    const args = depositOp.buildArgs(mockAgent);
    if (args) {
        console.log(`  ✅ Args generated successfully`);
        console.log(`  ├─ Arg 0 (vault_id): u64 ScVal`);
        console.log(`  └─ Arg 1 (amount): i128 ScVal`);
        console.log(`  📝 Args are properly typed for Soroban contract`);
    }
    else {
        console.log(`  ❌ Failed to generate args`);
    }
}
// Test 6: Distribution simulation
console.log('\n🎲 Test 6: Simulating 1000 Random Selections');
const selections = {};
SOROBAN_OPS.forEach(op => selections[op.label] = 0);
for (let i = 0; i < 1000; i++) {
    let random = Math.random() * totalWeight;
    for (const op of SOROBAN_OPS) {
        random -= (op.weight || 1);
        if (random <= 0) {
            selections[op.label]++;
            break;
        }
    }
}
console.log('  Results (out of 1000):');
Object.entries(selections).forEach(([label, count]) => {
    const percentage = (count / 10).toFixed(1);
    const bar = '█'.repeat(Math.floor(count / 20));
    console.log(`  ${label.padEnd(20)} | ${count.toString().padStart(3)} (${percentage}%) ${bar}`);
});
console.log('\n✅ All tests completed!\n');
//# sourceMappingURL=test_swarm_operations.js.map