<template>
  <el-card>
    <!-- 顶部操作按钮 -->
    <div class="mb-4 flex justify-end">
      <el-button type="primary" @click="openDialog()">新增角色</el-button>
    </div>

    <!-- 角色列表表格 -->
    <el-table :data="roleList" border style="width: 100%">
      <el-table-column prop="roleName" label="角色名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="isStatic" label="系统角色">
        <template #default="{ row }">
          <el-tag :type="row.isStatic ? 'danger' : 'success'">
            {{ row.isStatic ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button
            size="small"
            type="danger"
            :disabled="row.isStatic"
            @click="handleDelete(row.id)"
          >
            删除
          </el-button>
          <el-button size="small" type="primary" @click="() => openAssignMenu(row.id)">
            分配菜单
          </el-button>
          <el-button type="primary" size="small" @click="openPermissionDrawer(row)">
            分配权限
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="系统角色">
          <el-switch v-model="form.isStatic" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
    <!--角色菜单树-->
    <AssignMenu ref="assignMenuRef" :role-id="currentRoleId" :on-success="loadRoleList" />
    <el-drawer v-model="drawerVisible" title="权限分配" size="500px" direction="rtl">
      <p>
        <strong>角色：</strong>
        {{ currentRole?.roleName }}
      </p>

      <el-tree
        :data="permissionTree"
        show-checkbox
        node-key="id"
        default-expand-all
        :props="{ label: 'label', children: 'children' }"
        :checked-keys="checkedKeys"
        @check="onTreeCheck"
      />

      <el-button type="primary" class="mt-4" @click="saveRolePermissions">保存权限</el-button>
    </el-drawer>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import RoleAPI, { RoleInfo } from "@/api/system/role.api"; // 你的封装 API 路径
import AssignMenu from "@/components/Menus/AssignMenu.vue";

import { PermissionAPI } from "@/api/system/permission.api"; //// 引入封装好的 API 模块

const assignMenuRef = ref<InstanceType<typeof AssignMenu>>();

// 角色数据列表
const roleList = ref<RoleInfo[]>([]);
const currentRoleId = ref("");

// 弹窗控制 & 表单
const dialogVisible = ref(false);
const isEdit = ref(false); //修改
const formRef = ref<FormInstance>(); //表单
const form = reactive<RoleInfo>({
  //表单数据
  id: "",
  roleName: "",
  description: "",
  isStatic: false,
});
//#region 权限管理
const drawerVisible = ref(false); // 控制抽屉显示
const currentRole = ref<any>(null); // 当前正在分配权限的角色

const permissionTree: any = ref<any[]>([]); // 权限树（带分组）
const checkedKeys: any = ref<string[]>([]); // 已选中的权限 ID 列表

//#endregion

// 表单校验规则
const rules = {
  roleName: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  description: [{ max: 200, message: "描述不能超过200个字符", trigger: "blur" }],
};

// 打开弹窗（新增 or 编辑）
const openDialog = (row?: RoleInfo) => {
  if (row) {
    isEdit.value = true;
    Object.assign(form, row);
  } else {
    isEdit.value = false;
    Object.assign(form, { id: "", roleName: "", description: "", isStatic: false });
  }
  dialogVisible.value = true;
};

// 提交表单
const submitForm = () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) return;
    if (isEdit.value && form.id) {
      await RoleAPI.updateRole(form.id, form);
      ElMessage.success("角色修改成功");
    } else {
      await RoleAPI.addRole(form);
      ElMessage.success("角色添加成功");
    }
    dialogVisible.value = false;
    await loadRoleList();
  });
};

// 删除角色（确认后调用 API）
const handleDelete = async (id?: string) => {
  if (!id) return;
  ElMessageBox.confirm("确定要删除该角色吗？", "提示", {
    type: "warning",
  })
    .then(async () => {
      await RoleAPI.deleteRole(id);
      ElMessage.success("角色删除成功");
      await loadRoleList();
    })
    .catch(() => {});
};

// 加载角色列表数据
const loadRoleList = async () => {
  roleList.value = await RoleAPI.getAllRoles();
};

// 分配菜单按钮点击事件
const openAssignMenu = (roleId: string) => {
  console.log("RoleId", roleId);
  currentRoleId.value = roleId;
  console.log("currentRoleId", currentRoleId.value);
  assignMenuRef.value?.open(roleId); // ✅ open() 被调用前，roleId 已更新
};

/**
 * 打开抽屉，初始化权限树和已经勾选的权限
 */
function openPermissionDrawer(role: any) {
  currentRole.value = role; // 保存当前角色数据
  drawerVisible.value = true; // 显示抽屉

  //获取所有权限(分组)用于构建el-tree 树形结构
  PermissionAPI.getAllPermissions().then((res) => {
    permissionTree.value = buildPermissionTree(res);
  });
  // 获取该角色已拥有的权限id
  PermissionAPI.getPermissionIds(role.id).then((res) => {
    checkedKeys.value = res; //默认选中的权限id
  });
}
/**
 * el-tree 的勾选事件
 * @param _ 当前节点（无用）
 * @param treeData el-tree 的完整选中结构
 */
function onTreeCheck(_: any, treeData: any) {
  checkedKeys.value = treeData.checked;
}

/**
 * 点击保存权限按钮
 */
function saveRolePermissions() {
  // el-tree 的 checkedKeys 中可能包含 group 节点（如 "group_客户管理"）
  // 我们只需要真正的权限 ID，过滤掉这些虚拟分组节点
  const realIds = checkedKeys.value.filter((id: any) => !String(id).startsWith("group_"));

  // 调用保存接口
  PermissionAPI.savePermissions({
    roleId: currentRole.value.id, // 当前角色 ID
    permissionIds: realIds, // 勾选的权限 ID 列表
  }).then(() => {
    ElMessage.success("保存成功"); // 成功提示
    drawerVisible.value = false; // 关闭抽屉
  });
}

/**
 * 将后端返回的权限列表转成 el-tree 支持的分组结构
 * @param list 原始权限数组（每个 item 含有 groupName）
 * @returns el-tree 支持的树结构 [{ id, label, children: [...] }]
 */
function buildPermissionTree(list: any[]): any[] {
  const map: Record<string, any> = {}; // 用于按 groupName 分组缓存节点

  list.forEach((item) => {
    const group = item.groupName || "未分组"; // 获取分组名，默认为“未分组”

    // 如果该分组节点还未创建，先初始化
    if (!map[group]) {
      map[group] = {
        id: `group_${group}`, // 注意加前缀，防止和真实权限ID冲突
        label: group, // 分组显示名
        children: [], // 初始化子节点数组
      };
    }

    // 向该分组中添加子权限节点
    map[group].children.push({
      id: item.id, // 真实权限 ID
      label: item.permissionName, // 权限名称，用于显示
      code: item.permissionCode, // 可选，用于 tooltip 或业务用途
    });
  });

  // 将 map 转换为数组并返回
  return Object.values(map);
}

// 页面加载时获取数据
onMounted(() => {
  loadRoleList();
});
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
</style>
