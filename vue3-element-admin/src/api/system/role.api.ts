import request from "@/utils/request";

const base = "/api/app/role-server";

const RoleAPI = {
  getAllRoles(): Promise<RoleInfo[]> {
    return request.get(`${base}/role-info-list`);
  },
  /**
   * 添加新角色
   * @param data RoleInfo 类型数据
   */
  addRole: (data: RoleInfo) => {
    return request.post(`${base}/role-info`, data);
  },
  /**
   * 修改角色信息
   * @param id 角色ID
   * @param data RoleInfo 类型数据
   */
  updateRole: (id: string, data: RoleInfo) => {
    return request.put(`${base}/role-info/${id}`, data);
  },
  /**
   * 删除角色
   * @param id 角色 ID
   */
  deleteRole: (id: string) => {
    return request.delete(`${base}/${id}/role-info`);
  },
  
};

export default RoleAPI;
/**
 * 角色信息接口
 */
export interface RoleInfo {
  id?: string; // 修改时使用
  roleName: string; // 角色名称
  description?: string; // 描述
  isStatic?: boolean; // 是否为内置角色
}
