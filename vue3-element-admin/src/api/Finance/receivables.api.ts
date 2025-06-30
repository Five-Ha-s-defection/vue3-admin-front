import request from "@/utils/request";

const ReceivablesViewAPI = {
  GetReceivablesPage(data: any) {
    return request<any, ReceivablesPageResult>({
      url: `/api/app/receivables/page`,
      method: "get",
      params: data,
    });
  },

  AddReceivable(data: any) {
    return request({
      url: `/api/app/receivables`,
      method: "post",
      data,
    });
  },
  //删除
  DeleteReceivable(id: string) {
    return request({
      url: `/api/app/receivables/${id}`,
      method: "delete",
    });
  },
  //批量删除
  BatchDeleteReceivables(data: string[]) {
    return request({
      url: `/api/app/receivables`,
      method: "delete",
      data,
    });
  },
  UpdateReceivable(id: string, data: any) {
    return request({
      url: `/api/app/receivables/${id}`,
      method: "put",
      params:data,
    });
  },
};

export default ReceivablesViewAPI;

/** 分页查询参数 */
export interface ReceivablesPageQuery {
  PageIndex: number;
  PageSize: number;
  [key: string]: any; // 其他查询条件
}

/** 分页返回结构 */
export interface ReceivablesPageResult {
  totalCount: number;
  pageCount: number;
  data: ReceivableSearch[];
}

/** 新增/编辑表单 */
export interface ReceivableForm {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  isDeleted: true;
  deleterId: string;
  deletionTime: string;
  customerId: string;
  contractId: string;
  userId: string;
  receivableCode: string;
  receivablePay: 0;
  receivableDate: string;
  remark: string | null;
  customerName: string | null;
  contractName: string | null;
  userName: string | null;
}

/** 列表项 */

export interface ReceivableSearch {
  id: string;
  name: string;
  amount: number;
  customerId: string;
  contractId: string;
  userId: string;
  receivableCode: string;
  receivablePay: number;
  receivableDate: string; // 建议用 string，后端返回 ISO 时间字符串
  remark: string | null;
  customerName: string | null;
  contractName: string | null;
  userName: string | null;
  isDeleted: boolean;
  deleterId: string | null;
  deletionTime: string | null;
  lastModificationTime: string | null;
  lastModifierId: string | null;
  creationTime: string | null;
  creatorId: string | null;
}
