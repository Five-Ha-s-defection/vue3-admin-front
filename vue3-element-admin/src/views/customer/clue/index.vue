<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="线索名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入线索名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input
            v-model="queryParams.phone"
            placeholder="请输入联系电话"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 200px"
          >
            <el-option label="待跟进" value="pending" />
            <el-option label="跟进中" value="following" />
            <el-option label="已转化" value="converted" />
            <el-option label="已失效" value="invalid" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleResetQuery">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </el-col>
        </el-row>
      </template>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="clueList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="线索名称" prop="name" min-width="120" show-overflow-tooltip />
        <el-table-column label="联系电话" prop="phone" width="120" />
        <el-table-column label="邮箱" prop="email" width="180" show-overflow-tooltip />
        <el-table-column label="公司" prop="company" min-width="150" show-overflow-tooltip />
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" link @click="handleFollow(row)">
              <el-icon><Message /></el-icon>
              跟进
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
      append-to-body
      @close="handleCloseDialog"
    >
      <el-form ref="clueFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="线索名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入线索名称" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="公司" prop="company">
          <el-input v-model="formData.company" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="待跟进" value="pending" />
            <el-option label="跟进中" value="following" />
            <el-option label="已转化" value="converted" />
            <el-option label="已失效" value="invalid" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Search, Refresh, Plus, Download, Edit, Message, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({
  name: "CustomerClue",
});

// 定义线索数据类型
interface ClueData {
  id: number;
  name: string;
  phone: string;
  email: string;
  company: string;
  status: string;
  createTime: string;
  remark?: string;
}

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: "",
  phone: "",
  status: "",
});

// 表格数据
const clueList = ref<ClueData[]>([]);
const total = ref(0);
const loading = ref(false);
const selectedIds = ref<number[]>([]);

// 对话框状态
const dialog = reactive({
  visible: false,
  title: "",
});

// 表单数据
const formData = reactive<ClueData>({
  id: 0,
  name: "",
  phone: "",
  email: "",
  company: "",
  status: "pending",
  createTime: "",
  remark: "",
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入线索名称", trigger: "blur" }],
  phone: [{ required: true, message: "请输入联系电话", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

// 表单引用
const queryFormRef = ref();
const clueFormRef = ref();

// 获取线索列表
const getClueList = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 模拟数据
    clueList.value = [
      {
        id: 1,
        name: "张三",
        phone: "13800138000",
        email: "zhangsan@example.com",
        company: "ABC公司",
        status: "pending",
        createTime: "2024-01-15 10:30:00",
      },
      {
        id: 2,
        name: "李四",
        phone: "13800138001",
        email: "lisi@example.com",
        company: "XYZ公司",
        status: "following",
        createTime: "2024-01-14 14:20:00",
      },
    ];
    total.value = 2;
  } catch (error) {
    console.error("获取线索列表失败:", error);
    ElMessage.error("获取线索列表失败");
  } finally {
    loading.value = false;
  }
};

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1;
  getClueList();
};

// 重置查询
const handleResetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

// 选择变化
const handleSelectionChange = (selection: ClueData[]) => {
  selectedIds.value = selection.map((item) => item.id);
};

// 新增
const handleAdd = () => {
  dialog.visible = true;
  dialog.title = "新增线索";
  Object.assign(formData, {
    id: 0,
    name: "",
    phone: "",
    email: "",
    company: "",
    status: "pending",
    createTime: "",
    remark: "",
  });
};

// 编辑
const handleEdit = (row: ClueData) => {
  dialog.visible = true;
  dialog.title = "编辑线索";
  Object.assign(formData, row);
};

// 删除
const handleDelete = async (row: ClueData) => {
  try {
    await ElMessageBox.confirm("确认删除该线索吗？", "提示", {
      type: "warning",
    });
    ElMessage.success("删除成功");
    getClueList();
  } catch (error) {
    // 用户取消删除
  }
};

// 跟进
const handleFollow = () => {
  ElMessage.info("跟进功能开发中...");
};

// 导出
const handleExport = () => {
  ElMessage.info("导出功能开发中...");
};

// 提交表单
const handleSubmit = async () => {
  try {
    await clueFormRef.value?.validate();
    ElMessage.success(dialog.title === "新增线索" ? "新增成功" : "编辑成功");
    dialog.visible = false;
    getClueList();
  } catch {
    console.error("表单验证失败");
  }
};

// 关闭对话框
const handleCloseDialog = () => {
  dialog.visible = false;
  clueFormRef.value?.resetFields();
};

// 分页大小变化
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  getClueList();
};

// 当前页变化
const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val;
  getClueList();
};

// 获取状态类型
const getStatusType = (status: string): "warning" | "primary" | "success" | "info" => {
  const statusMap: Record<string, "warning" | "primary" | "success" | "info"> = {
    pending: "warning",
    following: "primary",
    converted: "success",
    invalid: "info",
  };
  return statusMap[status] || "info";
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "待跟进",
    following: "跟进中",
    converted: "已转化",
    invalid: "已失效",
  };
  return statusMap[status] || "未知";
};

// 页面加载时获取数据
onMounted(() => {
  getClueList();
});
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .mb8 {
      margin-bottom: 8px;
    }
  }

  .dialog-footer {
    text-align: right;
  }
}
</style>
