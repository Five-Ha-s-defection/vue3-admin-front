import request from "@/utils/request";
const base = "/api/app/user-server";
const UserAPI = {
  GetUserPage() {
    return request({
      url: "/api/app/user-server/user-info-list",
      method: "get",
    });
  },

  /**
   * 新增用户
   */
  addUser: (data: UserInfo) => {
    return request.post(`${base}/user-info`, data);
  },

  /**
   * 修改用户
   */
  updateUser: (id: string, data: UserInfo) => {
    return request.put(`${base}/${id}/user-info`, data);
  },

  /**
   * 删除用户
   */
  deleteUser: (id: string) => {
    return request.delete(`${base}/${id}/user-info`);
  },
};

export default UserAPI;

// 用户实体（可根据你后端实际结构调整）
export interface UserInfo {
  id?: string; // 修改时需要
  userName: string;
  realName: string;
  password: string;
  avatar?: string;
  //手机号
  phoneInfo: string;
  email: string;
  isActive: boolean;
}
