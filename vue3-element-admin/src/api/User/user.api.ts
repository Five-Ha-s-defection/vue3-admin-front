import request from "@/utils/request";

const UserAPI = {
  GetUserPage() {
    return request({
      url: "/api/app/user-server/user-info-list",
      method: "get",
    });
  },
};

export default UserAPI;
