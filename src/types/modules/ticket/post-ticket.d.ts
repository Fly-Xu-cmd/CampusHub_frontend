export interface Response {
    code: number;
    data: Data;
    message: string;
    [property: string]: any;
}

export interface Data {
    /**
     * 核销结果
     */
    result: string;
    [property: string]: any;
}

export interface Request {
    /**
     * 票券码
     */
    ticket_code: string;
    /**
     * totp验证码
     */
    totp_code: string;
    [property: string]: any;
}
