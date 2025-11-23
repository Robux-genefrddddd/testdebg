import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/codeDisplay";
import { useAuth } from "@/hooks/useAuth";

interface LicenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface License {
  id: string;
  key: string;
  plan: "Gratuit" | "Plus" | "Entreprise";
  createdAt: Date;
  usedBy?: string;
  isActive: boolean;
}

export default function LicenseDialog({ isOpen, onClose }: LicenseDialogProps) {
  const { updatePlan, user } = useAuth();
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const storedLicenses = localStorage.getItem("admin_licenses");
    if (!storedLicenses) {
      setError("No valid licenses found. Contact administrator.");
      return;
    }

    const licenses: License[] = JSON.parse(storedLicenses);
    const license = licenses.find((lic) => lic.key === licenseKey);

    if (!license) {
      setError("Invalid license key");
      return;
    }

    if (!license.isActive) {
      setError("This license key has been deactivated");
      return;
    }

    if (license.usedBy && license.usedBy !== user?.id) {
      setError("This license key is already in use by another account");
      return;
    }

    updatePlan(license.plan)
      .then(() => {
        const updated = licenses.map((lic) =>
          lic.id === license.id ? { ...lic, usedBy: user?.id } : lic,
        );
        localStorage.setItem("admin_licenses", JSON.stringify(updated));
        setLicenseKey("");
        setError("");
        onClose();
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to upgrade plan");
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl p-8 w-full max-w-md shadow-2xl border overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E5E7EB",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: "#111827" }}>
            Upgrade Plan
          </h2>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Unlock more features and messages
          </p>
        </div>

        <div
          className="rounded-lg p-4 mb-6 border"
          style={{
            backgroundColor: "#F9FAFB",
            borderColor: "#E5E7EB",
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Current Plan:
            </p>
            <p className="font-semibold text-sm" style={{ color: "#0A84FF" }}>
              {user?.plan}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Messages Used:
            </p>
            <p className="font-semibold text-sm" style={{ color: "#111827" }}>
              {user?.messageCount || 0}
              <span style={{ color: "#9CA3AF" }}>/100</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "#111827" }}
            >
              License Key
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="Paste your license key here"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all duration-200"
              style={{
                backgroundColor: "#F3F4F6",
                borderColor: licenseKey ? "#0A84FF" : "#E5E7EB",
                color: "#111827",
              }}
            />
          </div>

          {error && (
            <div
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: "#FEE2E2",
                borderColor: "#FECACA",
              }}
            >
              <p className="text-sm font-medium" style={{ color: "#DC2626" }}>
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!licenseKey.trim()}
              className="flex-1 font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: licenseKey.trim() ? "#0A84FF" : "#D1D5DB",
                color: "#FFFFFF",
              }}
              onMouseEnter={(e) => {
                if (licenseKey.trim()) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "#0070DD";
                }
              }}
              onMouseLeave={(e) => {
                if (licenseKey.trim()) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "#0A84FF";
                }
              }}
            >
              Activate License
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 font-semibold py-3 rounded-lg transition-colors duration-200 border"
              style={{
                backgroundColor: "#F3F4F6",
                borderColor: "#E5E7EB",
                color: "#111827",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "#E5E7EB";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "#F3F4F6";
              }}
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t" style={{ borderColor: "#E5E7EB" }}>
          <p className="text-xs" style={{ color: "#9CA3AF" }}>
            Don't have a license key? Contact your administrator to get one.
          </p>
        </div>
      </div>
    </div>
  );
}
