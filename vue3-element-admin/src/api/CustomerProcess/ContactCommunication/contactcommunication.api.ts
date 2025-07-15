import request from "@/utils/request";

const COMMUNICATION_BASE_URL = "/api/app/contact-communication";

// 添加联系沟通
export const AddContactCommunication = (data: any) => {
  return request({
    url: `${COMMUNICATION_BASE_URL}/contact-communication`,
    method: "post",
    data,
  });
};
//联系记录显示列表
export const ListContactCommunication = (data: any) => {
  return request({
    url: `${COMMUNICATION_BASE_URL}/contact-communication-list`,
    method: "get",
    params: data,
  });
};

// 显示联系沟通带条件
export const GetContactCommunication = (id: string, targetType: number) => {
  return request({
    url: `${COMMUNICATION_BASE_URL}/${id}/contact-communications`,
    method: "get",
    params: {
      targetType,
    },
  });
};

//删除联系沟通
export const DeleteContactCommunication = (id: string) => {
  return request({
    url: `${COMMUNICATION_BASE_URL}/${id}/delcontact-communication`,
    method: "delete",
  });
};

// 获取联系沟通详情
export const GetContactCommunicationDetail = (id: string) => {
  return request({
    url: `${COMMUNICATION_BASE_URL}/${id}/contact-communication-by-id`,
    method: "get",
  });
};

// 修改联系沟通
export const UpdateContactCommunication = (id: string, data: any) => {
  return request({
    url: `${COMMUNICATION_BASE_URL}/${id}/updcontact-communication`,
    method: "put",
    data,
  });
};

// 获取沟通类型列表
export const GetCommunicationType = () => {
  return request({
    url: `${COMMUNICATION_BASE_URL}/communication-type-select-list`,
    method: "get",
  });
};

// 获取自定义回复列表
export const GetCustomReplyByType = (id: string | number) => {
  return request({
    url: `${COMMUNICATION_BASE_URL}/custom-reply-by-type/${id}`,
    method: "get",
  });
};
//导出成功后关闭弹窗
export const ExportAllCommunicationToAsync = () => {
  return request({
    url: `${COMMUNICATION_BASE_URL}/export-all-communication-to`,
    method: "get",
    responseType: "blob",
  });
};
