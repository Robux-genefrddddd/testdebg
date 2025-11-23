import { randomBytes } from "crypto";
import { LicensePlan, LicenseKey } from "@shared/api";

export const MESSAGE_LIMITS = {
  Gratuit: 10,
  Classic: 1000,
  Pro: 5000,
};

export function generateLicenseKey(): string {
  const random = randomBytes(16);
  return random.toString("hex").toUpperCase();
}

export function validateLicenseKeyFormat(key: string): boolean {
  const cleanKey = key.replace(/-/g, "").toUpperCase();
  return cleanKey.length === 32 && /^[A-Fa-f0-9]{32}$/.test(cleanKey);
}

export function formatLicenseKey(key: string): string {
  const cleanKey = key.replace(/-/g, "").toUpperCase();
  return cleanKey.replace(/(.{4})/g, "$1-").replace(/-$/, "");
}

export function calculateMessageLimit(plan: LicensePlan): number {
  return MESSAGE_LIMITS[plan] || MESSAGE_LIMITS.Gratuit;
}

export function calculateExpiryDate(durationDays: number): Date {
  const now = new Date();
  const expiry = new Date(now);
  expiry.setDate(expiry.getDate() + durationDays);
  return expiry;
}

export function isLicenseExpired(expiresAt: Date | string): boolean {
  const expires =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return new Date() > expires;
}

export function getDaysRemaining(expiresAt: Date | string): number {
  const expires =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  const diffMs = expires.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function shouldResetMessageCount(lastResetDate: Date | string): boolean {
  const lastReset =
    typeof lastResetDate === "string" ? new Date(lastResetDate) : lastResetDate;
  const now = new Date();

  const lastResetTime = new Date(lastReset);
  lastResetTime.setHours(0, 0, 0, 0);

  const nowTime = new Date(now);
  nowTime.setHours(0, 0, 0, 0);

  return lastResetTime.getTime() < nowTime.getTime();
}

export function getNextResetTime(): Date {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next;
}

export interface LicenseValidationResult {
  valid: boolean;
  reason?: string;
  plan?: LicensePlan;
  messageLimit?: number;
  messageCount?: number;
  isExpired?: boolean;
  canSendMessage?: boolean;
}

export function validateLicense(
  plan: LicensePlan,
  messageCount: number,
  expiresAt: Date | string,
  isBanned: boolean = false,
  isSuspended: boolean = false,
): LicenseValidationResult {
  if (isBanned) {
    return {
      valid: false,
      reason: "Account is permanently banned",
    };
  }

  if (isSuspended) {
    return {
      valid: false,
      reason: "Account is temporarily suspended",
    };
  }

  const isExpired = isLicenseExpired(expiresAt);
  if (isExpired && plan !== "Gratuit") {
    return {
      valid: false,
      reason: "License has expired",
      plan,
      isExpired: true,
    };
  }

  const limit = calculateMessageLimit(plan);
  const canSend = messageCount < limit;

  if (!canSend) {
    return {
      valid: false,
      reason: `Message limit of ${limit} reached`,
      plan,
      messageLimit: limit,
      messageCount,
      canSendMessage: false,
    };
  }

  return {
    valid: true,
    plan,
    messageLimit: limit,
    messageCount,
    isExpired: false,
    canSendMessage: true,
  };
}
