// @ts-ignore
import * as snarkjs from "snarkjs";
// @ts-ignore
import { buildPoseidon } from "circomlibjs";

interface WithdrawInputs {
    root: string;
    nullifierHash: string;
    recipient: string;
    relayer: string;
    fee: string;
    nullifier: string;
    secret: string;
    pathElements: string[];
    pathIndices: number[];
}

export const generateWithdrawProof = async (inputs: WithdrawInputs) => {
    try {
        // Files must be served from /public/zk directory
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            inputs,
            "/zk/WithdrawProof.wasm",
            "/zk/WithdrawProof_final.zkey"
        );

        return { proof, publicSignals };
    } catch (error) {
        console.error("ZK Proof Generation Failed:", error);
        throw error;
    }
};

/**
 * Computes valid Cryptographic inputs for the circuit so the assertion doesn't fail.
 */
export const getValidMockInputs = async () => {
    const poseidon = await buildPoseidon();
    const F = poseidon.F; // Prime Field

    // 1. Secrets
    const secret = 123456n;
    const nullifier = 789012n;

    // 2. Hash(nullifier, secret) -> Commitment Preimage
    const commitmentHash = poseidon([nullifier, secret]);

    // 3. Hash(commitmentHas) -> Commitment (Leaf)
    let currentHash = poseidon([commitmentHash]);

    // 4. Nullifier Hash: Hash(nullifier, 1)
    const nullifierHash = poseidon([nullifier, 1n]);

    // 5. Compute Merkle Root (20 levels of zeros)
    // pathElements all '0', indices all 0
    // so newHash = Hash(current, 0)
    for (let i = 0; i < 20; i++) {
        currentHash = poseidon([currentHash, 0n]);
    }

    const root = F.toString(currentHash);
    const nullifierHashStr = F.toString(nullifierHash);

    return {
        root: root,
        nullifierHash: nullifierHashStr,
        recipient: "0",
        relayer: "0",
        fee: "0",
        nullifier: nullifier.toString(),
        secret: secret.toString(),
        pathElements: new Array(20).fill("0"),
        pathIndices: new Array(20).fill(0)
    };
};

/**
 * Packs Proof into Soroban compatible Bytes
 * (Placeholder for actual formatting logic based on SDK requirements)
 */
export const packProof = (proof: any, publicSignals: any) => {
    // TODO: Implement Groth16 proof serialization for contract call
    return {
        a: proof.pi_a.slice(0, 2),
        b: proof.pi_b.slice(0, 2),
        c: proof.pi_c.slice(0, 2),
        inputs: publicSignals
    };
};
