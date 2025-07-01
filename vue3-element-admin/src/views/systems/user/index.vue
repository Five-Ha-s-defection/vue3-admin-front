<template>
  <el-card>
    <!-- 操作区域 -->
    <div class="mb-2 flex justify-end">
      <el-button type="primary" @click="openAddDialog">新增用户</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="userList" style="width: 100%" border>
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="realName" label="真实姓名" />
      <el-table-column prop="phoneInfo" label="手机号" />
      <el-table-column prop="email" label="邮箱" />

      <el-table-column label="操作" fixed="right" width="150">
        <template #default="{ row }">
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteUser(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增用户弹窗 -->
    <el-dialog v-model="addDialogVisible" title="新增用户" width="500px">
      <el-form ref="addFormRef" :model="addForm" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="addForm.userName" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="addForm.realName" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" show-password />
        </el-form-item>

        <!--头像-->
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            list-type="picture-card"
            name="file"
          >
            <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
            <el-icon v-else><Plus /></el-icon>
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
        <el-button type="primary" @click="submitAddUser">提交</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import UserAPI, { UserInfo } from "@/api/User/user.api"; // 你的API路径
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus"; // ✅ 必须加 type
import { Plus } from "@element-plus/icons-vue";

const addFormRef = ref<FormInstance>();
const userList: any = ref([]);
const addDialogVisible = ref(false); // 弹窗显示状态
const isEditMode = ref(false); // 是否为编辑模式

// 图片 URL
const avatarUrl = ref("");

const uploadUrl = "https://localhost:44341/api/app/common/upload-file";

// Token header
const uploadHeaders = {
  Authorization: "Bearer " + (localStorage.getItem("token") || ""),
};

// 上传成功回调
const handleUploadSuccess = (res: any) => {
  // 根据你后端返回字段修改！
  avatarUrl.value = res; // 如果返回的是字符串 URL
  // avatarUrl.value = res.data; // 如果是 { data: "xxx" }
  addForm.avatar = res;
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
  Object.assign(addForm, {
    userName: "",
    realName: "",
    password: "",
    phoneInfo: "",
    email: "",
    isActive: true,
  });
  addDialogVisible.value = true;
};

// 打开编辑弹窗
const openEditDialog = (user: UserInfo) => {
  Object.assign(addForm, user);
  isEditMode.value = true;
  addDialogVisible.value = true;
};

const submitUser = () => {
  addFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    try {
      if (isEditMode.value) {
        await UserAPI.updateUser(addForm.id!, addForm);
        ElMessage.success("更新成功");
      } else {
        await UserAPI.addUser(addForm);
        ElMessage.success("添加成功");
      }
      addDialogVisible.value = false;
      fetchUserList();
    } catch (e) {
      ElMessage.error("提交失败");
    }
  });
};

// 删除用户
const deleteUser = async (id: string) => {
  try {
    await UserAPI.deleteUser(id);
    ElMessage.success("删除成功");
    fetchUserList();
  } catch (error) {
    console.error("删除失败", error);
  }
};

// 获取用户列表
function fetchUserList() {
  UserAPI.GetUserPage().then((res) => {
    userList.value = res; // ✅ 直接拿用户数组
  });
}

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
</style>
