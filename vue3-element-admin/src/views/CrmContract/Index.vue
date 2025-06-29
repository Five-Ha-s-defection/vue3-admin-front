@ -1,7 +1,211 @@
<template>
  <div></div>
  <div class="contract-query-ui">
    <el-card>
      <div class="header">
        <span class="title">合同列表</span>
        <span class="total">
          | 总记录数：
          <span class="count"></span>
          条
        </span>
      </div>
      <div class="query-bar">
        <div class="row mt-2">
          <span class="label">选择时间</span>
          <el-date-picker
            v-model="searchForm.BeginTime"
            type="datetime"
            size="small"
            placeholder="开始时间"
            style="width: 200px"
          />
          --
          <el-date-picker
            v-model="searchForm.EndTime"
            type="datetime"
            size="small"
            placeholder="结束时间"
            style="width: 200px"
          />
          <el-radio-group v-model="searchForm.CheckType" class="ml-4" size="small">
            <el-radio label="创建时间" :value="0">创建时间</el-radio>
            <el-radio label="签订日期" :value="1">签订日期</el-radio>
            <el-radio label="生效日期" :value="2">生效日期</el-radio>
            <el-radio label="截止日期" :value="3">截止日期</el-radio>
          </el-radio-group>
        </div>
        <div class="row mt-2 flex-between">
          <el-button type="primary" icon="Plus" size="small">添加合同</el-button>
          <div class="right-group">
            <el-input
              v-model="searchForm.ContractName"
              placeholder="合同名称"
              class="ml-4"
              style="width: 220px"
              clearable
              size="small"
            >
              <template #suffix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button class="ml-2" icon="Filter" plain size="small">高级搜索</el-button>
            <el-dropdown class="ml-2">
              <el-button size="small">
                操作
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>删除合同</el-dropdown-item>
                  <el-dropdown-item>导出数据</el-dropdown-item>
                  <el-dropdown-item>导入excel</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </el-card>

    <el-card style="margin-top: 10px">
      <el-table :data="tableData" border style="width: 100%" size="small">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <span
              :style="{
                color:
                  row.status === '待审核'
                    ? '#faad14'
                    : row.status === '已审核'
                      ? '#13c2c2'
                      : row.status === '已驳回'
                        ? '#f5222d'
                        : '#333',
                fontWeight: row.status === '已驳回' ? 'bold' : 'normal',
              }"
            >
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="合同金额" align="center" />
        <el-table-column prop="received" label="已收款" align="center" />
        <el-table-column prop="remaining" label="剩余应收" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.remaining > 0 ? '#f5222d' : '#333' }">
              {{ row.remaining.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="收款进度" align="center" />
        <el-table-column prop="signDate" label="签订日期" align="center" />
        <el-table-column prop="name" label="合同名称" align="center">
          <template #default="{ row }">
            <el-link type="primary" :underline="false">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="截止日期" align="center" />
        <el-table-column prop="dealer" label="经销商" align="center" />
        <el-table-column prop="customer" label="所属客户" align="center">
          <template #default="{ row }">
            <el-link type="primary" :underline="false">{{ row.customer }}</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts"></script>
<script setup lang="ts">
import { reactive, onMounted } from "vue";
import { Search, ArrowDown } from "@element-plus/icons-vue";
import CrmContractAPI from "@/api/crmcontract";

const pageForm = reactive({
  PageIndex: 1,
  PageSize: 10,
});

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
});

const tableData = ref();

//显示查询分页
const getTableData = async () => {
  const res = await CrmContractAPI.getInfo(pageForm);
  tableData.value = res;
  console.log(res);
};

onMounted(() => {
  getTableData();
});
</script>

<style scoped></style>
<style scoped>
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
