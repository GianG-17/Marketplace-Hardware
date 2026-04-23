import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export function isBcryptHash(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(value)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!isBcryptHash(storedHash)) return false
  return bcrypt.compare(password, storedHash)
}
