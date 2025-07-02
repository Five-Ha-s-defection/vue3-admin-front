import request from "@/utils/request";

const CRM_CONTRACT_BASE_URL = "/api/app/crm-contract";

const CrmContractAPI = {
  //查询合同列表
  getInfo(data: any) {
    console.log(data);
    return request({
      url: `${CRM_CONTRACT_BASE_URL}/show-crm-contract-list`,
      method: "get",
      params: data,
    });
  },

  //删除单个合同
  deleteContract(data: any) {
    return request({
      url: `${CRM_CONTRACT_BASE_URL}/crm-contract/${data.DeleteId}`,
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
  updateContract(data: any) {
    return request({
      url: `${CRM_CONTRACT_BASE_URL}/${data.id}/crm-contract`,
      method: "put",
    });
  },
};

export default CrmContractAPI;
