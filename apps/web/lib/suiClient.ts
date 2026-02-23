export const suiClient = {
    getBalance: async (...args: any[]) => ({ totalBalance: "100000000000" }),
    getObject: async (...args: any[]) => ({ data: { content: { fields: { balance: "100000000" } }, owner: { Shared: { initial_shared_version: 1 } }, objectId: "0xMock" } }),
    getCoins: async (...args: any[]) => ({ data: [{ coinObjectId: "0x1" }] }),
    waitForTransaction: async (...args: any[]) => ({ objectChanges: [] }),
};
