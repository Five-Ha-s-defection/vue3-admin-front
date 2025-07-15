<template>
  <div class="contact-record-page">
    <!-- 标题和统计 -->
    <div class="header-bar">
      <span class="main-title">联系记录</span>
      <span class="total-count">| 总记录数：{{ pagination.totalCount }} 条</span>
    </div>

    <!-- 新版筛选栏 -->
    <div class="filter-bar-v2">
      <div class="filter-row">
        <span class="filter-label">查看范围</span>
        <el-radio-group v-model="searchForm.range" size="small">
          <el-radio-button label="我的" />
          <el-radio-button label="部门" />
          <el-radio-button label="全部" />
        </el-radio-group>
      </div>
      <div class="filter-row">
        <span class="filter-label">联系对象</span>
        <el-radio-group v-model="searchForm.target" size="small">
          <el-radio-button label="全部" />
          <el-radio-button label="客户" />
          <el-radio-button label="客户池" />
          <el-radio-button label="商机" />
          <el-radio-button label="线索" />
          <el-radio-button label="线索池" />
        </el-radio-group>
      </div>
      <div class="filter-row">
        <span class="filter-label">排序方式</span>
        <el-radio-group v-model="searchForm.order" size="small">
          <el-radio-button label="按创建时间排序" />
          <el-radio-button label="按下次联系时间排序" />
        </el-radio-group>
        <el-icon style="margin-left: 4px; color: #999"><el-icon-arrow-down /></el-icon>
      </div>
      <div class="filter-row filter-row-bottom">
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          size="small"
          style="width: 240px"
        />
        <el-input
          v-model="searchForm.keyword"
          placeholder="联系内容"
          size="small"
          style="width: 180px; margin-left: 12px"
        />
        <el-button type="primary" size="small" @click="onSearch" style="margin-left: 12px">
          高级搜索
        </el-button>
        <el-button size="small" @click="exportDialogVisible = true" style="margin-left: 8px">
          导出数据
        </el-button>
        <el-button type="primary" size="small" @click="onAdd" style="margin-left: 8px">
          + 添加记录
        </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table :data="contactList" stripe style="width: 100%; margin-top: 8px">
      <el-table-column prop="content" label="联系内容" />
      <el-table-column prop="comments" label="评论" />
      <el-table-column prop="nextContactTime" label="联系时间" />
      <el-table-column prop="customerName" label="创建人" />
      <el-table-column prop="communicationTypeName" label="沟通类型" />
      <el-table-column label="联系对象">
        <template #default="scope">
          <span :style="getTypeStyle(scope.row)">
            {{ objectTypeFormatter(scope.row) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="belongObjectName" label="所属对象" />
      <el-table-column label="操作" width="80">
        <template #default="scope">
          <el-dropdown>
            <span
              class="el-dropdown-link"
              style="cursor: pointer; font-size: 20px; user-select: none"
            >
              ···
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="onEdit(scope.row)">修改</el-dropdown-item>
                <el-dropdown-item @click="onComment(scope.row)">评论</el-dropdown-item>
                <el-dropdown-item divided @click="onDelete(scope.row)">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.totalCount"
      :page-size="pagination.pageSize"
      :current-page="pagination.pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      @current-change="onPageChange"
      @size-change="onPageSizeChange"
      style="margin-top: 16px"
    />
  </div>

  <el-dialog
    v-model="exportDialogVisible"
    title="请选择需要导出的数据？"
    width="900px"
    :close-on-click-modal="false"
  >
    <div class="export-fields">
      <el-button
        v-for="field in exportFields"
        :key="field.value"
        :type="selectedFields.includes(field.value) ? 'primary' : 'default'"
        @click="toggleField(field.value)"
        class="export-field-btn"
        plain
      >
        {{ field.label }}
      </el-button>
    </div>
    <div class="export-options">
      <el-button
        :type="exportRange === 'page' ? 'primary' : 'default'"
        @click="exportRange = 'page'"
        plain
      >
        导出本页
      </el-button>
      <el-button
        :type="exportRange === 'all' ? 'primary' : 'default'"
        @click="exportRange = 'all'"
        plain
        style="margin-left: 8px"
      >
        导出全部
      </el-button>
      <el-button
        :type="exportRange === 'part' ? 'primary' : 'default'"
        @click="exportRange = 'part'"
        plain
        style="margin-left: 8px"
      >
        分页导出
      </el-button>
      <el-input-number
        v-model="exportPageStart"
        :min="1"
        :max="exportPageEnd"
        size="small"
        style="width: 80px; margin: 0 4px"
        :disabled="exportRange !== 'part'"
      />
      <span>页 --</span>
      <el-input-number
        v-model="exportPageEnd"
        :min="exportPageStart"
        size="small"
        style="width: 80px; margin: 0 4px"
        :disabled="exportRange !== 'part'"
      />
    </div>
    <div style="color: orange; margin-top: 8px">* 导出10页以上，请选择分页导出，分批次导出！</div>
    <div style="text-align: center; margin-top: 24px">
      <el-button type="primary" @click="handleExport" size="large">开始导出</el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import {
  ListContactCommunication,
  DeleteContactCommunication,
  ExportAllCommunicationToAsync,
} from "@/api/CustomerProcess/ContactCommunication/contactcommunication.api";

import dayjs from "dayjs";
import { ElMessageBox, ElMessage } from "element-plus";

const contactList = ref<any[]>([]);
const pagination = reactive({
  pageIndex: 1,
  pageSize: 10,
  totalCount: 0,
  pageCount: 0,
});

const searchForm = reactive({
  range: "全部",
  target: "全部",
  order: "按创建时间排序",
  dateRange: [],
  keyword: "",
});

const exportDialogVisible = ref(false);

const exportFields = [
  { label: "联系内容", value: "content" },
  { label: "评论", value: "comments" },
  { label: "联系时间", value: "nextContactTime" },
  { label: "联系人", value: "contactPerson" },
  { label: "客户联系人", value: "customerContact" },
  { label: "沟通类型", value: "communicationTypeName" },
  { label: "联系对象", value: "objectName" },
  { label: "所属对象", value: "belongObjectName" },
  // ...可继续补充
];

const selectedFields = ref(exportFields.map((f) => f.value)); // 默认全选

function toggleField(field: string) {
  const idx = selectedFields.value.indexOf(field);
  if (idx > -1) {
    selectedFields.value.splice(idx, 1);
  } else {
    selectedFields.value.push(field);
  }
}

const exportRange = ref<"page" | "all" | "part">("page");
const exportPageStart = ref(1);
const exportPageEnd = ref(1);

// 导出操作
function handleExport() {
  if (exportRange.value === "page") {
    handleExportPage();
  } else if (exportRange.value === "all") {
    handleExportAll();
  } else if (exportRange.value === "part") {
    handleExportPart();
  }
  exportDialogVisible.value = false;
}

// 导出本页
async function handleExportPage() {
  try {
    // 你当前的接口不需要参数
    const res = await ExportAllCommunicationToAsync();
    downloadBlob(res.data, "联系记录_本页导出.xlsx");
  } catch (e) {
    ElMessage.error("导出本页失败");
  }
}

// 导出全部
async function handleExportAll() {
  try {
    const res = await ExportAllCommunicationToAsync();
    downloadBlob(res.data, "联系记录_全部导出.xlsx");
  } catch (e) {
    ElMessage.error("导出全部失败");
  }
}

// 分页导出
async function handleExportPart() {
  try {
    if (exportPageStart.value > exportPageEnd.value) {
      ElMessage.error("起始页不能大于结束页");
      return;
    }
    for (let i = exportPageStart.value; i <= exportPageEnd.value; i++) {
      // 你当前接口不需要参数，直接调用
      const res = await ExportAllCommunicationToAsync();
      downloadBlob(res.data, `联系记录_第${i}页导出.xlsx`);
    }
  } catch (e) {
    ElMessage.error("分页导出失败");
  }
}

// 下载工具函数
function downloadBlob(data: any, filename: string) {
  const blob = new Blob([data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

const fetchContactList = async () => {
  // 这里可以根据searchForm组装params
  const params = {
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    // 其它筛选条件可加
  };
  try {
    const res: any = await ListContactCommunication(params);
    const list = res.data || [];
    pagination.totalCount = res?.totalCount || 0;
    pagination.pageCount = res?.pageCount || 0;
    console.log(res.data);
    contactList.value = list.map((item: any) => ({
      id: item.id, // 确保有id
      content: item.content || "",
      comments: item.comments || "",
      nextContactTime: item.nextContactTime
        ? dayjs(item.nextContactTime).format("YYYY-MM-DD HH:mm")
        : "",
      customerName: item.customerName || "",
      communicationTypeName: item.communicationTypeName || "",
      clueId: item.clueId,
      customerId: item.customerId,
      businessOpportunityId: item.businessOpportunityId,
      objectName: item.objectName || "",
      belongObjectName: item.belongObjectName || "",
    }));
  } catch (e) {
    contactList.value = [];
    pagination.totalCount = 0;
  }
};

function objectTypeFormatter(row: any) {
  if (row.clueId) {
    return "线索";
  } else if (row.customerId) {
    return "客户";
  } else if (row.businessOpportunityId) {
    return "商机";
  } else {
    return "未知";
  }
}

function getTypeStyle(row: any) {
  if (row.clueId) {
    return "color: orange; font-weight: bold;";
  } else if (row.customerId) {
    return "color: #1ccfcf; font-weight: bold;";
  } else if (row.businessOpportunityId) {
    return "color: #1c7fcf; font-weight: bold;";
  } else {
    return "color: #999;";
  }
}

function onSearch() {
  pagination.pageIndex = 1;
  fetchContactList();
}
function onExport() {
  // 导出逻辑
}
function onAdd() {
  // 新增逻辑
}
function onPageChange(page: number) {
  pagination.pageIndex = page;
  fetchContactList();
}

function onPageSizeChange(size: number) {
  pagination.pageSize = size;
  pagination.pageIndex = 1;
  fetchContactList();
}

function onEdit(row: any) {
  // 修改逻辑
}
function onComment(row: any) {
  // 评论逻辑
}
function onDelete(row: any) {
  ElMessageBox.confirm("确定要删除该联系记录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await DeleteContactCommunication(row.id);
      ElMessage.success("删除成功");
      fetchContactList(); // 删除后刷新列表
    })
    .catch(() => {
      // 用户取消，无需处理
    });
}

onMounted(() => {
  fetchContactList();
});
</script>

<style scoped>
.contact-record-page {
  background: #f5f7fa;
  min-height: 100vh;
  padding: 24px;
}
.header-bar {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}
.header-bar .total-count {
  font-size: 14px;
  color: #1ccfcf;
  margin-left: 8px;
}
.filter-bar-v2 {
  background: #fff;
  border-radius: 6px;
  padding: 12px 24px 0 24px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px #f0f1f2;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  flex-wrap: wrap;
  gap: 8px;
}
.filter-label {
  color: #888;
  font-size: 14px;
  margin-right: 8px;
  min-width: 64px;
  text-align: right;
  display: inline-block;
}
.filter-row-bottom {
  margin-top: 8px;
  justify-content: flex-end;
}
.el-radio-group {
  margin-right: 16px;
}
.el-radio-button__inner {
  border-radius: 16px !important;
  padding: 0 16px;
}
.el-button {
  border-radius: 16px;
}
.filter-bar {
  background: #fff;
  border-radius: 6px 6px 0 0;
  padding: 18px 24px 0 24px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: 0 2px 8px #f0f1f2;
}
.filter-bar .el-button {
  background: #1ccfcf;
  color: #fff;
  border: none;
  font-weight: 500;
  margin-left: 8px;
}
.filter-bar .el-input,
.filter-bar .el-select {
  min-width: 160px;
  margin-right: 8px;
}
.el-table {
  background: #fff;
  border-radius: 0 0 6px 6px;
  font-size: 14px;
  color: #333;
  box-shadow: 0 2px 8px #f0f1f2;
}
.el-table th {
  background: #f8fafd;
  color: #666;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
}
.el-table td,
.el-table th {
  height: 44px;
  border-bottom: 1px solid #f0f0f0;
}
.el-table .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-pagination {
  margin: 24px 0 0 0;
  background: #fff;
  padding: 16px 0;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 8px #f0f1f2;
  text-align: right;
}
.el-table .el-table__cell:last-child {
  text-align: center;
}
.el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #f8fafd;
}

.export-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}
.export-field-btn {
  min-width: 120px;
  margin-bottom: 8px;
}
.export-options {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.export-tip {
  margin-top: 8px;
  font-size: 13px;
}
</style>
