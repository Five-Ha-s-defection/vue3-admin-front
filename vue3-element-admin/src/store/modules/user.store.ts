import { store } from "@/store";

import AuthAPI, { type LoginFormData } from "@/api/auth.api";
import UserAPI, { type UserInfo } from "@/api/system/user.api";
import { Auth } from "@/utils/auth";
import { usePermissionStoreHook } from "@/store/modules/permission.store";
import { useDictStoreHook } from "@/store/modules/dict.store";
import { useTagsViewStore } from "@/store";
import { cleanupWebSocket } from "@/plugins/websocket";
import { ElMessage } from "element-plus";

export const useUserStore = defineStore("user", () => {
  const userInfo = useStorage<UserInfo>("userInfo", {} as UserInfo);
  // 记住我状态
  const rememberMe = ref(Auth.getRememberMe());

  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
  }

  /**
   * 登录
   *
   * @param {LoginFormData}
   * @returns
   */
  function login(LoginFormData: LoginFormData) {
    return new Promise<void>((resolve, reject) => {
      AuthAPI.login(LoginFormData)
        .then((data) => {
          if (!data.token) {
            ElMessage.error("登录失败");
            return reject(new Error("登录失败"));
          }
          const accessToken = data.token;
          const refreshToken = data.refreshToken || "";
          // 保存记住我状态和token
          rememberMe.value = LoginFormData.rememberMe;
          Auth.setTokens(accessToken, refreshToken, rememberMe.value);
          // 登录成功后立即获取用户信息
          //保存用户信息包含menus

          // 登录成功手动弹窗
          ElMessage.success("登录成功");
          getUserInfo().then((user) => {
            // 菜单
            function normalizeMenuChildren(menus: any[]): any[] {
              return menus.map((menu) => ({
                ...menu,
                children: menu.children ? normalizeMenuChildren(menu.children) : [],
              }));
            }
            // 菜单数据
            const menus = user.menus || [];
            const normalizedMenus = normalizeMenuChildren(menus);
            usePermissionStoreHook().generateRoutesFromMenus(normalizedMenus); // ✅ 动态注册菜单路由
            resolve();
          });
        })
        .catch((error) => {
          ElMessage.error(error.message || "登录失败");
          reject(error);
        });
    });
  }

  /**
   * 获取用户信息
   *
   * @returns {UserInfo} 用户信息
   */
  function getUserInfo() {
    return new Promise<UserInfo>((resolve, reject) => {
      UserAPI.getInfo()
        .then((data) => {
          if (!data) {
            reject("Verification failed, please Login again.");
            return;
          }
          //统一字段映射，确保nickname和avatar等存在
          const transformdUser: UserInfo = {
            id: data.id || "",
            username: data.username,
            realName: data.realName || "",
            avatar: data.avatar || "",
            roles: data.roles || [],
            permissions: data.permissions || [],
            menus: data.menus || [], //加上这一句，把后端 menus 映射进来
          };
          userInfo.value = transformdUser;
          resolve(transformdUser);
        })
        .catch(reject);
    });
  }

  /**
   * 登出
   */
  function logout() {
    return new Promise<void>((resolve, reject) => {
      AuthAPI.logout()
        .then(() => {
          // 重置所有系统状态
          resetAllState();
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 重置所有系统状态
   * 统一处理所有清理工作，包括用户凭证、路由、缓存等
   */
  function resetAllState() {
    // 1. 重置用户状态
    resetUserState();

    // 2. 重置其他模块状态
    // 重置路由
    usePermissionStoreHook().resetRouter();
    // 清除字典缓存
    useDictStoreHook().clearDictCache();
    // 清除标签视图
    useTagsViewStore().delAllViews();

    // 3. 清理 WebSocket 连接
    cleanupWebSocket();
    console.log("[UserStore] WebSocket connections cleaned up");

    return Promise.resolve();
  }

  /**
   * 重置用户状态
   * 仅处理用户模块内的状态
   */
  function resetUserState() {
    // 清除用户凭证
    Auth.clearAuth();
    // 重置用户信息
    userInfo.value = {} as UserInfo;
  }

  /**
   * 刷新 token
   */
  function refreshToken() {
    const refreshToken = Auth.getRefreshToken();

    if (!refreshToken) {
      return Promise.reject(new Error("没有有效的刷新令牌"));
    }

    return new Promise<void>((resolve, reject) => {
      AuthAPI.refreshToken(refreshToken)
        .then((data) => {
          const { token, refreshToken: newRefreshToken } = data;
          // 更新令牌，保持当前记住我状态
          Auth.setTokens(token, newRefreshToken, Auth.getRememberMe());
          resolve();
        })
        .catch((error) => {
          console.log(" refreshToken  刷新失败", error);
          reject(error);
        });
    });
  }

  return {
    userInfo,
    rememberMe,
    getUserInfo,
    login,
    logout,
    resetAllState,
    resetUserState,
    refreshToken,
    setUserInfo,
  };
});

/**
 * 在组件外部使用UserStore的钩子函数
 * @see https://pinia.vuejs.org/core-concepts/outside-component-usage.html
 */
export function useUserStoreHook() {
  return useUserStore(store);
}
