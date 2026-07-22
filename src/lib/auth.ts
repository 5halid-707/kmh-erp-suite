// src/lib/auth.ts
// JWT-based authentication for KMH ERP Suite
// Uses signed JWT cookies (no DB session lookup needed — works on Vercel serverless)
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";
import { initDb } from "@/lib/init-db";

const SESSION_COOKIE = "kmh_session";
const SESSION_DURATION_DAYS = 7;
const JWT_SECRET = process.env.JWT_SECRET || "kmh-erp-dev-secret-change-in-production-2026";

// ============================================================
// Password hashing (using Node's built-in scrypt)
// ============================================================
const ITERATIONS = 16384;
const KEY_LENGTH = 64;
const SALT_LENGTH = 32;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH, { N: ITERATIONS, r: 8, p: 1 });
  return `scrypt$${ITERATIONS}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const parts = stored.split("$");
    if (parts.length !== 4 || parts[0] !== "scrypt") return false;
    const iterations = parseInt(parts[1], 10);
    const salt = Buffer.from(parts[2], "hex");
    const expectedHash = Buffer.from(parts[3], "hex");
    const hash = crypto.scryptSync(password, salt, expectedHash.length, { N: iterations, r: 8, p: 1 });
    return crypto.timingSafeEqual(hash, expectedHash);
  } catch {
    return false;
  }
}

// ============================================================
// JWT creation & verification (no DB needed)
// ============================================================
interface JwtPayload {
  userId: string;
  organizationId: string;
  email: string;
  name: string;
  role: string;
  branchId?: string | null;
  avatarColor: string;
  isActive: boolean;
  iat: number;
  exp: number;
}

function base64UrlEncode(obj: any): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

function base64UrlDecode(str: string): any {
  return JSON.parse(Buffer.from(str, "base64url").toString());
}

export function createJwt(user: any): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    userId: user.id,
    organizationId: user.organizationId,
    email: user.email,
    name: user.name,
    role: user.role,
    branchId: user.branchId || null,
    avatarColor: user.avatarColor || "cyan",
    isActive: user.isActive,
    iat: now,
    exp: now + SESSION_DURATION_DAYS * 86400,
  };
  const header = base64UrlEncode({ alg: "HS256", typ: "JWT" });
  const body = base64UrlEncode(payload);
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null;
    const payload = base64UrlDecode(body) as JwtPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ============================================================
// Current user (from JWT cookie — no DB lookup)
// ============================================================
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyJwt(token);
  if (!payload) return null;
  // Return user object matching the shape expected by APIs
  return {
    id: payload.userId,
    organizationId: payload.organizationId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    branchId: payload.branchId || null,
    avatarColor: payload.avatarColor,
    isActive: payload.isActive,
    organization: { id: payload.organizationId },
  };
}

export async function requireAuth(allowedRoles?: string[]) {
  // Ensure DB is initialized (for Vercel serverless)
  try {
    await initDb();
  } catch (e) {
    console.error("[auth] initDb failed:", e);
  }
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: "UNAUTHORIZED", status: 401 };
  }
  if (!user.isActive) {
    return { user: null, error: "ACCOUNT_DISABLED", status: 403 };
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { user, error: "FORBIDDEN", status: 403 };
  }
  return { user, error: null, status: 200 };
}

// Session creation is now just JWT creation
export async function createSession(user: any, _req?: Request) {
  const token = createJwt(user);
  return { token, expiresAt: new Date(Date.now() + SESSION_DURATION_DAYS * 86400 * 1000) };
}

// Logout = just delete cookie (JWT is stateless)
export async function destroySession(_token: string) {
  // No-op for JWT — cookie deletion on client side is enough
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_MAX_AGE = SESSION_DURATION_DAYS * 24 * 60 * 60;

// ============================================================
// Role hierarchy (for permission checks on client side)
// ============================================================
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "مدير النظام",
  ACCOUNTANT: "محاسب",
  HR_MANAGER: "مدير الموارد البشرية",
  CASHIER: "كاشير",
  INVENTORY_MANAGER: "أمين مخزن",
  BRANCH_MANAGER: "مدير فرع",
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ["*"],
  ACCOUNTANT: ["dashboard", "cashier", "customers", "accounting", "hr.view", "erp.view", "reports"],
  HR_MANAGER: ["dashboard", "customers", "hr", "erp.view", "reports"],
  CASHIER: ["dashboard", "cashier", "customers", "erp.view"],
  INVENTORY_MANAGER: ["dashboard", "customers", "erp", "reports"],
  BRANCH_MANAGER: ["dashboard", "cashier", "customers", "hr.view", "erp.view", "reports"],
};

export function hasPermission(role: string, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes("*") || ROLE_PERMISSIONS[role]?.includes(permission);
}
