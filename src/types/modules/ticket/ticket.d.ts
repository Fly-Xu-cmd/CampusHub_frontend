// 票券数据类型定义
export interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  eventTime: string;
  eventLocation: string;
  ticketNumber: string;
  status: 'pending' | 'used';
  qrCodeUrl: string;
  createdAt: string;
}



// 票券列表响应类型
export interface TicketListResponse {
  code: number;
  message: string;
  data: {
    total: number;
    items: Array<{
      ticketId: number;
      ticketCode?: string;
      activityId: number;
      activityName: string;
      activityTime: string;
      activityImageUrl?: string;
      status: number;
    }>;
    page: number;
    pageSize: number;
  };
}