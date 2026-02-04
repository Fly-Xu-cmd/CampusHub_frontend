// 票券详情响应类型
export interface TicketDetailResponse {
  code: number;
  message: string;
  data: {
    ticket_id: number;
    ticket_code: string;
    activity_id: number;
    activity_name: string;
    activity_time: string;
    qr_code_url: string;
  };
}