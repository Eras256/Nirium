import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        roles: string[];
    };
}
export declare function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
export declare function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function generateToken(userId: string, roles?: string[]): string;
export declare function generateApiKey(userId: string, name: string, roles?: string[]): string;
export declare function getUserApiKeys(userId: string): {
    id: string;
    name: string;
    createdAt: string;
}[];
export declare function revokeApiKey(id: string): boolean;
//# sourceMappingURL=index.d.ts.map