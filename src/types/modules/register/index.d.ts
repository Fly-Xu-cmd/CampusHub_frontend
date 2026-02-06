import { Request as LoginRequest, Data as LoginData } from "./login";
import { Request as RegisterRequest, Data as RegisterData } from "./register";
import { Data as LogoutData } from "./logout";
import { Data as LogoffData, Request as LogoffRequest } from "./logoff";
import {
  Request as RefreshTokenRequest,
  Data as RefreshTokenData,
} from "./refresh_token";
import { CaptchaConfigData, VerifyCaptchaRequest } from "./captcha";
import {
  QQCodeRegisterRequest,
  QQCodeForgotPasswordRequest,
  QQCodeDeleteUserRequest,
} from "./qq";
import { ForgotPasswordRequest } from "./password";

export type {
  LoginRequest,
  LoginData,
  RegisterRequest,
  RegisterData,
  LogoutData,
  LogoffData,
  LogoffRequest,
  RefreshTokenRequest,
  RefreshTokenData,
  CaptchaConfigData,
  VerifyCaptchaRequest,
  QQCodeRegisterRequest,
  QQCodeForgotPasswordRequest,
  QQCodeDeleteUserRequest,
  ForgotPasswordRequest,
};
