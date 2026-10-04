import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getDb, nowIso, uid } from "./db";
import { getUserById } from "./queries";

const SESSION = "maqr_session";
export const COMPANY_COOKIE = "maqr_company";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const previous = Buffer.from(hash, "hex");
  return previous.length === next.length && timingSafeEqual(previous, next);
}

export async function setSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  getDb().prepare("INSERT INTO sessions (id, user_id, token_hash, created_at) VALUES (?, ?, ?, ?)").run(
    uid(),
    userId,
    sha256(token),
    nowIso(),
  );
  const jar = await cookies();
  jar.set(SESSION, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(SESSION)?.value;
  if (token) {
    getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
  }
  jar.delete(SESSION);
}

export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(SESSION)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare("SELECT user_id FROM sessions WHERE token_hash = ?")
    .get(sha256(token));
  if (!row) return null;
  return getUserById(String(row.user_id));
}

export async function preferredCompanyId() {
  const jar = await cookies();
  return jar.get(COMPANY_COOKIE)?.value ?? null;
}

export async function rememberCompany(companyId: string) {
  const jar = await cookies();
  jar.set(COMPANY_COOKIE, companyId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
