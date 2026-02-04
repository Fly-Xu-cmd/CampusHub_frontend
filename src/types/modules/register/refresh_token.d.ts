export interface Request {
  refreshToken: string;
  [property: string]: any;
}

export interface Data {
  accessToken: string;
  [property: string]: any;
}