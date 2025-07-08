import request from "@/utils/request";

const CustomerContact_BASE_URL = "/api/app/customer-contact";

const CustomerContactAPI = {
  // 添加客户联系人
  AddCustomerContact(data: any) {
    return request({
      url: `${CustomerContact_BASE_URL}/customer-contact`,
      method: "post",
      data,
    });
  },

  // 显示客户联系人
  ShowCustomerContactList(data: any) {
    return request({
      url: `${CustomerContact_BASE_URL}/show-customer-contact`,
      method: "get",
      params: data,
    });
  },

  // 获取客户联系人详情
  GetCustomerContactDetail(id: string) {
    return request({
      url: `${CustomerContact_BASE_URL}/${id}/customer-contact-by-id`,
      method: "get",
    });
  },

  // 删除客户联系人
  DeleteCustomerContact(id: string) {
    return request({
      url: `${CustomerContact_BASE_URL}/${id}/del-customer-contact`,
      method: "delete",
    });
  },

  // 修改客户联系人
  UpdateCustomerContact(id: string, data: any) {
    return request({
      url: `${CustomerContact_BASE_URL}/${id}/upd-customer-contact`,
      method: "put",
      data,
    });
  },

  // 获取客户下拉框
  GetCustomerSelect() {
    return request({
      url: `${CustomerContact_BASE_URL}/customer-list`,
      method: "get",
    });
  },
  // 获取关系下拉框
  GetRelationSelect() {
    return request({
      url: `${CustomerContact_BASE_URL}/contact-relation-list`,
      method: "get",
    });
  },
  // 获取角色下拉框
  GetRoleSelect() {
    return request({
      url: `${CustomerContact_BASE_URL}/role-dto-list`,
      method: "get",
    });
  },

  UpdateIsPrimaryContact(id: string, data: any) {
    return request({
      url: `${CustomerContact_BASE_URL}/${id}/is-primary-customer-contact`,
      method: "put",
      params:data,
    });
  }
};

export default CustomerContactAPI;
