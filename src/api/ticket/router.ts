import { get } from "@/utils/http";
import type { TicketListResponse } from "@/types/modules/ticket";
import type { TicketDetailResponse } from "@/types/modules/ticket-detail";

const apiUrls = {
    getTicketList: "/api/v1/activity/tickets",
    getTicketDetail: "/api/v1/activity/tickets/detail",
};

// 获取票券详情
export const getTicketDetail = (ticketId: string) => {
    return get<TicketDetailResponse>(`${apiUrls.getTicketDetail}?ticket_id=${ticketId}`);
};

// 获取票券列表
export const getTicketList = () => {
    return get<TicketListResponse>(apiUrls.getTicketList);
};