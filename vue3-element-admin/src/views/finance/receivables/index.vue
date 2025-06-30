<template>
  <div>
    <el-card>
      <div style="margin-bottom: 16px">
        <el-row>
          <el-col :span="4">
            <el-button type="primary" style="padding-right: 20px" @click="Addlist()">
              添加应收款
            </el-button>
          </el-col>
          <el-col :span="20" style="text-align: right">
            <el-date-picker v-model="dateRange" type="daterange" range-separator="-" start-placeholder="开始时间"
              end-placeholder="结束时间" value-format="YYYY-MM-DD" style="width: 260px; margin-right: 12px"
              @change="handleDateRangeChange" />
            <el-input v-model="searchForm.ReceivableCode" placeholder="应收款编号(不含符号)"
              style="width: 220px; margin-left: 16px" clearable />
            <el-button type="primary" style="margin-left: 8px; margin-right: 10px" @click="search()">
              高级搜索
            </el-button>
            <el-dropdown>
              <el-button>
                操作
                <el-icon>
                  <ArrowDown />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleBatchDelete">删除</el-dropdown-item>
                  <el-dropdown-item @click="handleExport">导出数据</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button style="margin-left: 8px" @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </div>
      <el-table ref="tableRef" v-loading="loading" :data="tableData" border style="width: 100%" empty-text="暂无数据"
        @selection-change="handleSelectionChange" @row-click="handleRowClick">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="receivableCode" label="应收款编号" />
        <el-table-column prop="receivablePay" label="应收款" />
        <el-table-column prop="amount" label="已收款" />
        <el-table-column label="剩余应收">
          <template #default="scope">
            {{ (scope.row.receivablePay || 0) - (scope.row.amount || 0) }}
          </template>
        </el-table-column>
        <el-table-column prop="receivableDate" label="应收款时间">
          <template #default="scope">
            {{ scope.row.receivableDate.substring(0, 10) }}
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="所属客户" />
        <el-table-column prop="contractName" label="关联合同" />
        <el-table-column prop="realName" label="负责人" />
        <el-table-column prop="creatorRealName" label="创建人" />
      </el-table>

      <!-- 分页区域 -->
      <div style="margin-top: 16px; display: flex; justify-content: center">
        <el-pagination v-model:current-page="pagination.PageIndex" v-model:page-size="pagination.PageSize"
          :page-sizes="[5, 10, 15, 20]" :total="pagination.totalCount" :background="true"
          layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>

      <!-- 添加应收款弹窗 -->
      <el-dialog v-model="showAddDialog" title="添加应收款" width="600px" @close="resetAddForm">
        <el-form ref="addFormRef" :model="addupdateForm" :rules="addRules" label-width="120px">
          <el-form-item label="所属客户" prop="customerName">
            <el-button type="primary" @click="showCustomer()">选择客户</el-button>
            <span style="margin-left: 10px; color: #999">
              {{ addupdateForm.customerName || "未选择客户" }}
            </span>
          </el-form-item>
          <el-form-item label="关联合同" prop="contractId">
            <el-select v-model="addupdateForm.contractId" placeholder="请选择合同" style="width: 100%">
              <el-option v-for="item in contractList" :label="item.contractName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="负责人" prop="userId">
            <el-select v-model="addupdateForm.userId" placeholder="请输入负责人" style="width: 100%">
              <el-option v-for="item in userList" :label="item.realName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="应收款编号" prop="receivableCode">
            <el-input v-model="addupdateForm.receivableCode" prefix-icon="M-" />
          </el-form-item>
          <el-form-item label="应收款金额" prop="receivablePay">
            <el-input v-model="addupdateForm.receivablePay" placeholder="请输入应收款金额" />
          </el-form-item>
          <el-form-item label="应收款时间" prop="receivableDate">
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

      <!-- 客户选择抽屉 -->
      <el-drawer v-model="showCustomerDrawer" title="客户列表" direction="rtl" size="80%" :with-header="true">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px">
          <el-button type="primary" @click="handleCustomerSubmit">提交</el-button>
          <el-button @click="showCustomerDrawer = false">取消</el-button>
        </div>
        <el-table :data="customerList" style="width: 100%" highlight-current-row>
          <el-table-column type="selection" width="50" :selectable="() => true" :reserve-selection="false"
            :show-overflow-tooltip="false" :fixed="true" :label="''">
            <template #default="{ row }">
              <el-radio :model-value="selectedCustomer && selectedCustomer.id" :label="row.id"
                @change="() => handleCustomerRadio(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="id" label="客户编号" />
          <el-table-column prop="customerName" label="客户名称" />
          <el-table-column prop="customerPhone" label="联系电话" />
          <el-table-column prop="creationTime" label="创建时间" />
        </el-table>
      </el-drawer>

      <!-- 高级搜索弹窗 -->
      <el-dialog v-model="showAdvancedSearch" title="高级搜索" width="800px" :close-on-click-modal="false" append-to-body>
        <el-form :model="searchForm" label-width="100px" label-position="right">
          <el-form-item label="应收款编号">
            <el-input v-model="searchForm.ReceivableCode" placeholder="请输入应收款编号" />
          </el-form-item>
          <el-form-item label="负责人" prop="userId">
            <el-select v-model="searchForm.UserId" placeholder="请输入负责人" style="width: 100%">
              <el-option v-for="item in userList" :label="item.realName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建人">
            <el-select v-model="searchForm.CreateId" placeholder="请选择创建人">
              <el-option v-for="item in userList" :label="item.realName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属客户" prop="customerName">
            <el-button type="primary" @click="showCustomer()">选择客户</el-button>
            <span style="margin-left: 10px; color: #999">
              {{ searchForm.CustomerId || "未选择客户" }}
            </span>
          </el-form-item>
          <el-form-item label="关联合同" prop="contractId">
            <el-select v-model="searchForm.ContractId" placeholder="请选择合同" style="width: 100%">
              <el-option v-for="item in contractList" :label="item.contractName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="应收款金额">
            <el-input v-model="searchForm.ReceivablePay" placeholder="请输入应收款金额" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showAdvancedSearch = false">取消</el-button>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </template>
      </el-dialog>

      <!-- 详情抽屉 -->
      <el-drawer v-model="showDetailDrawer" title="应收款详情" size="60%" direction="rtl" :with-header="false">
        <div style="padding: 24px 32px 0 32px">
          <!-- 顶部编号和按钮 -->
          <div style="display: flex; align-items: center; justify-content: space-between">
            <div style="font-weight: bold; font-size: 18px">
              <el-icon style="color: #409eff; margin-right: 6px">
                <Document />
              </el-icon>
              {{ detailData?.receivableCode || "-" }}
            </div>
            <div>
              <el-button type="primary" size="small" @click="handleEditDetail">修改</el-button>
              <el-button type="danger" size="small" style="margin-left: 8px">删除</el-button>
            </div>
          </div>

          <!-- 基本信息分区 -->
          <div style="margin-top: 24px">
            <div style="
                font-weight: bold;
                font-size: 15px;
                border-left: 3px solid #faad14;
                padding-left: 8px;
                margin-bottom: 18px;
              ">
              基本信息
            </div>
            <el-row :gutter="32">
              <el-col :span="12">
                <div class="info-row">
                  <span class="info-label">应收款编号：</span>
                  {{ detailData?.receivableCode }}
                </div>
                <div class="info-row">
                  <span class="info-label">所属客户：</span>
                  <el-link type="primary" :underline="false">
                    {{ detailData?.customerName }}
                  </el-link>
                </div>
                <div class="info-row">
                  <span class="info-label">应收款：</span>
                  {{ detailData?.receivablePay }}
                </div>
                <div class="info-row">
                  <span class="info-label">负责人：</span>
                  {{ detailData?.realName }}
                </div>
                <div class="info-row">
                  <span class="info-label">创建人：</span>
                  {{ detailData?.creatorRealName }}
                </div>
                <div class="info-row">
                  <span class="info-label">备注：</span>
                  {{ detailData?.remark || "-" }}
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-row">
                  <span class="info-label">关联合同：</span>
                  <el-link type="primary" :underline="false">
                    {{ detailData?.contractName }}
                  </el-link>
                </div>
                <div class="info-row">
                  <span class="info-label">实际收款金额：</span>
                  <span style="color: #f5222d">{{ detailData?.amount }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">收款时间：</span>
                  {{ detailData?.receivableDate.substring(0, 19).replace("T", "") }}
                </div>
                <div class="info-row">
                  <span class="info-label">创建时间：</span>
                  {{ detailData?.creationTime.substring(0, 19).replace("T", "") }}
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-drawer>

      <!-- 修改收款抽屉 -->
      <el-drawer v-model="showEditDrawer" title="修改收款" size="600px" direction="rtl" :with-header="true">
        <el-form ref="editFormRef" :model="editForm" label-width="110px" :rules="addRules">
          <el-form-item label="所属客户" prop="customerName" required>
            <el-select v-model="editForm.customerName" disabled placeholder="请选择">
              <el-option v-for="item in customerList" :key="item.id" :label="item.customerName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="关联合同" prop="contractId" required>
            <el-select v-model="editForm.contractId" disabled placeholder="请选择">
              <el-option v-for="item in contractList" :key="item.id" :label="item.contractName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="负责人" prop="userId" required>
            <el-select v-model="editForm.userId" placeholder="请选择">
              <el-option v-for="item in userList" :key="item.id" :label="item.realName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="应收款编号" prop="reactivebleCode">
            <el-input v-model="editForm.receivableCode" />
          </el-form-item>
          <el-form-item label="应收款金额" prop="receivablePay" required>
            <el-input v-model="editForm.receivablePay" />
          </el-form-item>
          <el-form-item label="应收款时间" prop="receivableDate" required>
            <el-date-picker v-model="editForm.receivableDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="editForm.remark" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleEditSubmit">提交</el-button>
            <el-button @click="showEditDrawer = false">取消</el-button>
          </el-form-item>
        </el-form>
      </el-drawer>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated } from "vue";
