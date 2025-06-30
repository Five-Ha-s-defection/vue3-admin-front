import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import router from "@/router";

import MenuAPI, { type RouteVO } from "@/api/system/menu.api";
const modules = import.meta.glob("../../views/**/**.vue");
const Layout = () => import("@/layouts/index.vue");

export const usePermissionStore = defineStore("permission", () => {
  // 存储所有路由，包括静态路由和动态路由
  const routes = ref<RouteRecordRaw[]>([]);
  // 混合模式左侧菜单路由
  const sideMenuRoutes = ref<RouteRecordRaw[]>([]);
  // 路由是否加载完成
  const routesLoaded = ref(false);

  /**
   * 根据后端返回菜单（menus）生成动态路由
   */
  function generateRoutesFromMenus(menus: any[]) {
    return new Promise<RouteRecordRaw[]>((resolve) => {
      // 数据格式适配：将后端菜单数据转换为RouteVO格式
      const adaptedMenus = adaptMenuData(menus);
      const dynamicRoutes = parseDynamicRoutes(adaptedMenus);

      //添加路由到路由器
      dynamicRoutes.forEach((route) => {
        router.addRoute(route);
      });

      routes.value = [...constantRoutes, ...dynamicRoutes]; // ✅ 正常访问
      routesLoaded.value = true;

      resolve(dynamicRoutes);
    });
  }

  /**
   * 适配后端菜单数据格式为前端RouteVO格式
   * @param menus 后端返回的菜单数据
   * @returns 适配后的RouteVO格式数据
   */
  function adaptMenuData(menus: any[]): RouteVO[] {
    return menus.map((menu) => {
      const adaptedMenu: RouteVO = {
        children: menu.children ? adaptMenuData(menu.children) : [],
        component: menu.component,
        path: menu.path,
        name: menu.path?.replace(/\//g, "_").substring(1) || menu.path,
        meta: {
          title: menu.menuName || menu.name,
          icon: menu.icon,
          hidden: menu.hidden || false,
        },
      };

      // 如果有重定向路径
      if (menu.redirect) {
        adaptedMenu.redirect = menu.redirect;
      }

      return adaptedMenu;
    });
  }

  /**
   * 获取后台动态路由数据，解析并注册到全局路由
   *
   * @returns Promise<RouteRecordRaw[]> 解析后的动态路由列表
   */
  function generateRoutes() {
    return new Promise<RouteRecordRaw[]>((resolve, reject) => {
      MenuAPI.getRoutes()
        .then((data) => {
          const dynamicRoutes = parseDynamicRoutes(data);

          routes.value = [...constantRoutes, ...dynamicRoutes];
          routesLoaded.value = true;

          resolve(dynamicRoutes);
        })
        .catch((error) => {
          console.error("❌ Failed to generate routes:", error);

          // 即使失败也要设置状态，避免无限重试
          routesLoaded.value = false;

          reject(error);
        });
    });
  }

  /**
   * 根据父菜单路径设置侧边菜单
   *
   * @param parentPath 父菜单的路径，用于查找对应的菜单项
   */
  const updateSideMenu = (parentPath: string) => {
    // 找到一级菜单
    const matchedItem = routes.value.find((item) => item.path === parentPath);

    // 若有子菜单，则设置为侧边栏菜单
    if (matchedItem && matchedItem.children) {
      sideMenuRoutes.value = matchedItem.children;
    }
  };

  /**
   * 重置路由
   *  用于退出登录或权限更新时清空动态路由
   */
  const resetRouter = () => {
    // 创建常量路由名称集合，用于O(1)时间复杂度的查找
    const constantRouteNames = new Set(constantRoutes.map((route) => route.name).filter(Boolean));

    // 从 router 实例中移除动态路由
    routes.value.forEach((route) => {
      if (route.name && !constantRouteNames.has(route.name)) {
        router.removeRoute(route.name);
      }
    });

    // 重置为仅包含常量路由
    routes.value = [...constantRoutes];
    sideMenuRoutes.value = [];
    routesLoaded.value = false;
  };

  return {
    routes,
    sideMenuRoutes,
    routesLoaded,
    generateRoutes,
    updateSideMenu,
    generateRoutesFromMenus,
    resetRouter,
  };
});

/**
 * 解析后端返回的路由数据并转换为 Vue Router 兼容的路由配置
 *
 * @param rawRoutes 后端返回的原始路由数据
 * @returns 解析后的路由集合
 */
const parseDynamicRoutes = (rawRoutes: RouteVO[]): RouteRecordRaw[] => {
  const parsedRoutes: RouteRecordRaw[] = [];

  rawRoutes.forEach((route) => {
    // 创建一个新的路由对象（浅拷贝）
    const normalizedRoute = { ...route } as RouteRecordRaw;

    // 初始化 meta 信息对象（用于标题、图标等）
    normalizedRoute.meta = normalizedRoute.meta || {};

    const raw: any = route; // 强转，便于访问后端自定义字段

    // 设置菜单标题（从 menuName 映射为 meta.title）
    if (raw.menuName) {
      normalizedRoute.meta.title = raw.menuName;
    }

    // 设置图标
    if (raw.icon) {
      normalizedRoute.meta.icon = raw.icon;
    }

    // 是否隐藏
    if (raw.hidden !== undefined) {
      normalizedRoute.meta.hidden = raw.hidden;
    }

    // 设置组件路径
    if (normalizedRoute.component?.toString() === "Layout") {
      normalizedRoute.component = Layout;
    } else if (normalizedRoute.component) {
      // 处理组件路径，移除开头的斜杠
      let componentPath = normalizedRoute.component.toString();
      if (componentPath.startsWith("/")) {
        componentPath = componentPath.substring(1);
      }

      // 尝试多种可能的组件路径
      const possiblePaths = [
        `../../views/${componentPath}.vue`,
        `../../views/${componentPath}/index.vue`,
        `../../views/${componentPath.replace("/index", "")}.vue`,
      ];

      let foundComponent = null;
      for (const path of possiblePaths) {
        if (modules[path]) {
          foundComponent = modules[path];
          console.log(`✅ 找到组件: ${path}`);
          break;
        }
      }

      if (!foundComponent) {
        console.warn(`⚠️ 未找到组件: ${componentPath}，尝试的路径:`, possiblePaths);
        console.log("📁 可用的组件模块:", Object.keys(modules));
        foundComponent = modules["../../views/error/404.vue"];
      }

      normalizedRoute.component = foundComponent;
    }

    // 递归解析子路由
    if (normalizedRoute.children) {
      normalizedRoute.children = parseDynamicRoutes(route.children);
    }

    // 添加到最终数组
    parsedRoutes.push(normalizedRoute);
  });

  return parsedRoutes;
};

/**
 * 导出此hook函数用于在非组件环境(如其他store、工具函数等)中获取权限store实例
 *
 * 在组件中可直接使用usePermissionStore()，但在组件外部需要传入store实例
 * 此函数简化了这个过程，避免每次都手动传入store参数
 */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
