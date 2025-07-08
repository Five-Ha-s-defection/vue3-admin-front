import request from "@/utils/request";

export const InvoiceViewAPI = {
  AddInvoice(data: any) {
    return request({
      url: `/api/app/invoice/invoice`,
      method: "post",
      data,
    });
  },
  GetInvoicePage(data: any) {
    return request<any, InvoicePageResult>({
      url: `/api/app/invoice/invoice-list`,
      method: "get",
      params: data,
    });
  },
  UpdateInvoice(id: string, data: any) {
    return request({
      url: `/api/app/invoice/${id}/invoice/`,
      method: "put",
      data,
    });
  },
  GetInvoicePayment(PaymentId: string) {
    return request({
      url: `/api/app/invoice/logs/${PaymentId}`,
      method: "get",
    });
  },
    //批量删除
  BatchDeleteInvoice(data: string[]) {
    return request({
      url: `/api/app/invoice`,
      method: "delete",
      data,
    });
  },
  
  DeleteInvoice(id: string) {
    return request({
      url: `/api/app/invoice/${id}/invoice`,
      method: "delete",
    });
  },
    InvoiceInstance(id: string, approverId: string | undefined,data: { isPass: boolean, comment: string }) {
    return request({
      url: `/api/app/invoice/${id}/approve/${approverId}`,
      method: "post",
      params: data,
    });
  },
}
export default InvoiceViewAPI;
export interface InvoicePageResult {
  totalCount: number;
  pageCount: number;
  data: [];
}
export interface InvoicePageQuery {
  PageIndex: number;
  PageSize: number;
  [key: string]: any; // 其他查询条件
}