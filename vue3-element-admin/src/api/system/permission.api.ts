import request from "@/utils/request";

const base = "/api/app/permission-services";

export const PermissionAPI = {
  /**
   * 获取全部权限
   * @returns 全部权限
   */
  getAllPermissions() {
    return request.get(`${base}/permission-list`);
  },

  /**
   * 获取角色已选权限
   * @param roleId 角色id
   * @returns 角色已选权限
   */
  getPermissionIds(roleId: string) {
    return request.get(`/api/app/role-permission-services/assigned-permission-ids/${roleId}`);
  },

  /**
   * 保存角色权限
   * @param data 角色id和权限id
   * @returns 保存角色权限
   */
  savePermissions(data: { roleId: string; permissionIds: string[] }) {
    return request.post("/api/app/role-permission-services/assign-permissions", data);
  },
};
