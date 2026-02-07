export interface QQCodeRegisterRequest {
  qq_email: string;
  captchaOutput?: string;
  genTime?: string;
  lotNumber?: string;
  passToken?: string;
}

export interface QQCodeForgotPasswordRequest {
  qq_email: string;
  captchaOutput?: string;
  genTime?: string;
  lotNumber?: string;
  passToken?: string;
}

export interface QQCodeDeleteUserRequest {
  qq_email: string;
  captchaOutput?: string;
  genTime?: string;
  lotNumber?: string;
  passToken?: string;
}
