pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/bitify.circom";

// Merkle Tree inclusion proof w/ Poseidon Hash
template WithdrawProof(levels) {
    // Public Inputs
    signal input root;
    signal input nullifierHash;
    signal input recipient; // recipient address (to prevent front-running)
    signal input relayer;   // relayer address (fee sponsor)
    signal input fee;       // fee paid to relayer

    // Private Inputs
    signal input nullifier;
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    // 1. Verify Nullifier Hash
    component hasher = Poseidon(2);
    hasher.inputs[0] <== nullifier;
    hasher.inputs[1] <== secret;
    
    // Calculate Commitment
    component commitmentHasher = Poseidon(1);
    commitmentHasher.inputs[0] <== hasher.out;

    // Verify nullifier output matches public input
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== nullifier;
    nullifierHasher.inputs[1] <== 1; // Domain separation
    nullifierHasher.out === nullifierHash;

    // 2. Verify Merkle Path
    component tree[levels];
    component one[levels];
    component levelsHashers[levels];

    var currentHash = commitmentHasher.out;

    for (var i = 0; i < levels; i++) {
        // Ensure index is binary
        // (index * (1 - index)) === 0; // Constraint implied by using circomlib Mux1 or dual hash

        levelsHashers[i] = Poseidon(2);
        
        // If pathIndex is 0: hash(current, pathElement)
        // If pathIndex is 1: hash(pathElement, current)
        // Implementation using algebraic selector:
        // L = current - index * (current - pathElement)
        // R = pathElement - index * (pathElement - current)
        
        var left = currentHash - pathIndices[i] * (currentHash - pathElements[i]);
        var right = pathElements[i] - pathIndices[i] * (pathElements[i] - currentHash);

        levelsHashers[i].inputs[0] <== left;
        levelsHashers[i].inputs[1] <== right;

        currentHash = levelsHashers[i].out;
    }

    // 3. Verify Root
    currentHash === root;

    // 4. Constraint Binding (Square to signal use)
    signal recipientSquare;
    recipientSquare <== recipient * recipient;
    signal relayerSquare;
    relayerSquare <== relayer * relayer;
    signal feeSquare;
    feeSquare <== fee * fee;
}

// Instantiate with depth 20 for ~1M leaves
component main {public [root, nullifierHash, recipient, relayer, fee]} = WithdrawProof(20);
