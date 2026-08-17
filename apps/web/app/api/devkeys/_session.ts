// Compartido entre las rutas /api/devkeys* (no es una ruta: Next solo registra
// archivos llamados route.ts). La cookie guarda el JWT wallet-verified del
// agente, scoped a /api/devkeys para que ningún otro fetch la arrastre.

export const SESSION_COOKIE = 'nirium_keys_session';

export const SESSION_COOKIE_OPTS = {
    httpOnly: true as const,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/api/devkeys',
    maxAge: 55 * 60, // el JWT del agente vive 1h
};
