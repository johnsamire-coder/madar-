import { compare, hash } from "bcryptjs";

const DUMMY_HASH = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxNJl3mVbWkq6EKZ7fZPgeEaOga";

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash?: string) {
  const matches = await compare(password, passwordHash ?? DUMMY_HASH);
  return Boolean(passwordHash) && matches;
}
