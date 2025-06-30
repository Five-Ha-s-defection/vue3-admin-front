import request from "@/utils/request";

const CRM_CONTRACT_BASE_URL = "/api/app/crm-contract";

//查询合同列表
const CrmContractAPI = {
  getInfo(data: any) {
    return request({
      url: `${CRM_CONTRACT_BASE_URL}/show-crm-contract-list`,
      method: "get",
      params: data,
    });
  },
};

export default CrmContractAPI;
