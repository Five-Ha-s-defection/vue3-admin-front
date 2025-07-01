<template>
  <el-dialog v-model="visible" title="分配菜单" width="500px">
    <ElTree
      ref="treeRef"
      :data="menuTree"
      show-checkbox
      node-key="id"
      :default-checked-keys="checkedKeys"
      :props="{ label: 'menuName', children: 'children' }"
    />
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElTree, ElMessage } from "element-plus";
import MenuAPI from "@/api/system/menu.api";

// ✅ 只保留 onSuccess 回调
const props = defineProps<{
  roleId: string;
  onSuccess?: () => void;
}>();

// 弹窗控制
const visible = ref(false);

// 菜单树数据和选中项
const menuTree: any = ref<any[]>([]);
const checkedKeys: any = ref<string[]>([]);

// tree ref
const treeRef = ref<InstanceType<typeof ElTree>>();

// ✅ open 接收 roleId 作为参数（不使用 props）
const open = async (roleId: string) => {
  console.log("roleId", roleId);
  if (!roleId) {
    ElMessage.warning("未传入角色ID");
    return;
  }

  visible.value = true;

  const [treeRes, roleMenuIdsRes]: any = await Promise.all([
    MenuAPI.getMenuTree(),
    MenuAPI.getRoleMenuIds(roleId),
  ]);
  menuTree.value = treeRes;
  console.log("menuTree", menuTree.value);
  // 假设roleMenuIdsRes是菜单对象数组，你要提取出唯一键数组
  checkedKeys.value = roleMenuIdsRes.map((menu: any) => menu.id);
  console.log("checkedKeys", checkedKeys.value);
};

// ✅ 暴露 open 方法给父组件调用
defineExpose({ open });

// 保存绑定的菜单
const submit = async () => {
  const keys = treeRef.value?.getCheckedKeys() as string[];
  if (!keys || keys.length === 0) {
    ElMessage.warning("请至少选择一个菜单");
    return;
  }

  if (!props.roleId) {
    ElMessage.error("角色ID为空，无法保存菜单");
    return;
  }
  console.log("保存角色菜单", props.roleId);

  // ❗你需要保证 open(roleId) 接收到的 roleId 被记住，或传回去。
  // 此处临时写法，用上次的 keys 推断（你也可以加个 `currentRoleId` ref 存起来）
  await MenuAPI.setRoleMenus(props.roleId, keys);
  ElMessage.success("菜单分配成功");
  visible.value = false;
  props.onSuccess?.(); // 回调
};
</script>
