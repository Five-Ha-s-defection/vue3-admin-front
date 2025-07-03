<template>
  <el-card>
    <!-- 顶部操作 -->
    <div class="mb-4 flex justify-between items-center">
      <h2>权限管理</h2>
      <el-button type="primary" @click="openAddDialog">新增权限</el-button>
      <el-button @click="expandPermissionAll">展开权限</el-button>
      <el-button @click="collapsePermissionAll">收起权限</el-button>
    </div>

    <!-- 折叠面板分组展示权限 -->
    <el-collapse v-model="activeGroupNames" accordion>
      <el-collapse-item
        v-for="group in groupedPermissions"
        :key="group.groupName"
        :name="group.groupName"
      >
        <template #title>
          {{ group.groupName }}
          <el-tag type="info" size="small" class="ml-2">
            {{ group.permissions.length }} 个权限
          </el-tag>
        </template>

        <el-table
          :ref="(el) => setPermissionTableRef(group.groupName, el)"
          :data="group.permissions"
          row-key="id"
          border
          size="small"
          style="width: 100%"
        >
          <el-table-column
            prop="permissionName"
            align="center"
            header-align="center"
            label="权限名称"
          />
          <el-table-column
            prop="permissionCode"
            align="center"
            header-align="center"
            label="权限编码"
          />
          <el-table-column label="操作" width="150" align="center" header-align="center">
            <template #default="{ row }">
              <el-button size="small" type="text" @click="openEditDialog(row)">编辑</el-button>
              <el-button size="small" type="text" style="color: red" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>

    <!-- 弹窗表单 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑权限' : '新增权限'"
      width="480px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="权限名称" prop="permissionName">
          <el-input v-model="form.permissionName" />
        </el-form-item>
        <el-form-item label="权限编码" prop="permissionCode">
          <el-input v-model="form.permissionCode" />
        </el-form-item>
        <el-form-item label="分组名称" prop="groupName">
          <el-input v-model="form.groupName" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import PermissionAPI, { PermissionInfo } from "@/api/system/permission.api";
import type { ElTable } from "element-plus";

// 权限原始数据
const permissions: any = ref<PermissionInfo[]>([]);
// 所有分组的表格引用
const permissionTableRefs = new Map<string, InstanceType<typeof ElTable>>();

// 分组结构：每个分组包含 groupName 和 permissions[]
const groupedPermissions = ref<{ groupName: string; permissions: PermissionInfo[] }[]>([]);

// 当前展开的分组名（用于折叠）
const activeGroupNames = ref<string[]>([]);

// 弹窗控制
const dialogVisible = ref(false);
const isEditMode = ref(false);

// 权限表单
const form = reactive<PermissionInfo>({
  id: undefined,
  permissionName: "",
  permissionCode: "",
  groupName: "",
  description: "",
});
const formRef = ref<FormInstance>();

// 表单校验规则
const rules: FormRules = {
  permissionName: [{ required: true, message: "请输入权限名称", trigger: "blur" }],
  permissionCode: [{ required: true, message: "请输入权限编码", trigger: "blur" }],
  groupName: [{ required: true, message: "请输入分组名称", trigger: "blur" }],
};
// 设置每个表格的 ref
const setPermissionTableRef = (groupName: string, el: Element | ComponentPublicInstance | null) => {
  if (
    el &&
    typeof el === "object" &&
    "$el" in el &&
    typeof (el as any).toggleRowExpansion === "function"
  ) {
    permissionTableRefs.set(groupName, el as InstanceType<typeof ElTable>);
  }
};
// 展开所有
const expandPermissionAll = () => {
  groupedPermissions.value.forEach((group) => {
    const table = permissionTableRefs.get(group.groupName);
    if (!table) {
      console.warn("未找到表格 ref", group.groupName);
      return;
    }

    group.permissions.forEach((item: any) => {
      if (item.children && item.children.length > 0) {
        console.log(`👉 尝试展开：${item.permissionName}`);
        table.toggleRowExpansion(item, true);
      } else {
        console.warn(`⚠️ 无 children：${item.permissionName}`);
      }
    });
  });
};
// 折叠所有
const collapsePermissionAll = () => {
  groupedPermissions.value.forEach((group) => {
    group.permissions.forEach((item) => {
      permissionTableRefs.get(group.groupName)?.toggleRowExpansion(item, false);
    });
  });
};
// 获取权限并按分组整理
async function fetchPermissions() {
  // ✅ 1. 备份当前展开状态
  const lastExpandedGroups = [...activeGroupNames.value];

  const res = await PermissionAPI.getAllPermissions();
  permissions.value = res || [];

  const map = new Map<string, PermissionInfo[]>();
  permissions.value.forEach((item: any) => {
    const key = item.groupName || "未分组";
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(item);
  });

  groupedPermissions.value = Array.from(map.entries()).map(([groupName, perms]) => ({
    groupName,
    permissions: perms,
  }));

  // ✅ 2. 恢复展开状态，仅保留还存在的组
  const currentGroupNames = groupedPermissions.value.map((g) => g.groupName);
  activeGroupNames.value = lastExpandedGroups.filter((group) => currentGroupNames.includes(group));
}

// 打开新增权限弹窗
function openAddDialog() {
  isEditMode.value = false;
  resetForm();
  dialogVisible.value = true;
}

// 打开编辑弹窗
function openEditDialog(row: PermissionInfo) {
  isEditMode.value = true;
  Object.assign(form, row);
  dialogVisible.value = true;
}

// 重置表单
function resetForm() {
  form.id = undefined;
  form.permissionName = "";
  form.permissionCode = "";
  form.groupName = "";
  form.description = "";
  formRef.value?.clearValidate();
}

// 提交表单（新增/编辑）
function submitForm() {
  formRef.value?.validate(async (valid) => {
    if (!valid) return;
    try {
      if (isEditMode.value && form.id) {
        await PermissionAPI.updatePermission(form);
        ElMessage.success("权限更新成功");
      } else {
        await PermissionAPI.addPermission(form);
        ElMessage.success("权限添加成功");
      }
      dialogVisible.value = false;
      fetchPermissions();
    } catch {
      ElMessage.error("操作失败");
    }
  });
}

// 删除权限
async function handleDelete(row: PermissionInfo) {
  try {
    await ElMessageBox.confirm(`确认删除权限【${row.permissionName}】？`, "提示", {
      type: "warning",
    });
    await PermissionAPI.deletePermission(row.id!);
    ElMessage.success("删除成功");
    fetchPermissions();
  } catch {
    // 用户取消或失败忽略
    ElMessage.error("删除失败");
  }
}

// 初始化
onMounted(() => {
  fetchPermissions();
});
</script>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
.ml-2 {
  margin-left: 8px;
}
</style>
