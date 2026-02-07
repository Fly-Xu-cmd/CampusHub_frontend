// Type definitions for Geetest v4
interface GeetestConfig {
  captchaId: string;
  product?: "float" | "popup" | "bind";
  nativeButton?: {
    width?: string;
    height?: string;
  };
  rem?: number;
  language?: string;
  protocol?: string;
  timeout?: number;
  hideBar?: string[];
  mask?: {
    outside?: boolean;
    bgColor?: string;
  };
  apiServers?: string[];
  nextWidth?: string;
  riskType?: string;
  hideSuccess?: boolean;
  userInfo?: string;
  offlineCb?: () => void;
  onError?: (err: any) => void;
}

interface GeetestCaptchaObj {
  appendTo: (selector: string | HTMLElement) => void;
  onReady: (callback: () => void) => GeetestCaptchaObj;
  onSuccess: (callback: () => void) => GeetestCaptchaObj;
  onError: (callback: (err: any) => void) => GeetestCaptchaObj;
  reset: () => void;
  showCaptcha: () => void;
  getValidate: () =>
    | {
        captcha_output: string;
        gen_time: string;
        lot_number: string;
        pass_token: string;
      }
    | false;
  destroy: () => void;
}

// Add initGeetest4 to global window object
declare global {
  interface Window {
    initGeetest4?: (
      config: GeetestConfig,
      handler: (captchaObj: GeetestCaptchaObj) => void,
    ) => void;
  }
}

/**
 * Dynamically loads the Geetest v4 SDK script.
 * @returns Promise that resolves when the script is loaded
 */
export const loadGeetestScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Geetest requires a browser environment"));
      return;
    }

    if (window.initGeetest4) {
      console.log("Geetest v4 SDK already loaded");
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://static.geetest.com/v4/gt4.js";
    script.async = true;
    script.onload = () => {
      // 轮询检查 initGeetest4 是否已挂载
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.initGeetest4) {
          clearInterval(checkInterval);
          resolve();
        } else if (attempts > 20) {
          // 最多等待 2秒 (20 * 100ms)
          clearInterval(checkInterval);
          reject(
            new Error("Geetest script loaded but initGeetest4 is not defined"),
          );
        }
      }, 100);
    };
    script.onerror = (err) => {
      reject(err);
    };
    document.body.appendChild(script);
  });
};
