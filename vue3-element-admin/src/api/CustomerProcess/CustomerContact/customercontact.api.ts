import request from "@/utils/request";

const CustomerContact_BASE_URL = "/api/app/customer-contact";


// 添加客户联系人
export const AddCustomerContact = (data: any) => {
  return request({
    url: `${CustomerContact_BASE_URL}/customer-contact`,
    method: "post",
    data,
  });
}

// 显示客户联系人
export const ShowCustomerContactList = (data: any) => {
  return request({
    url: `${CustomerContact_BASE_URL}/show-customer-contact`,
    method: "get",
    params: data,
  });
}

// 获取客户联系人详情
export const GetCustomerContactDetail = (id: string) => {
  return request({
    url: `${CustomerContact_BASE_URL}/${id}/customer-contact-by-id`,
    method: "get",
  });
}

// 删除客户联系人
export const DeleteCustomerContact = (id: string) => {
  return request({
    url: `${CustomerContact_BASE_URL}/${id}/del-customer-contact`,
    method: "delete",
  });
}

// 修改客户联系人
export const UpdateCustomerContact = (id: string, data: any) => {
  return request({
    url: `${CustomerContact_BASE_URL}/${id}/upd-customer-contact`,
    method: "put",
    data,
  });
}

// 获取客户下拉框
export const GetCustomerSelect = () => {
  return request({
    url: `${CustomerContact_BASE_URL}/customer-list`,
    method: "get",
  });
}

//============差一个获取联系人关系下拉框=====================================

//获取角色下拉框
export const GetRoleSelect = () => {
  return request({
    url: `${CustomerContact_BASE_URL}/role-dto-list`,
    method: "get",
  });
};