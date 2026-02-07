export interface CaptchaConfigData {
  captchaId: string;
}

export interface VerifyCaptchaRequest {
  lotNumber: string;
  captchaOutput: string;
  passToken: string;
  genTime: string;
  [property: string]: any;
}
