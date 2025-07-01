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
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import RoleAPI, { RoleInfo } from "@/api/system/role.api"; // 你的封装 API 路径
import AssignMenu from "@/components/Menus/AssignMenu.vue";

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
