import type { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from "vue-router";
import NProgress from "@/utils/nprogress";
import { Auth } from "@/utils/auth";
import router from "@/router";
import { usePermissionStore, useUserStore } from "@/store";
import { ROLE_ROOT } from "@/constants";

// 路由生成锁，防止重复生成
let isGeneratingRoutes = false;

export function setupPermission() {
  // 白名单路由
  const whiteList = ["/login"];

  router.beforeEach(async (to, from, next) => {
    NProgress.start();

    const isLoggedIn = Auth.isLoggedIn();

    if (isLoggedIn) {
      // 如果已登录但访问登录页，重定向到首页
      if (to.path === "/login") {
        next({ path: "/" });
        return;
      }

      // 处理已登录用户的路由访问
      await handleAuthenticatedUser(to, from, next);
    } else {
      console.log("❌ User not logged in");

      // 未登录用户的处理
      if (whiteList.includes(to.path)) {
        next();
      } else {
        redirectToLogin(to, next);
        NProgress.done();
      }
    }
  });

  // 后置守卫，确保进度条关闭
  router.afterEach(() => {
    NProgress.done();
  });
}

/**
 * 处理已登录用户的路由访问
 */
async function handleAuthenticatedUser(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const permissionStore = usePermissionStore();
  const userStore = useUserStore();

  try {
    // 检查用户信息是否存在
    if (!userStore.userInfo.username) {
      await userStore.getUserInfo();
    }

    // 检查路由是否已生成
    if (!permissionStore.routesLoaded) {
      // 防止重复生成路由
      if (isGeneratingRoutes) {
        console.log("⏳ Routes already generating, waiting...");
        // 等待当前路由生成完成
        await waitForRoutesGeneration(permissionStore);
      } else {
        await generateAndAddRoutes(permissionStore);
      }

      // 路由生成完成后，重新导航到目标路由
      next({ ...to, replace: true });
      return;
    }

    // 路由已加载，检查路由是否存在
    if (to.matched.length === 0) {
      next("/404");
      return;
    }

    // 动态设置页面标题
    const title = (to.params.title as string) || (to.query.title as string);
    if (title) {
      to.meta.title = title;
    }

    next();
  } catch (error) {
    console.error("❌ Route guard error:", error);

    // 出错时重置状态并重定向到登录页
    await resetUserStateAndRedirect(to, next);
  }
}

/**
 * 生成并添加动态路由
 */
async function generateAndAddRoutes(permissionStore: any) {
  isGeneratingRoutes = true;

  try {
    const dynamicRoutes = await permissionStore.generateRoutes();

    // 添加路由到路由器
    dynamicRoutes.forEach((route: RouteRecordRaw) => {
      console.log("🛠️ 添加路由：", route.path, route);
      router.addRoute(route);
    });
  } finally {
    isGeneratingRoutes = false;
  }
}

/**
 * 等待路由生成完成
 */
async function waitForRoutesGeneration(permissionStore: any): Promise<void> {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (!isGeneratingRoutes && permissionStore.routesLoaded) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 50);

    // 超时保护，最多等待5秒
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 5000);
  });
}

/**
 * 重置用户状态并重定向到登录页
 */
async function resetUserStateAndRedirect(to: RouteLocationNormalized, next: NavigationGuardNext) {
  try {
    await useUserStore().resetAllState();
    redirectToLogin(to, next);
  } catch (resetError) {
    console.error("❌ Failed to reset user state:", resetError);
    // 强制跳转到登录页
    next("/login");
  } finally {
    NProgress.done();
  }
}

/**
 * 重定向到登录页
 */
function redirectToLogin(to: RouteLocationNormalized, next: NavigationGuardNext) {
  const params = new URLSearchParams(to.query as Record<string, string>);
  const queryString = params.toString();
  const redirect = queryString ? `${to.path}?${queryString}` : to.path;

  next(`/login?redirect=${encodeURIComponent(redirect)}`);
}

/** 判断是否有权限 */
export function hasAuth(value: string | string[], type: "button" | "role" = "button") {
  const { roles, perms } = useUserStore().userInfo;

  // 超级管理员 拥有所有权限
  if (type === "button" && roles.includes(ROLE_ROOT)) {
    return true;
  }

  const auths = type === "button" ? perms : roles;
  return typeof value === "string"
    ? auths.includes(value)
    : value.some((perm) => auths.includes(perm));
}
