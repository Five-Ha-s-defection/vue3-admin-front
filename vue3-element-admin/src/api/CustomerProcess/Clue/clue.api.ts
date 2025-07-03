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
