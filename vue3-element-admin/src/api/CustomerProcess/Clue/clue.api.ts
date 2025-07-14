import request from "@/utils/request";

const CLUE_BASE_URL = "/api/app/clue";

// 添加线索
export const AddClue= (data: any) => {
  return request({
    url: `${CLUE_BASE_URL}/clue`,
    method: "post",
    data,
  });
}

// 显示线索
export const ShowClueList = (data: any) => {
  return request({
    url: `${CLUE_BASE_URL}/show-clue`,
    method: "get",
    params: data,
  });
};

// 获取线索详情
export const GetClueDetail = (id: string) => {
  return request({
    url: `${CLUE_BASE_URL}/${id}/clue-by-id`,
    method: "get",
  });
};

// 删除线索
export const DeleteClue = (id: string) => {
  return request({
    url: `${CLUE_BASE_URL}/${id}/del-clue`,
    method: "delete",
  });
};

// 修改线索
export const UpdateClue = (id: string, data: any) => {
  return request({
    url: `${CLUE_BASE_URL}/${id}/upd-clue`,
    method: "put",
    data,
  });
};

//获取用户下拉框
export const GetUser = () => {
  return request({
    url: `${CLUE_BASE_URL}/user-select-list`,
    method: "get",
  });
};

// 获取线索负责人下拉框
export const GetClueSource = () => {
  return request({
    url: `${CLUE_BASE_URL}/source-select-list`,
    method: "get",
  });
};

// 获取行业下拉框
export const GetIndustry = () => {
  return request({
    url: `${CLUE_BASE_URL}/industry-select-list`,
    method: "get",
  });
};

//分配、领取、放弃
export const ClueAction = (data: {
  clueId: string;
  actionType: 'assign' | 'receive' | 'abandon';
  targetUserId?: string;
  abandonReason?: string;  // 新增的放弃原因字段
}) => {
  return request({
    url: `${CLUE_BASE_URL}/handle-clue-action`,
    method: 'put',
    data,
  });
};

//显示用户列表
export const ShowUserList=(data:any)=>{
   return request({
    url: `${CLUE_BASE_URL}/show-user-list`,
    method: "get",
    params:data
  });
}


// 导出线索
export const ExportClue = (cluePoolStatus:number) => {
  return request({
    url: `${CLUE_BASE_URL}/export-all-clue`,
    method: "get",
    params: {
      cluePoolStatus, // 将筛选条件传递给后端
    },
    responseType: "blob", // 关键
  });
}
