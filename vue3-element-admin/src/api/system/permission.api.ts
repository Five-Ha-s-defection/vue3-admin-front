import request from "@/utils/request";

const base = "/api/app/permission-services";

export const PermissionAPI = {
  // 获取全部权限
  getAllPermissions() {
    return request.get(`${base}/permission-list`);
  },

  // 获取角色已选权限
  getPermissionIds(roleId: string) {
    return request.get(`/api/app/role-permission-services/assigned-permission-ids/${roleId}`);
  },
  // 保存角色权限
  savePermissions(data: { roleId: string; permissionIds: string[] }) {
    return request.post("/api/app/role-permission-services/assign-permissions", data);
  },
};
