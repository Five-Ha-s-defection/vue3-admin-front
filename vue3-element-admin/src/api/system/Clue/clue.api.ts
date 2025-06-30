import request from "@/utils/request";

const CLUE_BASE_URL = "/api/app";

export const  GetClueList=(data:any)=>{
  return request({
    url: `${CLUE_BASE_URL}/clue/show-clue`,
    method: "get",
    params:data,
  });
}

