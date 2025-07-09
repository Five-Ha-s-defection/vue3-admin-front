<template>
  <div>
    <el-card>
      <!-- 顶部统计与操作栏 -->
      <div style="margin-bottom: 16px">
        <div style="display: flex; align-items: center; margin-bottom: 8px">
          <span style="font-weight: bold; font-size: 16px">联系记录 |</span>
          <span style="margin-left: 16px; color: #888">总记录数：</span>
          <span style="color: #409eff; margin-left: 2px">{{ pagination.totalCount }}</span>
          <span style="color: #888; margin-left: 2px">条</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 8px">
          <span style="color: #888">查看范围</span>
          <el-radio-group v-model="scopeType" size="small" style="margin-left: 12px">
            <el-radio-button label="myDuty">我负责的</el-radio-button>
            <el-radio-button label="myCreate">我创建的</el-radio-button>
            <el-radio-button label="all">全部</el-radio-button>
          </el-radio-group>
          <span style="margin-left: 32px; color: #888">联系人</span>
          <el-select
            v-model="searchForm.contactPerson"
            placeholder="全部"
            size="small"
            style="width: 120px; margin-left: 12px"
          >
            <el-option label="全部" value="" />
            <el-option v-for="item in contactPersonList" :key="item" :label="item" :value="item" />
          </el-select>
          <span style="margin-left: 32px; color: #888">排序方式</span>
          <el-select
            v-model="searchForm.sortType"
            placeholder="按联系时间排序"
            size="small"
            style="width: 150px; margin-left: 12px"
          >
            <el-option label="按联系时间排序" value="time" />
            <el-option label="按创建时间排序" value="create" />
          </el-select>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 8px">
          <el-button type="primary" style="margin-right: 16px" @click="addRecord">
            添加记录
          </el-button>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD"
            style="width: 260px; margin-right: 12px"
            @change="handleDateRangeChange"
          />
          <el-input
            v-model="searchForm.keyword"
            placeholder="联系内容"
            style="width: 200px; margin-left: 16px"
            clearable
          />
          <el-button type="primary" style="margin-left: 8px; margin-right: 10px" @click="search">
            高级搜索
          </el-button>
          <el-button style="margin-left: 8px" @click="exportData">导出数据</el-button>
        </div>
      </div>
      <!-- 表格 -->
      <el-table :data="tableData" border style="width: 100%" empty-text="暂无数据">
        <el-table-column prop="content" label="联系内容" min-width="180" />
        <el-table-column prop="comment" label="评论" min-width="80" />
        <el-table-column prop="contactTime" label="联系时间" min-width="120" />
        <el-table-column prop="creator" label="创建人" min-width="100" />
        <el-table-column prop="type" label="沟通类型" min-width="100" />
        <el-table-column prop="object" label="联系对象" min-width="100" />
        <el-table-column prop="belongObject" label="所属对象" min-width="120" />
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-dropdown>
              <el-icon style="cursor: pointer"><el-icon-more /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="editRecord(scope.row)">编辑</el-dropdown-item>
                  <el-dropdown-item @click="deleteRecord(scope.row)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div style="margin-top: 16px; display: flex; justify-content: center">
        <el-pagination
          v-model:current-page="pagination.pageIndex"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.totalCount"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// mock 数据
const tableData = ref([
  {
    content: "1111",
    comment: "",
    contactTime: "2025-07-08 21:49",
    creator: "crmtest",
    type: "--",
    object: "客户",
    belongObject: "构杞2145",
  },
  {
    content: "“计划制定的”",
    comment: "",
    contactTime: "2025-07-07 15:05",
    creator: "crmtest",
    type: "线下见面",
    object: "线索",
    belongObject: "图呗呗你",
  },
  {
    content: "防守打法",
    comment: "",
    contactTime: "2025-07-06 21:15",
    creator: "crmtest",
    type: "线下见面",
    object: "线索",
    belongObject: "1",
  },
  {
    content: "更好的",
    comment: "",
    contactTime: "2025-07-06 21:15",
    creator: "crmtest",
    type: "--",
    object: "线索",
    belongObject: "1",
  },
  {
    content: "客户比较满意产品",
    comment: "",
    contactTime: "2025-07-05 17:10",
    creator: "crmtest",
    type: "商机",
    object: "商机",
    belongObject: "飞飞飞",
  },
  {
    content: "11111",
    comment: "",
    contactTime: "2025-07-05 15:25",
    creator: "crmtest",
    type: "线下见面",
    object: "客户",
    belongObject: "松松科技",
  },
]);

const pagination = reactive({
  pageIndex: 1,
  pageSize: 10,
  totalCount: 190,
});

const scopeType = ref("all");
const contactPersonList = ref(["crmtest", "Ethan", "mys"]);
const dateRange = ref([]);
const searchForm = reactive({
  contactPerson: "",
  sortType: "time",
  keyword: "",
});

function handleSizeChange(val: number) {
  pagination.pageSize = val;
  pagination.pageIndex = 1;
}
function handleCurrentChange(val: number) {
  pagination.pageIndex = val;
}
function handleDateRangeChange(val: any) {
  // 这里可以处理时间筛选逻辑
}
function addRecord() {
  ElMessage.info("添加记录功能待实现");
}
function editRecord(row: any) {
  ElMessage.info("编辑功能待实现");
}
function deleteRecord(row: any) {
  ElMessageBox.confirm("确定要删除该记录吗？", "提示", { type: "warning" }).then(() => {
    ElMessage.success("删除成功（mock）");
  });
}
function search() {
  ElMessage.info("高级搜索功能待实现");
}
function exportData() {
  ElMessage.info("导出功能待实现");
}
</script>
