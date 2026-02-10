// 票券详情响应类型
export interface TicketDetailResponse {
  code: number;
  message: string;
  data: {
    ticketId: number;
    ticketCode: string;
    activityId: number;
    activityName: string;
    activityTime: string;
    qrCodeUrl: string;
  };
}