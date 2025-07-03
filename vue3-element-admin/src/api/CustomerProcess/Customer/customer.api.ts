import request from "@/utils/request";

const CUSTOMER_BASE_URL = "/api/app/customer";

// 添加客户
export const AddCustomer= (data: any) => {
  return request({
    url: `${CUSTOMER_BASE_URL}/customer`,
    method: "post",
    data,
  });
}


// 显示客户
export const ShowCustomerList = (data: any) => {
  return request({
    url: `${CUSTOMER_BASE_URL}/show-customer`,
    method: "get",
    params: data,
  });
};

// 获取客户详情
export const GetCustomerDetail = (id: string) => {
  return request({
    url: `${CUSTOMER_BASE_URL}/${id}/customer-by-id`,
    method: "get",
  });
};

// 删除客户
export const DeleteCustomer = (id: string) => {
  return request({
    url: `${CUSTOMER_BASE_URL}/${id}/delete-customer`,
    method: "delete",
  });
};

// 修改客户
export const UpdateCustomer = (id: string, data: any) => {
  return request({
    url: `${CUSTOMER_BASE_URL}/${id}/upd-customer`,
    method: "put",
    data,
  });
};

// 获取用户下拉框
export const GetUserSelect = () => {
  return request({
    url: `${CUSTOMER_BASE_URL}/user-select-list`,
    method: "get",
  });
};

// 获取车架号下拉框
export const GetCarFrameNumberSelect = () => {
  return request({
    url: `${CUSTOMER_BASE_URL}/car-select-list`,
    method: "get",
  });
};

// 获取客户级别下拉框
export const GetCustomerLevelSelect = () => {
  return request({
    url: `${CUSTOMER_BASE_URL}/level-select-list`,
    method: "get",
  });
};

// 获取客户来源下拉框
export const GetCustomerSourceSelect = () => {
  return request({
    url: `${CUSTOMER_BASE_URL}/source-select-list`,
    method: "get",
  });
};

// 获取客户地区下拉框
export const GetCustomerRegionSelect = () => {
  return request({
    url: `${CUSTOMER_BASE_URL}/region-cascade-list`,
    method: "get",
  });
};

// 获取客户类别下拉框
export const GetCustomerTypeSelect = () => {
  return request({
    url: `${CUSTOMER_BASE_URL}/customer-type`,
    method: "get",
  });
};
//================刘畅的封装=================================
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
