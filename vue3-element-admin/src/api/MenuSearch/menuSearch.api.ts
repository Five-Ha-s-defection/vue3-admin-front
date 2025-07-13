import request from "@/utils/request";

export interface MenuSearchDto {
  keyword: string;
  pageIndex: number;
  pageSize: number;
}

export const searchMenus = (params: MenuSearchDto) => {
  return request.post("/api/app/menu-search/search-menus", params);
};