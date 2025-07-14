import request from "@/utils/request";

const BusinessOpportunity_BASE_URL = "/api/app/business-opportunity";


// 添加商机
export const AddBusinessOpportunity = (data: any) => {
  return request({
    url: `${BusinessOpportunity_BASE_URL}/business-opportunity`,
    method: "post",
    data,
  });
}

// 获取客户下拉框
export const GetCustomerSelect = () => {
  return request({
    url: `${BusinessOpportunity_BASE_URL}/customer-select-list`,
    method: "get",
  });
};

// 获取商机优先级下拉框
export const GetBusinessPrioritySelect = () => {
  return request({
    url: `${BusinessOpportunity_BASE_URL}/priority-select-list`,
    method: "get",
  });
};

// 获取商机销售进度下拉框
export const GetBusinessSalesProgressSelect = () => {
  return request({
    url: `${BusinessOpportunity_BASE_URL}/sales-progress-select-list`,
    method: "get",
  });
};

// 获取产品下拉框
export const GetProductSelect = () => {
  return request({
    url: `${BusinessOpportunity_BASE_URL}/product-select-list`,
    method: "get",
  });
};


// 显示商机
export const ShowBusinessOpportunityList = (data: any) => {
  return request({
    url: `${BusinessOpportunity_BASE_URL}/show-business-opportunity`,
    method: "get",
    params: data,
  });
}

// 删除商机
export const DeleteBusinessOpportunity = (id: string) => {
  return request({
    url: `${BusinessOpportunity_BASE_URL}/${id}/del-business-opportunity`,
    method: "delete",
  });
};

// 更新商机销售进度
export const UpdateBusinessProgress = (id: string, salesProgressId: string | number) => {
  return request({
    url: `${BusinessOpportunity_BASE_URL}/${id}/update-progress`,
    method: "put",
    data: {
      salesProgressId
    }
  });
}