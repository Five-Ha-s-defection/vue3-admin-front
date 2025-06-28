<template>
  <div>
    <el-card>
      <div style="margin-bottom: 16px">
        <el-button type="primary" @click="Addlist()">添加应收款</el-button>
        <el-input v-model="searchForm.receivableCode" placeholder="应收款编号(不含符号)" style="width: 220px; margin-left: 16px"
          clearable />
        <el-button type="primary" style="margin-left: 8px" @click="handleSearch">查询</el-button>
        <el-button style="margin-left: 8px" @click="handleReset">重置</el-button>
      </div>
      <el-table v-loading="loading" :data="tableData" border style="width: 100%" empty-text="暂无数据">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="receivableCode" label="应收款编号" />
        <el-table-column prop="receivablePay" label="应收款" />
        <el-table-column prop="amount" label="已收款" />
        <el-table-column label="剩余应收">
          <template #default="scope">
            {{ (scope.row.receivablePay || 0) - (scope.row.amount || 0) }}
          </template>
        </el-table-column>
        <el-table-column prop="receivableDate" label="应收款时间" />
        <el-table-column prop="customerName" label="所属客户" />
        <el-table-column prop="contractName" label="关联合同" />
        <el-table-column prop="userName" label="负责人" />
        <el-table-column prop="creatorId" label="创建人" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <div style="margin-top: 16px; display: flex; justify-content: center">
        <el-pagination v-model:current-page="pagination.PageIndex" v-model:page-size="pagination.PageSize"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.totalCount" :background="true"
          layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>

      <!-- 添加应收款弹窗 -->
      <el-dialog v-model="showAddDialog" title="添加应收款" width="600px" @close="resetAddForm">
        <el-form ref="addFormRef" :model="addupdateForm" :rules="addRules" label-width="120px">
          <el-form-item label="所属客户" prop="customer">
            <el-button type="primary" @click="selectCustomer">选择客户</el-button>
            <span style="margin-left: 10px; color: #999">
              {{ addupdateForm.customerId || "未选择客户" }}
            </span>
          </el-form-item>
          <el-form-item label="关联合同" prop="contract">
            <el-select v-model="addupdateForm.contractId" placeholder="请选择合同" style="width: 100%">
              <el-option v-for="item in contractList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="负责人" prop="owner">
            <el-select v-model="addupdateForm.userId" placeholder="请输入负责人" style="width: 100%">
              <el-option v-for="item in contractList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="应收款编号" prop="code">
            <el-input v-model="addupdateForm.receivableCode" prefix-icon="M-" />
          </el-form-item>
          <el-form-item label="应收款金额" prop="amount">
            <el-input v-model="addupdateForm.receivablePay" placeholder="请输入应收款金额" />
          </el-form-item>
          <el-form-item label="应收款时间" prop="date">
            <el-date-picker v-model="addupdateForm.receivableDate" type="date" placeholder="选择时间" style="width: 100%" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addExplain">+ 增加应收款明细</el-button>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="addupdateForm.remark" type="textarea" :rows="4" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleAddSubmit">提交</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated } from "vue";
import ReceivablesViewAPI, {
  ReceivablesPageQuery,
  ReceivableSearch,
} from "@/api/Finance/receivables.api";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const tableData = ref<ReceivableSearch[]>([]);

// 分页配置
const pagination = reactive({
  PageIndex: 1,
  PageSize: 10,
  totalCount: 0,
  pageCount: 0,
});

// 搜索表单
const searchForm = reactive({
  receivableCode: "",
});

// 添加弹窗相关
const showAddDialog = ref(false);// 添加应收款弹窗
const showAddCustomer = ref(false); // 添加客户弹窗

const Addlist = () => {
  showAddDialog.value = true;
}
const addFormRef = ref();
const addupdateForm = reactive({
  "customerId": "",
  "contractId": "",
  "userId": "",
  "receivableCode": "",
  "receivablePay": 0,
  "receivableDate": "2025-06-28T02:53:26.870Z",
  "remark": "",
});
const contractList = [
  { label: "合同A", value: "a" },
  { label: "合同B", value: "b" },
];
const addRules = {
  customer: [{ required: true, message: "请选择客户", trigger: "blur" }],
  contract: [{ required: true, message: "请选择合同", trigger: "blur" }],
  owner: [{ required: true, message: "请输入负责人", trigger: "blur" }],
  code: [{ required: true, message: "请输入应收款编号", trigger: "blur" }],
  amount: [{ required: true, message: "请输入应收款金额", trigger: "blur" }],
  date: [{ required: true, message: "请选择应收款时间", trigger: "change" }],
};

// 分页大小改变
function handleSizeChange(val: number) {
  pagination.PageSize = val;
  pagination.PageIndex = 1; // 重置到第一页
  GetReceivables();
}

// 当前页改变
function handleCurrentChange(val: number) {
  pagination.PageIndex = val;
  GetReceivables();
}

// 搜索
function handleSearch() {
  pagination.PageIndex = 1; // 重置到第一页
  GetReceivables();
}

// 重置
function handleReset() {
  searchForm.receivableCode = "";
  pagination.PageIndex = 1;
  GetReceivables();
}

// 获取应收款数据
const GetReceivables = () => {
  loading.value = true;
  const params: ReceivablesPageQuery = {
    PageIndex: pagination.PageIndex,
    PageSize: pagination.PageSize,
    receivableCode: searchForm.receivableCode || undefined,
  };

  ReceivablesViewAPI.GetReceivablesPage(params)
    .then((res) => {
      console.log("应收款数据", res);

      tableData.value = res.data;
      pagination.totalCount = res.totalCount;
      pagination.pageCount = res.pageCount;
    })
    .finally(() => {
      loading.value = false;
    });
};

function selectCustomer() {
  showAddCustomer.value = true; // 关闭添加弹窗
}
function addExplain() {
  ElMessage.info("增加应收款明细功能待实现");
}
function resetAddForm() {
  addupdateForm.contractId = "";
  addupdateForm.customerId = "";
  addupdateForm.receivableCode = "";
  addupdateForm.receivableDate = "";
  addupdateForm.receivablePay = 0;
  addupdateForm.userId = "";
  addupdateForm.remark = "";
}

function handleAddSubmit() {
  addFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // 这里写实际的添加API调用
      ElMessage.success("提交成功");
      showAddDialog.value = false;
      resetAddForm();
      GetReceivables(); // 刷新列表
    } else {
      ElMessage.error("请完善表单信息");
    }
  });
}

// 删除应收款
function handleDelete(id: string) {
  ElMessageBox.confirm("确定要删除该应收款吗？", "提示", {
    type: "warning",
  }).then(() => {
    ReceivablesViewAPI.DeleteReceivable(id)
      .then(() => {
        ElMessage.success("删除成功");
        GetReceivables(); // 重新加载数据
      })
      .catch((error) => {
        console.error("删除失败:", error);
        ElMessage.error("删除失败");
      });
  });
}

// 页面加载时获取数据
onMounted(() => {
  GetReceivables();
});

// 路由激活时刷新（用于Add.vue返回后刷新列表）
onActivated(() => {
  // 判断是否带有刷新标记
  if (route.query.refresh) {
    GetReceivables();
    // 清除刷新标记，避免重复刷新
    router.replace({ query: { ...route.query, refresh: undefined } });
  }
});
</script>

<style scoped></style>
