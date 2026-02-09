export interface sign {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  reason?: string;
  result: string;
  [property: string]: any;
}