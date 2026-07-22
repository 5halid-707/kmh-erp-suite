// Shared helpers for KMH ERP API
import { db } from "@/lib/db";

export async function getFirstOrg() {
  const org = await db.organization.findFirst({
    include: { branches: true },
  });
  if (!org) throw new Error("No organization found");
  return org;
}

export async function getMainBranch() {
  const org = await getFirstOrg();
  return org.branches[0];
}

export function formatSAR(n: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("ar-SA").format(n);
}

export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(d));
}

export function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}
