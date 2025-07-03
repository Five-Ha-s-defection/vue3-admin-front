<template>
  <el-card>
    <!-- 操作区域 -->
    <div class="mb-2 flex justify-end">
      <el-button type="primary" @click="openAddDialog">新增用户</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="userList" style="width: 100%" border>
      <el-table-column prop="userName" align="center" header-align="center" label="用户名" />
      <el-table-column prop="realName" align="center" header-align="center" label="真实姓名" />
      <el-table-column prop="phoneInfo" align="center" header-align="center" label="手机号" />
      <el-table-column prop="email" align="center" header-align="center" label="邮箱" />

      <el-table-column label="操作" fixed="right" width="250" align="center" header-align="center">
        <template #default="{ row }">
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteUser(row.id)">删除</el-button>
          <!-- 分配角色按钮 -->
          <el-button type="primary" size="small" @click="openRoleDialog(row)">分配角色</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增用户弹窗 -->
    <el-dialog v-model="addDialogVisible" title="新增/编辑用户" width="500px">
      <el-form ref="addFormRef" :model="addForm" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="addForm.userName" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="addForm.realName" />
        </el-form-item>
        <el-form-item v-if="showPassword" label="密码" prop="password">
          <el-input v-model="addForm.password" show-password />
        </el-form-item>

        <!--头像-->
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="true"
            :file-list="avatarFileList"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
            list-type="picture-card"
            name="file"
            :limit="1"
          >
            <!-- ✅ 用 template 包裹 default 插槽，只有没图片时才渲染上传入口 -->
            <template #default>
              <el-icon v-if="avatarFileList.length < 1"><Plus /></el-icon>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="手机号" prop="phoneInfo">
          <el-input v-model="addForm.phoneInfo" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" />
        </el-form-item>
        <el-form-item label="是否启用" prop="isActive">
          <el-switch v-model="addForm.isActive" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUser">提交</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色弹窗 -->
    <el-dialog v-model="roleDialogVisible" title="分配角色" width="400px">
      <!-- 角色复选框组，绑定 selectedRoleIds 实现多选 -->
      <el-checkbox-group v-model="selectedRoleIds">
        <!-- 遍历所有角色，每一项为一个复选框 -->
        <el-checkbox v-for="role in allRoles" :key="role.id" :label="role.id">
          {{ role.roleName }}
          <!-- 显示角色名称 -->
        </el-checkbox>
      </el-checkbox-group>

      <!-- 弹窗底部按钮区域 -->
      <template #footer>
        <!-- 取消按钮，关闭弹窗 -->
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <!-- 保存按钮，触发保存逻辑 -->
        <el-button type="primary" @click="saveUserRoles">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import UserAPI, { UserInfo } from "@/api/User/user.api"; // 你的API路径
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus"; // ✅ 必须加 type
import { Plus } from "@element-plus/icons-vue";
import RoleAPI from "@/api/system/role.api";

const addFormRef = ref<FormInstance>();
const userList: any = ref([]);
const addDialogVisible = ref(false); // 弹窗显示状态
const isEditMode = ref(false); // 是否为编辑模式
const showPassword = ref(true); // 默认新增时显示密码

//#region 用户角色
// 分配角色相关逻辑
const roleDialogVisible = ref(false); // 控制角色弹窗
const selectedRoleIds: any = ref<string[]>([]); // 当前用户选择的角色
const allRoles = ref<any[]>([]); // 定义类型更安全
const currentUserId = ref(""); // 当前操作的用户ID
//#endregion

//#region 上传图片
// 图片 URL
//const avatarUrl = ref("");
// 上传成功后的文件列表（用于图片反填）
const avatarFileList = ref<any[]>([]);

const uploadUrl = "https://localhost:44341/api/app/common/upload-file";

// Token header
const uploadHeaders = {
  Authorization: "Bearer " + (localStorage.getItem("token") || ""),
};

// 上传成功回调
const handleUploadSuccess = (res: any, file: any) => {
  // 根据你后端返回字段修改！
  //avatarUrl.value = res; // 如果返回的是字符串 URL
  // avatarUrl.value = res.data; // 如果是 { data: "xxx" }
  addForm.avatar = res;
  // 重置 file-list 只保留上传成功的一张
  avatarFileList.value = [
    {
      name: file.name,
      url: res,
    },
  ];
};

// 上传前限制类型、大小
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("只能上传图片类型文件！");
    return false;
  }

  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 2MB！");
    return false;
  }

  return true;
};
//#endregion

