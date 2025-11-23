export class AntiBypass {
  private static devToolsDetected = false;
  private static incognitoDetected = false;

  static detectDevTools(): boolean {
    if (this.devToolsDetected) return true;

    try {
      const threshold = 160;
      const detections = {
        widthCheck: window.outerWidth - window.innerWidth > threshold,
        heightCheck: window.outerHeight - window.innerHeight > threshold,
      };

      if (Object.values(detections).some((v) => v)) {
        this.devToolsDetected = true;
        return true;
      }
    } catch (err) {
      console.warn("DevTools detection error:", err);
    }

    return false;
  }

  static detectIncognitoMode(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.incognitoDetected) {
        resolve(true);
        return;
      }

      try {
        const fs =
          window.requestFileSystem || (window as any).webkitRequestFileSystem;

        if (fs) {
          fs(
            window.TEMPORARY,
            1024,
            () => {
              resolve(false);
            },
            () => {
              this.incognitoDetected = true;
              resolve(true);
            },
          );
        } else {
          resolve(false);
        }
      } catch (err) {
        console.warn("Incognito detection error:", err);
        resolve(false);
      }
    });
  }

  static preventLocalStorageModification(): void {
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    const originalClear = Storage.prototype.clear;

    const protectedKeys = [
      "license_key",
      "license_verified",
      "device_fingerprint",
      "auth_token",
    ];

    Storage.prototype.setItem = function (key: string, value: string) {
      if (protectedKeys.some((pk) => key.startsWith(pk))) {
        console.warn(`Attempted modification of protected key: ${key}`);
        return;
      }
      originalSetItem.call(this, key, value);
    };

    Storage.prototype.removeItem = function (key: string) {
      if (protectedKeys.some((pk) => key.startsWith(pk))) {
        console.warn(`Attempted deletion of protected key: ${key}`);
        return;
      }
      originalRemoveItem.call(this, key);
    };

    Storage.prototype.clear = function () {
      console.warn("Attempted to clear all localStorage");
      const nonProtectedItems: { key: string; value: string }[] = [];

      for (let i = 0; i < this.length; i++) {
        const key = this.key(i);
        if (key && !protectedKeys.some((pk) => key.startsWith(pk))) {
          nonProtectedItems.push({
            key,
            value: this.getItem(key) || "",
          });
        }
      }

      originalClear.call(this);

      nonProtectedItems.forEach(({ key, value }) => {
        originalSetItem.call(this, key, value);
      });
    };
  }

  static preventConsoleDebugger(): void {
    const disableDevTools = () => {
      document.addEventListener("keydown", (e) => {
        if (
          e.key === "F12" ||
          (e.ctrlKey && e.shiftKey && e.key === "I") ||
          (e.ctrlKey && e.shiftKey && e.key === "J") ||
          (e.ctrlKey && e.key === "U")
        ) {
          e.preventDefault();
          console.warn("Developer tools access blocked");
        }
      });

      Object.defineProperty(document, "onkeydown", {
        value: null,
      });

      (window as any).eval = function () {
        throw new Error("eval() is disabled");
      };
    };

    disableDevTools();

    (window as any).console.log = (...args: any[]) => {
      if (
        args.some((arg) => typeof arg === "string" && arg.includes("devtools"))
      ) {
        return;
      }
    };
  }

  static preventProxyBypass(): void {
    const checkHeaders = (config: any) => {
      if (config && typeof config === "object") {
        for (const key in config) {
          if (
            key.toLowerCase().includes("proxy") ||
            key.toLowerCase().includes("vpn")
          ) {
            console.warn(`Proxy/VPN configuration detected: ${key}`);
            delete config[key];
          }
        }
      }
      return config;
    };

    const originalFetch = window.fetch;
    window.fetch = function (...args: any[]) {
      if (args.length > 1 && typeof args[1] === "object") {
        checkHeaders(args[1]);
      }
      return originalFetch.apply(this, args);
    };
  }

  static monitorUserAgent(): void {
    const originalUserAgent = Object.getOwnPropertyDescriptor(
      Navigator.prototype,
      "userAgent",
    );

    Object.defineProperty(Navigator.prototype, "userAgent", {
      get: function () {
        const ua = originalUserAgent?.get?.call(this) || "";
        console.log("User Agent Access:", ua);
        return ua;
      },
      configurable: true,
    });
  }

  static preventUrlModification(): void {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args: any[]) {
      console.log("URL change attempt:", args);
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args: any[]) {
      console.log("URL replace attempt:", args);
      return originalReplaceState.apply(this, args);
    };
  }

  static blockVpnBypass(): void {
    const blockedPatterns = [/vpn/i, /proxy/i, /anonymizer/i, /tor/i, /hide/i];

    const checkValue = (value: string): boolean => {
      return blockedPatterns.some((pattern) => pattern.test(value));
    };

    (window as any).addEventListener("beforeunload", () => {
      const allHeaders = (window as any).requestHeaders || {};
      for (const key in allHeaders) {
        if (checkValue(key) || checkValue(String(allHeaders[key]))) {
          console.warn(`VPN/Proxy attempt detected: ${key}`);
        }
      }
    });
  }

  static initializeAllProtections(): void {
    this.preventLocalStorageModification();
    this.preventConsoleDebugger();
    this.preventProxyBypass();
    this.monitorUserAgent();
    this.preventUrlModification();
    this.blockVpnBypass();

    setInterval(() => {
      if (this.detectDevTools()) {
        console.warn("DevTools detected. Security measures activated.");
      }
    }, 1000);

    this.detectIncognitoMode().then((incognito) => {
      if (incognito) {
        console.warn("Incognito mode detected. Some features are disabled.");
      }
    });
  }
}
