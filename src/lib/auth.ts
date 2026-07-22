// src/lib/auth.ts
// Session-based authentication for KMH ERP Suite
// Uses HTTP-only cookies + bcrypt password hashing
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import crypto from "crypto";
import { initDb } from "@/lib/init-db";

const SESSION_COOKIE = "kmh_session";
const SESSION_DURATION_DAYS = 7;

// ============================================================
// Password hashing (using Node's built-in scrypt to avoid bcrypt native dep)
// ============================================================
const ITERATIONS = 16384;
const KEY_LENGTH = 64;
const SALT_LENGTH = 32;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH, {
    N: ITERATIONS,
    r: 8,
    p: 1,
  });
  return `scrypt$${ITERATIONS}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const parts = stored.split("$");
    if (parts.length !== 4 || parts[0] !== "scrypt") return false;
    const iterations = parseInt(parts[1], 10);
    const salt = Buffer.from(parts[2], "hex");
    const expectedHash = Buffer.from(parts[3], "hex");
    const hash = crypto.scryptSync(password, salt, expectedHash.length, {
      N: iterations,
      r: 8,
      p: 1,
    });
    // constant-time comparison
    return crypto.timingSafeEqual(hash, expectedHash);
  } catch {
    return false;
  }
}

// ============================================================
// Session management
// ============================================================
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: string, req?: Request) {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  const ipAddress = req?.headers.get("x-forwarded-for")?.split(",")[0] || null;
  const userAgent = req?.headers.get("user-agent") || null;

  await db.session.create({
    data: { userId, token, expiresAt, ipAddress, userAgent },
  });

  return { token, expiresAt };
}

export async function getSession(token: string) {
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          organization: true,
          branch: true,
        },
      },
    },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }
  return session;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await getSession(token);
  return session?.user || null;
}

export async function requireAuth(allowedRoles?: string[]) {
  // Ensure DB is initialized before any auth check (for Vercel serverless)
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

export async function destroySession(token: string) {
  try {
    await db.session.delete({ where: { token } });
  } catch {
    // already deleted
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_MAX_AGE = SESSION_DURATION_DAYS * 24 * 60 * 60; // seconds

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
  ADMIN: [
    "dashboard.view", "cashier.use", "accounting.view", "accounting.manage",
    "hr.view", "hr.manage", "erp.view", "erp.manage",
    "users.manage", "audit.view", "settings.manage", "reports.view",
  ],
  ACCOUNTANT: [
    "dashboard.view", "cashier.use", "accounting.view", "accounting.manage",
    "hr.view", "erp.view", "reports.view",
  ],
  HR_MANAGER: [
    "dashboard.view", "hr.view", "hr.manage", "erp.view", "reports.view",
  ],
  CASHIER: [
    "dashboard.view", "cashier.use", "erp.view",
  ],
  INVENTORY_MANAGER: [
    "dashboard.view", "erp.view", "erp.manage", "reports.view",
  ],
  BRANCH_MANAGER: [
    "dashboard.view", "cashier.use", "hr.view", "erp.view", "reports.view",
  ],
};

export function hasPermission(role: string, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
