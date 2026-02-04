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
      ticket_id: number;
      ticket_code?: string;
      activity_id: number;
      activity_name: string;
      activity_time: string;
      activity_image_url?: string;
      status: number;
    }>;
  };
}