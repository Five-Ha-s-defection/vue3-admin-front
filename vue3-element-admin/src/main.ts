import { createApp } from "vue";
import App from "./App.vue";
import setupPlugins from "@/plugins";
import router from "@/router"; // 引入布局组件
import { useUserStore, usePermissionStore } from "@/store";
// 暗黑主题样式
import "element-plus/theme-chalk/dark/css-vars.css";
import "vxe-table/lib/style.css";
// 暗黑模式自定义变量
import "@/styles/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";

// 过渡动画
import "animate.css";

// 自动为某些默认事件（如 touchstart、wheel 等）添加 { passive: true },提升滚动性能并消除控制台的非被动事件监听警告
import "default-passive-events";

async function bootstrap() {
  const app = createApp(App);

  // 🚨【1】恢复用户信息 & 注册动态路由（必须在 app.use(router) 之前）
  const userInfoStr = localStorage.getItem("userInfo");
  if (userInfoStr) {
    const userStore = useUserStore();
    const permissionStore = usePermissionStore();

    const userInfo = JSON.parse(userInfoStr);
    userStore.setUserInfo(userInfo);

    // ✅ 动态注册菜单路由（菜单来源于 userInfo.menus）
    await permissionStore.generateRoutesFromMenus(userInfo.menus);
  }

  // 🚨【2】动态路由准备好之后再 use router
  app.use(router);
  // 安装所有插件（pinia、i18n、element-plus 等）
  app.use(setupPlugins);
  // 🚨【3】挂载 Vue 应用
  app.mount("#app");
}

bootstrap();
