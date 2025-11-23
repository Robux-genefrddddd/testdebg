import {
  LicensePlan,
  LicenseVerificationRequest,
  LicenseVerificationResponse,
} from "@shared/api";

export const LICENSE_LIMITS = {
  Gratuit: {
    messagesPerDay: 10,
    maxMessages: 10,
    duration: "Gratuit",
  },
  Classic: {
    messagesPerDay: 1000,
    maxMessages: 1000,
    duration: "Configurable",
  },
  Pro: {
    messagesPerDay: 5000,
    maxMessages: 5000,
    duration: "Configurable",
  },
};

export interface LicenseStatus {
  plan: LicensePlan;
  messagesRemaining: number;
  messagesTotal: number;
  expiresAt: Date;
  isExpired: boolean;
  daysRemaining: number;
  canSendMessage: boolean;
}

export class LicenseManager {
  static async verifyLicense(
    email: string,
    deviceId: string,
    licenseKey?: string,
  ): Promise<LicenseVerificationResponse> {
    const request: LicenseVerificationRequest = {
      email,
      deviceId,
      licenseKey,
    };

    const response = await fetch("/api/license/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("License verification failed");
    }

    return response.json();
  }

  static async activateLicense(
    email: string,
    licenseKey: string,
    deviceId: string,
  ): Promise<LicenseVerificationResponse> {
    const response = await fetch("/api/license/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        licenseKey,
        deviceId,
      }),
    });

    if (!response.ok) {
      throw new Error("License activation failed");
    }

    return response.json();
  }

  static getLicenseLimits(plan: LicensePlan) {
    return LICENSE_LIMITS[plan];
  }

  static calculateDaysRemaining(expiresAt: string): number {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  static isExpiringSoon(expiresAt: string, days: number = 7): boolean {
    return this.calculateDaysRemaining(expiresAt) <= days;
  }

  static canSendMessage(
    messageCount: number,
    plan: LicensePlan,
    isExpired: boolean,
  ): boolean {
    if (isExpired || messageCount >= LICENSE_LIMITS[plan].maxMessages) {
      return false;
    }
    return true;
  }

  static formatLicenseKey(key: string): string {
    return key
      .replace(/(.{4})/g, "$1-")
      .replace(/-$/, "")
      .toUpperCase();
  }

  static validateLicenseKeyFormat(key: string): boolean {
    const cleanKey = key.replace(/-/g, "");
    return cleanKey.length === 32 && /^[A-Za-z0-9]+$/.test(cleanKey);
  }
}
