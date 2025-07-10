import request from "@/utils/request";

const CRM_CONTRACT_BASE_URL = "/api/app/crm-contract";

const CrmContractAPI = {
  //查询合同列表
  getInfo(data: any) {
    return request({
      url: `${CRM_CONTRACT_BASE_URL}/show-crm-contract-list`,
      method: "get",
      params: data,
    });
  },

  //添加合同
  addContract(data: any) {
    console.log(data);
    return request({
      url: `${CRM_CONTRACT_BASE_URL}/crm-contract`,
      method: "post",
      data,
    });
  },

  //删除单个合同
  deleteContract(DeleteId: any) {
    return request({
      url: `${CRM_CONTRACT_BASE_URL}/crm-contract/${DeleteId}`,
      method: "delete",
    });
  },

  //删除多个合同
  deleteManyContracts(data: any) {
    return request({
      url: `${CRM_CONTRACT_BASE_URL}/many-crm-contract`,
      method: "delete",
      params: { DeleteIds: data.DeleteIds },
    });
  },

  //查询合同详情
  getContractDetail(data: any) {
    return request({
      url: `${CRM_CONTRACT_BASE_URL}/crm-contract/${data.GetId}`,
      method: "get",
    });
  },

  //修改合同
  updateContract(id:string,data: any) {
    return request({
      url: `${CRM_CONTRACT_BASE_URL}/${id}/crm-contract`,
      method: "put",
      data
    });
  },
    GetCrmContractProduct(CrmContractId: string) {
    return request({
      url: `${CRM_CONTRACT_BASE_URL}/logs/${CrmContractId}`,
      method: "get",
    });
  },
  CrmContractInstance(id: string, approverId: string | undefined,data: { isPass: boolean, comment: string }) {
    return request({
      url: `${CRM_CONTRACT_BASE_URL}/${id}/approve/${approverId}`,
      method: "post",
      params: data,
    });
  },
};

export default CrmContractAPI;
