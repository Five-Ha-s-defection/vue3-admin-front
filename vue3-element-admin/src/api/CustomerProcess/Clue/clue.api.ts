import request from "@/utils/request";

const CLUE_BASE_URL = "/api/app/clue";

export const ShowClueList = (data: any) => {
  return request({
    url: `${CLUE_BASE_URL}/show-clue`,
    method: "get",
    params: data,
  });
};

export const GetUser = () => {
  return request({
    url: `${CLUE_BASE_URL}/user-select-list`,
    method: "get",
  });
};

export const GetClueSource = () => {
  return request({
    url: `${CLUE_BASE_URL}/source-select-list`,
    method: "get",
  });
};

export const GetIndustry = () => {
  return request({
    url: `${CLUE_BASE_URL}/industry-select-list`,
    method: "get",
  });
};

export const AddClue= (data: any) => {
  return request({
    url: `${CLUE_BASE_URL}/clue`,
    method: "post",
    data,
  });
}


/** 分页查询参数 */
export interface CluePageQuery {
  PageIndex: number;
  PageSize: number;
  [key: string]: any; // 其他查询条件
}

/** 分页返回结构 */
export interface CluePageResult {
  totalCount: number;
  pageCount: number;
  data: [];
}

