import { get } from "@/utils/http";
import type { TicketListResponse } from "@/types/modules/ticket/ticket";
import type { TicketDetailResponse } from "@/types/modules/ticket/ticket-detail";
import { post } from "@/utils/http";
import type { Response } from "@/types/modules/ticket/post-ticket";
import type { Request } from "@/types/modules/ticket/post-ticket";

const apiUrls = {
    getTicketList: "/api/v1/activity/tickets",
    getTicketDetail: "/api/v1/activity/tickets/detail",
    postVerifyTicket: "/api/v1/activity/verify",
};

// 获取票券详情
export const getTicketDetail = (ticketId: string) => {
    return get<TicketDetailResponse>(`${apiUrls.getTicketDetail}?ticket_id=${ticketId}`);
};

// 获取票券列表
export const getTicketList = () => {
    return get<TicketListResponse>(apiUrls.getTicketList);
};

// 核销二维码
export const postVerifyTicket = (data: Request) => {
    return post<Response>(apiUrls.postVerifyTicket, data);
};
