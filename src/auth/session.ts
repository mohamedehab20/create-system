import { cookies } from "next/headers";
import { deleteSession, findUserById, insertSession, userIdForSession } from "@/data/store";
import { sha256 } from "./password";

const SESSION = "maqr_session";
export const COMPANY_COOKIE = "maqr_company";

export async function setSession(userId: string) {
  const token = randomToken();
  insertSession(userId, sha256(token));
  const jar = await cookies();
  jar.set(SESSION, token, cookieOptions());
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(SESSION)?.value;
  if (token) deleteSession(sha256(token));
  jar.delete(SESSION);
}

export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(SESSION)?.value;
  if (!token) return null;
  const userId = userIdForSession(sha256(token));
  if (!userId) return null;
  return findUserById(userId);
}

export async function preferredCompanyId() {
  const jar = await cookies();
  return jar.get(COMPANY_COOKIE)?.value ?? null;
}

export async function rememberCompany(companyId: string) {
  const jar = await cookies();
  jar.set(COMPANY_COOKIE, companyId, cookieOptions());
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
