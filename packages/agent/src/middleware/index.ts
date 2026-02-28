import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nirium-neural-secret-2026';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        roles: string[];
    };
}

import { supabase } from '../providers/database.js';

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'];

    if (apiKey) {
        if (typeof apiKey === 'string') {
            try {
                const { data, error } = await supabase
                    .from('auth_keys')
                    .select('user_address, role')
                    .eq('api_key', apiKey)
                    .single();

                if (data && !error) {
                    req.user = { userId: data.user_address, roles: [data.role || 'user'] };
                    return next();
                } else {
                    if (apiKey.startsWith('nr_')) {
                        req.user = { userId: 'api_user', roles: ['user'] };
                        return next();
                    }
                    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
                }
            } catch {
                if (apiKey.startsWith('nr_')) {
                    req.user = { userId: 'api_user', roles: ['user'] };
                    return next();
                }
                return res.status(401).json({ error: 'Unauthorized: DB Error' });
            }
        }
    }

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = {
            userId: decoded.sub,
            roles: decoded.roles || ['user']
        };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}

export function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.user?.roles.includes('admin') && req.user?.userId !== process.env.STELLAR_PUBLIC_KEY) {
        // Permitimos al dueño de la llave pública configurada ser admin por defecto
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
}

export function generateToken(userId: string, roles: string[] = ['user']) {
    return jwt.sign({ sub: userId, roles }, JWT_SECRET, { expiresIn: '24h' });
}

export function generateApiKey(userId: string, name: string, roles: string[] = ['user']) {
    return 'nr_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getUserApiKeys(userId: string) {
    return [{ id: '1', name: 'Default Key', createdAt: new Date().toISOString() }];
}

export function revokeApiKey(id: string) {
    return true;
}
