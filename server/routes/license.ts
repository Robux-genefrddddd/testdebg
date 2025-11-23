import { RequestHandler } from "express";
import {
  LicenseVerificationRequest,
  LicenseVerificationResponse,
  Warning,
  SecurityAlert,
} from "@shared/api";
import {
  validateLicense,
  isLicenseExpired,
  getDaysRemaining,
} from "../lib/licenseUtils";

export const handleLicenseVerify: RequestHandler = async (req, res) => {
  try {
    const { email, licenseKey, deviceId }: LicenseVerificationRequest =
      req.body;

    if (!email || !deviceId) {
      return res.status(400).json({
        valid: false,
        error: "Email and device ID are required",
      });
    }

    const response: LicenseVerificationResponse = {
      valid: true,
      plan: "Gratuit",
      messageLimit: 10,
      messageCount: 0,
      canSendMessage: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      warnings: [],
      isBanned: false,
      isSuspended: false,
      alerts: [],
      maintenanceMode: false,
    };

    return res.json(response);
  } catch (error) {
    console.error("License verification error:", error);
    return res.status(500).json({
      valid: false,
      error: "License verification failed",
    });
  }
};

export const handleLicenseActivate: RequestHandler = async (req, res) => {
  try {
    const { email, licenseKey, deviceId } = req.body;

    if (!email || !licenseKey || !deviceId) {
      return res.status(400).json({
        error: "Email, license key, and device ID are required",
      });
    }

    const licenseKeyClean = licenseKey.replace(/-/g, "").toUpperCase();

    const response: LicenseVerificationResponse = {
      valid: true,
      plan: "Classic",
      messageLimit: 1000,
      messageCount: 0,
      canSendMessage: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      warnings: [],
      isBanned: false,
      isSuspended: false,
      alerts: [],
      maintenanceMode: false,
    };

    return res.json(response);
  } catch (error) {
    console.error("License activation error:", error);
    return res.status(500).json({
      error: "License activation failed",
    });
  }
};

export const handleIncrementMessageCount: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    return res.json({
      success: true,
      messageCount: 1,
      messageLimit: 1000,
    });
  } catch (error) {
    console.error("Increment message count error:", error);
    return res.status(500).json({
      error: "Failed to increment message count",
    });
  }
};
