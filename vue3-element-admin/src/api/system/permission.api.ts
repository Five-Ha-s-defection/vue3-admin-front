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

  /**
   * 保存权限
   * @param data 权限信息
   * @returns 保存权限
   */
  addPermission(data: PermissionInfo) {
    return request.post(`${base}/permission`, data);
  },

  /**
   * 删除权限
   * @param id 权限id
   * @returns 删除权限
   */
  deletePermission(id: string) {
    return request.delete(`${base}/${id}/permission`);
  },
  /**
   * 修改权限
   * @param data 权限信息
   * @returns 修改权限
   */
  updatePermission(data: PermissionInfo) {
    return request.put(`${base}/${data.id}/permission`, data);
  },
};

interface PermissionInfo {
  id?: string;
  permissionName: string;
  permissionCode: string;
  groupName: string; // 分组名，如：客户管理、系统管理等
  description?: string;
}

export default PermissionAPI;
export { PermissionInfo };
