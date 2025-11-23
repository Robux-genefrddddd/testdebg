import { useState } from "react";
import { LicenseManager } from "@/lib/licenseManager";
import { AlertCircle, Loader } from "lucide-react";

interface LicenseActivationModalProps {
  email: string;
  deviceId: string;
  onActivationSuccess: () => void;
  onClose: () => void;
}

export default function LicenseActivationModal({
  email,
  deviceId,
  onActivationSuccess,
  onClose,
}: LicenseActivationModalProps) {
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "processing">("input");

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!licenseKey.trim()) {
      setError("Veuillez entrer une clé de licence");
      return;
    }

    if (!LicenseManager.validateLicenseKeyFormat(licenseKey)) {
      setError(
        "Format de clé de licence invalide. Le format doit être XXXX-XXXX-XXXX-XXXX...",
      );
      return;
    }

    setLoading(true);
    setStep("processing");

    try {
      await LicenseManager.activateLicense(email, licenseKey, deviceId);
      onActivationSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'activation de la licence",
      );
      setStep("input");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          Activer une Licence
        </h2>
        <p className="text-slate-400 mb-6">
          Entrez votre clé de licence pour accéder aux plans payants
        </p>

        {step === "input" && (
          <form onSubmit={handleActivate}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Clé de Licence
                </label>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => {
                    let value = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9-]/g, "");
                    if (value.length > 0 && !value.includes("-")) {
                      const cleaned = value.replace(/-/g, "");
                      if (cleaned.length > 4) {
                        value = cleaned
                          .replace(/(.{4})/g, "$1-")
                          .replace(/-$/, "");
                      }
                    }
                    setLicenseKey(value);
                  }}
                  placeholder="XXXX-XXXX-XXXX-XXXX..."
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex gap-2 p-3 bg-red-950 border border-red-700 rounded-lg">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Activer
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </form>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader className="text-blue-400 animate-spin mb-4" size={32} />
            <p className="text-slate-300 font-medium">
              Activation de votre licence...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
