import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod-or-you-will-be-fired'
);

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function verifyAuth(token: string | undefined) {
    if (!token) return null;
    const payload = await verifyToken(token);
    if (!payload) return null;
    // Normalize payload to have 'id' if currently 'userId'
    return {
        id: (payload.userId || payload.sub) as string,
        email: payload.email as string,
        role: payload.role as string,
        ...payload
    };
}
