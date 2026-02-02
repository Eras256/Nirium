import { rpc, Networks } from '@stellar/stellar-sdk';

export const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
export const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';

export const server = new rpc.Server(RPC_URL);
export const networkPassphrase = Networks.TESTNET;
