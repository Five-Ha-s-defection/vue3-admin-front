import request from "@/utils/request";

const PaymentViewAPI = {
  GetPaymentMeathod() {
    return request({
      url: `/api/app/payment/meathod`,
      method: "get",
    });
  },

  GetPaymentPage(data: any) {
    return request<any, PaymentPageResult>({
      url: `/api/app/receivables/page`,
      method: "get",
      params: data,
    });
  },
};
export default PaymentViewAPI;

/** 分页查询参数 */
export interface PaymentPageQuery {
  PageIndex: number;
  PageSize: number;
  [key: string]: any; // 其他查询条件
}

/** 分页返回结构 */
export interface PaymentPageResult {
  totalCount: number;
  pageCount: number;
  data: [];
}

export interface ReceivableSearch {
  id:string;
  creationTime:string;
  creatorId: string;
  lastModificationTime:string;
  lastModifierId:string;
  isDeleted: true;
  deleterId: string;
  deletionTime:string;
  customerId:string;
  contractId:string;
  receivableId: string;
  userId:string;
  paymentCode: string;
  amount: 0;
  paymentMethod:string;
  paymentDate: string;
  approverIds: string[];
  currentStep: 0;
  approveComments: string[];
  approveTimes: string[];
  paymentStatus: 0;
  remark: string;
  receivablePay: 0;
}