import ReceivablesViewAPI, {
  ReceivablesPageQuery,
  ReceivableSearch,
} from "@/api/Finance/receivables.api";
import CustomerAPI, { CustomerPageQuery, CustomerData } from "@/api/CustomerProcess/customer.api";
import CrmContractAPI from "@/api/crmcontract";
import UserAPI from "@/api/User/user.api";
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

// 时间范围中间变量
const dateRange = ref([]);

// 搜索表单
const searchForm = reactive({
  StartTime: "",
  EndTime: "",
  ReceivableCode: "",
  UserId: "",
  CreateId: "",
  CustomerId: "",
  ContractId: "",
  ReceivablePay: "",
});

// 获取应收款数据
const GetReceivables = () => {
  loading.value = true;
  const params: ReceivablesPageQuery = {
    PageIndex: pagination.PageIndex,
    PageSize: pagination.PageSize,
    //receivableCode: searchForm.receivableCode,
    StartTime: searchForm.StartTime,
    EndTime: searchForm.EndTime,
    ReceivableCode: searchForm.ReceivableCode,
    CustomerId: searchForm.CustomerId,
    ContractId: searchForm.ContractId,
    UserId: searchForm.UserId,
    ReceivablePay: searchForm.ReceivablePay,
    CreateId: searchForm.CreateId,
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

// 添加弹窗相关
const showAddDialog = ref(false); // 添加应收款弹窗
const showCustomerDrawer = ref(false); // 客户选择抽屉

const Addlist = () => {
  showAddDialog.value = true;
};

const addFormRef = ref();
const addupdateForm = reactive({
  creationTime: "",
  creatorId: "",
  customerId: "",
  contractId: "",
  userId: "",
  receivableCode: "",
  receivablePay: 0,
  receivableDate: "2025-06-28T02:53:26.870Z",
  remark: "",
  customerName: "",
  creatorName: "",
});

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
// 高级搜索抽屉
const showAdvancedSearch = ref(false);
const search = () => {
  showAdvancedSearch.value = true;
};

// 搜索
function handleSearch() {
  // 这里将form的内容作为搜索条件，刷新页面或重新请求数据
  showAdvancedSearch.value = false;
  pagination.PageIndex = 1; // 重置到第一页
  GetReceivables();
}
// 重置
function handleReset() {
  searchForm.ReceivableCode = "";
  pagination.PageIndex = 1;
  GetReceivables();
}

// 监听时间范围变化，自动同步到 StartTime 和 EndTime，并自动查询
function handleDateRangeChange(val: any) {
  searchForm.StartTime = val?.[0] || "";
  searchForm.EndTime = val?.[1] || "";
  GetReceivables();
}

// 客户列表数据（实际应从API获取，这里举例）
const customerList = ref<CustomerData[]>([]);

function showCustomer() {
  showCustomerDrawer.value = true;
  const params: CustomerPageQuery = {
    PageIndex: 1,
    PageSize: 111,
  };

  CustomerAPI.GetCustomerPage(params)
    .then((res) => {
      console.log("客户列表数据", res.data);
      customerList.value = res.data;
      pagination.totalCount = res.totalCount;
      pagination.pageCount = res.pageCount;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 当前选中的客户
const selectedCustomer = ref<any>(null);
// 选择客户单选逻辑
function handleCustomerRadio(row: any) {
  selectedCustomer.value = row;
}
// 提交客户选择
function handleCustomerSubmit() {
  if (!selectedCustomer.value) {
    ElMessage.warning("请选择客户");
    return;
  }
  addupdateForm.customerId = selectedCustomer.value.id;
  addupdateForm.customerName = selectedCustomer.value.customerName;
  showCustomerDrawer.value = false;
}

// 获取合同列表数据
const contractList: any = ref([]);
//显示查询分页
const GetcontractData = async () => {
  const pageForm = reactive({
    PageIndex: 1,
    PageSize: 111,
  });
  CrmContractAPI.getInfo(pageForm)
    .then((res) => {
      console.log("合同列表数据", res);
      contractList.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

// 获取负责人列表数据
const userList: any = ref([]);
//显示查询分页
const UserData = async () => {
  UserAPI.GetUserPage()
    .then((res) => {
      console.log("负责人用户列表数据", res);
      userList.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

function addExplain() {
  ElMessage.info("增加应收款明细功能待实现");
}
// 重置添加表单
function resetAddForm() {
  addupdateForm.contractId = "";
  addupdateForm.customerId = "";
  addupdateForm.receivableCode = "";
  addupdateForm.receivableDate = "";
  addupdateForm.receivablePay = 0;
  addupdateForm.userId = "";
  addupdateForm.remark = "";
  addupdateForm.customerName = "";
  addupdateForm.creatorName = "";
}
// 提交添加应收款
function handleAddSubmit() {
  addFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // 这里写实际的添加API调用
      ReceivablesViewAPI.AddReceivable(addupdateForm).then((res) => {
        if (res.data) {
          ElMessage.success("添加成功");
        } else {
          ElMessage.error("添加失败");
        }
      });
      showAddDialog.value = false;
      resetAddForm();
      GetReceivables(); // 刷新列表
    } else {
      ElMessage.error("请完善表单信息");
    }
  });
}

// 删除应收款
// function handleDelete(id: string) {
//   ElMessageBox.confirm("确定要删除该应收款吗？", "提示", {
//     type: "warning",
//   }).then(() => {
//     ReceivablesViewAPI.DeleteReceivable(id)
//       .then(() => {
//         ElMessage.success("删除成功");
//         GetReceivables(); // 重新加载数据
//       })
//       .catch((error) => {
//         console.error("删除失败:", error);
//         ElMessage.error("删除失败");
//       });
//   });
// }

// 页面加载时获取数据
onMounted(() => {
  GetReceivables();
  GetcontractData();
  UserData();
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

const tableRef = ref();
const selectedRows = ref([]); // 存储选中的行

function handleSelectionChange(selection: any) {
  console.log("handleSelectionChange", selection);
  selectedRows.value = selection;
}
function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请先选择要删除的数据！");
    return;
  }
  console.log("选中的", selectedRows.value);
  ElMessageBox.confirm(`确定要删除选中的${selectedRows.value.length}条数据吗？`, "提示", {
    type: "warning",
  }).then(() => {
    // 这里假设你有批量删除API
    const ids: string[] = selectedRows.value.map((item: any) => item.id);
    ReceivablesViewAPI.BatchDeleteReceivables(ids).then(() => {
      // 提示用户
      ElMessage.success("删除成功");
      // 刷新表格
      GetReceivables();
      // 清空选中
      tableRef.value.clearSelection();
    });
  });
}

function handleExport() {
  location.href = "https://localhost:44341/api/app/receivables/export-receivables-async-excel";
}

const showDetailDrawer = ref(false);
const detailData = ref<any>(null);
// 显示详情抽屉
function handleRowClick(row: any) {
  detailData.value = row;
  showDetailDrawer.value = true;
}

const showEditDrawer = ref(false);
const editFormRef = ref();
const editForm = reactive({
  creationTime: "",
  creatorId: "",
  customerId: "",
  contractId: "",
  userId: "",
  receivableCode: "",
  receivablePay: 0,
  receivableDate: "2025-06-28T02:53:26.870Z",
  remark: "",
  customerName: "",
  creatorName: "",
});

function handleEditDetail() {
  // 反填数据
  Object.assign(editForm, detailData.value);
  showEditDrawer.value = true;
}

// 提交修改
function handleEditSubmit() {
  editFormRef.value.validate((valid: boolean) => {
    if (!valid) return;
    ReceivablesViewAPI.UpdateReceivable(detailData.value.id,editForm ).then((res) => {
      if(res.data) {
        ElMessage.success("修改成功");
      } else {
        ElMessage.error("修改失败");
      }
      showEditDrawer.value = false;
      GetReceivables();
    });
  });
}
</script>

<style scoped>
.info-row {
  margin-bottom: 10px;
  font-size: 15px;
}

.info-label {
  color: #888;
  min-width: 90px;
  display: inline-block;
}
</style>
