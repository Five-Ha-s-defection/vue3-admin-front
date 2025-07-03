import request from "@/utils/request";

const CLUE_BASE_URL = "/api/app/clue";

const CustomerAPI = {
  GetCustomerPage(data: any) {
    return request<any, CustomerPageResult>({
      url: `/api/app/customer/show-customer`,
      method: "get",
      params: data,
    }); 
  },
};

export default CustomerAPI;

/** 分页查询参数 */
export interface CustomerPageQuery {
  PageIndex: number;
  PageSize: number;
  [key: string]: any; // 其他查询条件
}
/** 分页返回结构 */
export interface CustomerPageResult {
  totalCount: number;
  pageCount: number;
  data: [];
}

export interface CustomerData {
  userId: "";
  customerName: "";
  checkAmount: 0;
  carFrameNumberId: "";
  customerExpireTime: "";
  customerLevelId: "";
  customerPhone: "";
  customerEmail: "";
  customerTypeId: "";
  customerSourceId: "";
  customerRegionId: "";
  customerAddress: "";
  customerRemark: "";
  clueId: "";
  clueWechat: "";
  lastFollowTime: "";
  nextContactTime: "";
  createName: "";
  isDeleted: false;
  deleterId: string;
  deletionTime: string;
  lastModificationTime: string;
  lastModifierId: string;
  creationTime: "";
  creatorId: "";
  id: "";
}
