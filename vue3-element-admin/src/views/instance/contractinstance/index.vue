<template>
  <div class="contract-query-ui">
    <!-- 查询板块 -->
    <el-card>
      <div class="header">
        <span class="title">合同列表</span>
        <span class="total">
          | 总记录数：
          <span class="count">{{ pageinfo.totalCount }}</span>
          条
        </span>
      </div>
    </el-card>

    <!-- 客户选择对话框 -->
    <el-dialog v-model="showCustomerDialog" title="客户列表" width="60%" destroy-on-close>
      <div style="display: flex; justify-content: flex-end; margin-bottom: 10px">
        <el-button type="primary" @click="handleCustomerSubmit">提交</el-button>
        <el-button @click="showCustomerDialog = false">取消</el-button>
      </div>
      <el-table :data="customerList" style="width: 100%" highlight-current-row>
        <el-table-column label="" width="50" align="center">
          <template #default="{ row }">
            <el-radio
              :model-value="selectedCustomerId"
              :label="row.id"
              @change="() => handleCustomerRadio(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="id" label="客户编号" />
        <el-table-column prop="customerName" label="客户名称" />
        <el-table-column prop="customerPhone" label="联系电话" />
        <el-table-column prop="creationTime" label="创建时间">
          <template #default="{ row }">
            {{ row.creationTime.substring(0, 10) }} {{ row.creationTime.substring(11, 16) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 表格板块 -->
    <el-card style="margin-top: 10px">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        size="small"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="paymentStatus" label="状态" width="80" align="center">
          <template #default="{ row }">
            <span
              :style="{
                color:
                  row.paymentStatus === 0
                    ? '#faad14'
                    : row.paymentStatus === 1
                      ? '#13c2c2'
                      : row.paymentStatus === 2
                        ? '#f5222d'
                        : '#333',
                fontWeight: row.paymentStatus === 2 ? 'bold' : 'normal',
              }"
            >
              {{
                row.paymentStatus === 0 ? "待审核" : row.paymentStatus === 1 ? "已审核" : "已驳回"
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="contractProceeds" label="合同金额" align="center" />
        <el-table-column prop="received" label="已收款" align="center" />
        <el-table-column prop="remaining" label="剩余应收" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.remaining > 0 ? '#f5222d' : '#333' }">
              {{ row.remaining }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="收款进度" align="center" />
        <el-table-column prop="signDate" label="签订日期" align="center" width="130">
          <template #default="{ row }">
            {{ row.signDate.substring(0, 10) }} {{ row.signDate.substring(11, 19) }}
          </template>
        </el-table-column>
        <el-table-column prop="contractName" label="合同名称" align="center" />
        <el-table-column prop="expirationDate" label="截止日期" align="center" width="130">
          <template #default="{ row }">
            {{ row.expirationDate.substring(0, 10) }} {{ row.expirationDate.substring(11, 19) }}
          </template>
        </el-table-column>
        <el-table-column prop="dealer" label="经销商" align="center" />
        <el-table-column prop="customerName" label="所属客户" align="center" />
        <el-table-column prop="creationTime" label="创建时间" align="center" width="130">
          <template #default="{ row }">
            {{ row.creationTime.substring(0, 10) }} {{ row.creationTime.substring(11, 16) }}
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="负责人" align="center" />
        <el-table-column prop="createUserName" label="创建人" align="center" />
      </el-table>
    </el-card>

    <!-- 合同表的抽屉 -->
    <el-drawer v-model="showDetailDrawer" direction="rtl" size="50%" :with-header="true">
      <template #title>
        <span style="display: flex; align-items: center">
          <el-icon style="margin-right: 8px">
            <Document />
          </el-icon>
          <span>{{ currentDetail?.id }}</span>
        </span>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="合同详情" name="contract">
          <div v-if="currentDetail">
            <div class="detail-row">
              <b>合同编号：</b>
              {{ currentDetail.id }}
            </div>
            <div class="detail-row">
              <b>合同名称：</b>
              {{ currentDetail.name }}
            </div>
            <div class="detail-row">
              <b>合同金额：</b>
              {{ currentDetail.amount }}
            </div>
            <div class="detail-row">
              <b>签订日期：</b>
              {{ currentDetail.signDate }}
            </div>
            <div class="detail-row">
              <b>截止日期：</b>
              {{ currentDetail.endDate }}
            </div>
            <div class="detail-row">
              <b>经销商：</b>
              {{ currentDetail.dealer }}
            </div>
            <div class="detail-row">
              <b>所属客户：</b>
              {{ currentDetail.customer }}
            </div>
            <div class="detail-row">
              <b>创建时间：</b>
              {{ currentDetail.createTime }}
            </div>
            <div class="detail-row">
              <b>负责人：</b>
              {{ currentDetail.manager }}
            </div>
            <div class="detail-row">
              <b>创建人：</b>
              {{ currentDetail.createUser }}
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="产品详情" name="product">
          <div>这里是产品详情内容</div>
        </el-tab-pane>
        <el-tab-pane label="财务" name="finance">
          <div>这里是财务内容</div>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from "vue";
import { Document } from "@element-plus/icons-vue";
import CrmContractAPI from "@/api/CrmContract/crmcontract";
import UserAPI from "@/api/User/user.api";
import CustomerAPI from "@/api/CustomerProcess/Customer/customer.api";
import { useRouter } from "vue-router";

const router = useRouter();

//#region 显示数据查询分页
// 定义合同数据类型
interface ContractItem {
  id: string;
  status: string;
  amount: number;
  received: number;
  remaining: number;
  progress: string;
  signDate: string;
  name: string;
  endDate: string;
  dealer: string;
  customer: string;
  createTime: string;
  manager: string;
  createUser: string;
}

const searchForm = reactive({
  SearchTimeType: 0, // 查询时间类型 0:创建时间 1:签订日期 2:生效日期 3:截至日期
  BeginTime: "", // 开始时间
  EndTime: "", // 结束时间
  CheckType: 0, // 查询方式 0:不使用高级搜索 1:使用全部满足条件搜索 2:部分满足条件搜索
  UserIds: [], // 负责用户
  CreateUserIds: [], // 创建人
  CustomerId: "", // 客户ID
  ContractName: "", // 合同名称
  SignDate: "", // 签订日期
  CommencementDate: "", // 生效日期
  ExpirationDate: "", // 截止日期
  Dealer: "", // 经销商
  ContractProceeds: 0, // 合同金额
  PageIndex: 1,
  PageSize: 10,
});

const tableData = ref<ContractItem[]>([]);
const pageinfo = reactive({
  pageCount: 0,
  totalCount: 0,
});

//显示查询分页
const getTableData = async () => {
  try {
    const res: any = await CrmContractAPI.getInfo(searchForm);

    // 如果返回的是数组，进行数据转换
    if (Array.isArray(res)) {
      tableData.value = res.map((item) => ({
        // 将API返回的数据映射到表格需要的字段
        id: item.id || "",
        status: item.status || "待审核",
        amount: item.amount || item.contractAmount || 0,
        received: item.received || item.receivedAmount || 0,
        remaining:
          (item.amount || item.contractAmount || 0) - (item.received || item.receivedAmount || 0),
        progress: item.progress || "0%",
        signDate: item.signDate || item.createTime,
        name: item.contractName || item.name || "未命名合同",
        endDate: item.expirationDate || item.endDate,
        dealer: item.dealer || "",
        customer: item.customerName || item.customer || "",
        createTime: item.createTime || "",
        manager: item.manager || "",
        createUser: item.createUser || "",
      }));
      pageinfo.totalCount = res.length;
    } else if (res && res.data) {
      // 处理标准API返回格式
      tableData.value = res.data || [];
      pageinfo.pageCount = res.pageCount || 0;
      pageinfo.totalCount = res.totalCount || 0;
    } else {
      tableData.value = [];
      pageinfo.totalCount = 0;
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    tableData.value = [];
  }
};

//#endregion

//#region 删除多个合同
const deleteids = ref<string[]>([]);

const handleSelectionChange = (selection: ContractItem[]) => {
  deleteids.value = selection.map((item) => item.id);
};

//#endregion

//#region 用户下拉框
// 定义用户数据类型
interface UserItem {
  id: string;
  name: string;
  realName?: string;
}

// 用户列表数据
const users = ref<UserItem[]>([]);

// 获取用户列表
const getUsers = async () => {
  const res: any = await UserAPI.GetUserPage();
  users.value = res;
  console.log(users.value);
};
//#endregion

//#region 客户选择
// 定义客户数据类型
interface CustomerItem {
  id: string;
  customerName: string;
  customerPhone?: string;
  creationTime?: string;
}

// 客户选择相关
const showCustomerDialog = ref(false);
const customerList = ref<CustomerItem[]>([]);
const selectedCustomerId = ref<string>("");
// 获取客户列表
const getCustomerList = async () => {
  try {
    const params = { PageIndex: 1, PageSize: 100 };
    const res = await CustomerAPI.GetCustomerPage(params);
    if (res && res.data) {
      customerList.value = res.data;
    }
  } catch (error) {
    console.error("获取客户列表失败:", error);
  }
};
// 打开客户选择对话框
const selectCustomer = () => {
  showCustomerDialog.value = true;
  getCustomerList();
};
// 单选客户
const handleCustomerRadio = (row: CustomerItem) => {
  selectedCustomerId.value = row.id;
};
// 提交客户选择
const handleCustomerSubmit = () => {
  if (selectedCustomerId.value) {
    searchForm.CustomerId = selectedCustomerId.value;
    showCustomerDialog.value = false;
  }
};

//#endregion

//#region 合同详情
const showDetailDrawer = ref(false);
const currentDetail = ref<ContractItem | null>(null);
const activeTab = ref("contract");

const handleRowClick = (row: ContractItem) => {
  currentDetail.value = row;
  showDetailDrawer.value = true;
};
//#endregion

const goAddContract = () => {
  router.push({
    path: "/crmcontract/addcontract",
    query: { _t: Date.now() },
  });
};

onMounted(() => {
  getTableData();
  getUsers();
});
</script>

<style scoped>
.detail-row {
  margin-bottom: 12px;
  font-size: 15px;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 10px 30px 0 30px;
}

.form-item {
  display: flex;
  align-items: center;
}

.label {
  width: 100px; /* 固定宽度 */
  text-align: right; /* 右对齐 */
  margin-right: 16px;
  color: #333;
  font-size: 14px;
  flex-shrink: 0;
}

.form-item,
.el-select,
.el-date-picker {
  width: 500px !important; /* 控件宽度统一 */
}

.contract-query-ui {
  background: rgb(245 248 253);
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
}
.header {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 12px;
}
.header .total {
  font-size: 12px;
  font-weight: normal;
  color: #666;
  margin-left: 10px;
}
.header .count {
  color: #409eff;
}
.query-bar .row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.flex-between {
  justify-content: space-between;
}
.right-group {
  display: flex;
  align-items: center;
}
.form-item {
  margin-bottom: 16px;
}
.label {
  color: #333;
  margin-right: 8px;
  font-size: 13px;
}
.date-picker {
  width: 100px;
  margin-left: 8px;
}
.mt-2 {
  margin-top: 10px;
}
.ml-2 {
  margin-left: 8px;
}
.ml-4 {
  margin-left: 16px;
}
</style>
