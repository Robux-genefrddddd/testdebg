import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Zap, Copy, Check } from "lucide-react";
import LicenseDialog from "@/components/LicenseDialog";
import { copyToClipboard } from "@/lib/codeDisplay";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCopyLicenseKey = async () => {
    if (user?.licenseKey) {
      const success = await copyToClipboard(user.licenseKey);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Plus":
        return "#FF9500";
      case "Entreprise":
        return "#34C759";
      default:
        return "#888888";
    }
  };

  const getPlanDescription = (plan: string) => {
    switch (plan) {
      case "Gratuit":
        return "Free plan with 100 messages per month";
      case "Plus":
        return "Unlimited messages and priority support";
      case "Entreprise":
        return "Enterprise plan with dedicated support";
      default:
        return "Unknown plan";
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      {/* Header */}
      <div
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: "#000000", borderColor: "#1A1A1A" }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Back to chat"
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>
            Settings
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors"
          style={{
            backgroundColor: "#0A84FF",
            color: "#FFFFFF",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "#0070DD";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "#0A84FF";
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Account Information */}
          <section
            className="rounded-lg p-6 border"
            style={{
              backgroundColor: "#0D0D0D",
              borderColor: "#1A1A1A",
            }}
          >
            <h2 className="text-xl font-bold mb-6" style={{ color: "#FFFFFF" }}>
              Account Information
            </h2>

            <div className="space-y-4">
              <div>
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: "#888888" }}
                >
                  Name
                </p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: "#FFFFFF" }}
                >
                  {user?.name || "Not set"}
                </p>
              </div>

              <div>
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: "#888888" }}
                >
                  Email
                </p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: "#FFFFFF" }}
                >
                  {user?.email}
                </p>
              </div>

              <div>
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: "#888888" }}
                >
                  Member Since
                </p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: "#FFFFFF" }}
                >
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </section>

          {/* Plan Information */}
          <section
            className="rounded-lg p-6 border"
            style={{
              backgroundColor: "#0D0D0D",
              borderColor: "#1A1A1A",
            }}
          >
            <h2 className="text-xl font-bold mb-6" style={{ color: "#FFFFFF" }}>
              Current Plan
            </h2>

            <div
              className="rounded-lg p-6 mb-6 border-2"
              style={{
                backgroundColor: "#1A1A1A",
                borderColor: getPlanColor(user?.plan || ""),
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "#888888" }}
                  >
                    Your Plan
                  </p>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: getPlanColor(user?.plan || "") }}
                  >
                    {user?.plan || "Unknown"}
                  </h3>
                </div>
                {user?.plan !== "Gratuit" && (
                  <Zap
                    size={32}
                    style={{ color: getPlanColor(user?.plan || "") }}
                  />
                )}
              </div>

              <p style={{ color: "#888888" }}>
                {getPlanDescription(user?.plan || "")}
              </p>
            </div>

            {/* Usage Info for Free Plan */}
            {user?.plan === "Gratuit" && (
              <div
                className="rounded-lg p-4 mb-6"
                style={{
                  backgroundColor: "#1A1A1A",
                  borderLeft: "4px solid #0A84FF",
                }}
              >
                <p className="font-semibold mb-2" style={{ color: "#FFFFFF" }}>
                  Message Usage
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        ((user?.messageCount || 0) / 100) * 100,
                        100,
                      )}%`,
                      backgroundColor: "#0A84FF",
                    }}
                  />
                </div>
                <p style={{ color: "#888888" }}>
                  {user?.messageCount || 0} / 100 messages used
                </p>
              </div>
            )}

            {/* Upgrade Button */}
            {user?.plan === "Gratuit" && (
              <button
                onClick={() => setLicenseDialogOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors"
                style={{
                  backgroundColor: "#FF9500",
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "#FF8C00";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "#FF9500";
                }}
              >
                <Zap size={20} />
                Upgrade to Premium
              </button>
            )}
          </section>

          {/* License Information */}
          {user?.licenseKey && (
            <section
              className="rounded-lg p-6 border"
              style={{
                backgroundColor: "#0D0D0D",
                borderColor: "#1A1A1A",
              }}
            >
              <h2
                className="text-xl font-bold mb-6"
                style={{ color: "#FFFFFF" }}
              >
                License Information
              </h2>

              <div
                className="rounded-lg p-4 mb-4"
                style={{ backgroundColor: "#1A1A1A" }}
              >
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: "#888888" }}
                >
                  License Key
                </p>
                <div className="flex items-center gap-2">
                  <code
                    className="flex-1 px-3 py-2 rounded bg-gray-800 text-sm"
                    style={{ color: "#0A84FF" }}
                  >
                    {user.licenseKey}
                  </code>
                  <button
                    onClick={handleCopyLicenseKey}
                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                  >
                    {copied ? (
                      <Check size={20} className="text-green-400" />
                    ) : (
                      <Copy size={20} style={{ color: "#888888" }} />
                    )}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* License Dialog */}
      <LicenseDialog
        isOpen={licenseDialogOpen}
        onClose={() => setLicenseDialogOpen(false)}
      />
    </div>
  );
}
