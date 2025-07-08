<template>
  <!-- 菜单图标 -->
  <template v-if="icon">
    <!-- 图标 -->
    <component :is="resolvedIcon" v-if="resolvedIcon" class="menu-icon" />
    <div v-else class="i-svg:menu menu-icon" />
  </template>
  <template v-else>
    <div class="i-svg:menu menu-icon" />
  </template>
  <!-- 菜单标题 -->
  <span v-if="title" class="menu-title ml-1">{{ translateRouteTitle(title) }}</span>
</template>

<script setup lang="ts">
import * as Icons from "@element-plus/icons-vue";
import { translateRouteTitle } from "@/utils/i18n";

const props = defineProps<{
  icon?: string;
  title?: string;
}>();

// 将字符串 icon 转换为 ElementPlus 图标组件
const resolvedIcon = computed(() => {
  if (!props.icon) return null;
  const componentName = props.icon.charAt(0).toUpperCase() + props.icon.slice(1);
  return (Icons as Record<string, any>)[componentName] || null;
});
</script>

<style lang="scss" scoped>
.menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 5px;
  font-size: 18px;
  color: currentcolor;
}
</style>
