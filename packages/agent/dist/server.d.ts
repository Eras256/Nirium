import { Application } from 'express';
import { createServer } from 'http';
declare const PORT: number;
declare const VERSION = "0.1.0";
declare const app: Application;
export declare function createAppServer(): {
    app: Application;
    server: ReturnType<typeof createServer>;
};
export { app, PORT, VERSION };
//# sourceMappingURL=server.d.ts.map