// 表单模型
const addForm = reactive<UserInfo>({
  userName: "",
  realName: "",
  password: "",
  phoneInfo: "",
  avatar: "",
  email: "",
  isActive: true,
});

// 表单校验规则
const rules = {
  userName: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  realName: [{ required: true, message: "请输入真实姓名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  phoneInfo: [{ required: true, message: "请输入手机号", trigger: "blur" }],
  email: [
    {
      type: "email" as const, // 👈 关键是这里加 `as const`
      required: true,
      message: "请输入正确邮箱",
      trigger: "blur",
    },
  ],
};

// 打开弹窗
const openAddDialog = () => {
  showPassword.value = true; // 新增时需要填写密码
  isEditMode.value = false;
  Object.assign(addForm, {
    id: "",
    userName: "",
    realName: "",
    password: "",
    phoneInfo: "",
    email: "",
    avatar: "",
    isActive: true,
  });
  avatarFileList.value = []; // 清空上传列表，防止残留旧图
  addDialogVisible.value = true;
};

// 打开编辑弹窗
const openEditDialog = (user: UserInfo) => {
  isEditMode.value = true; // 编辑模式
  showPassword.value = false; // 编辑时不显示密码字
  Object.assign(addForm, user); // 赋值给表单模型
  addForm.avatar = user.avatar || "";
  avatarFileList.value = [];
  if (user.avatar) {
    avatarFileList.value = user.avatar
      ? [
          {
            name: "已上传头像",
            url: user.avatar,
          },
        ]
      : [];
  }

  addDialogVisible.value = true; // 弹窗显示
};

// 删除文件
const handleRemove = (file: any, fileList: any) => {
  console.log("删除了文件", file, fileList);
  addForm.avatar = "";
  avatarFileList.value = [];
};
/**
 * 提交用户
 */
const submitUser = () => {
  addFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    try {
      const formData = { ...addForm }; // 拷贝表单
      // 如果是编辑功能，并且没有修改密码，则删除password字段避免传入空字符串
      if (isEditMode.value && !formData.password) {
        delete formData.password;
      }
      if (isEditMode.value) {
        await UserAPI.updateUser(addForm.id!, addForm);
        ElMessage.success("更新成功");
      } else {
        await UserAPI.addUser(addForm);
        ElMessage.success("添加成功");
      }
      addDialogVisible.value = false;
      fetchUserList();
    } catch (error) {
      ElMessage.error("提交失败:" + error);
    }
  });
};

// 删除用户
const deleteUser = async (id: string) => {
  try {
    await ElMessageBox.confirm("确定要删除该用户吗？此操作不可撤销！", "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await UserAPI.deleteUser(id);
    ElMessage.success("删除成功");
    fetchUserList();
  } catch (error) {
    // 用户取消时不提示错误
    if (error !== "cancel" && error !== "close") {
      ElMessage.error("删除失败");
    }
  }
};

// 获取用户列表
function fetchUserList() {
  UserAPI.GetUserPage().then((res) => {
    userList.value = res; // ✅ 直接拿用户数组
  });
}

//#region 用户角色
// 打开"分配角色"弹窗
const openRoleDialog = async (user: any) => {
  currentUserId.value = user.id; // 保存当前操作用户的 ID
  roleDialogVisible.value = true; // 显示弹窗

  // 获取全部角色列表（例如：管理员、客服、销售）
  allRoles.value = await RoleAPI.getAllRoles();
  console.log("allRoles:", allRoles.value);

  // 获取该用户已拥有的角色（用于默认勾选）
  const userRoles = await UserAPI.getUserRoles(user.id); // 返回的是：[{ roleId }]
  console.log("userRoles:", userRoles);

  selectedRoleIds.value = userRoles; // 只取出 roleId 数组
  console.log("selectedRoleIds:", selectedRoleIds.value);
};

// 保存角色分配（提交到后端）
const saveUserRoles = async () => {
  try {
    // 提交用户 ID 和所选角色 ID 列表
    await UserAPI.setUserRoles(currentUserId.value, selectedRoleIds.value);

    // 提示保存成功
    ElMessage.success("角色分配成功");

    // 关闭弹窗
    roleDialogVisible.value = false;
  } catch (error) {
    ElMessage.error("角色分配失败：" + error);
  }
};
//#endregion

onMounted(fetchUserList);
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.avatar-uploader {
  width: 128px;
  height: 128px;
}
.avatar-uploader ::v-deep(.el-upload) {
  border: none;
  background-color: transparent;
}
</style>
