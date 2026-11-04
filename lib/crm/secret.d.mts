export function encryptSecret(plain: string, env?: Record<string, string | undefined>): string;
export function decryptSecret(stored: unknown, env?: Record<string, string | undefined>): string | null;
