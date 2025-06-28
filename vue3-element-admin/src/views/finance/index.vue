<template>
  <div>
    <el-card>
      <div style="margin-bottom: 16px">
        <el-button type="primary" @click="handleAdd">添加应收款</el-button>
        <el-input
          v-model="searchForm.receivableCode"
          placeholder="应收款编号(不含符号)"
          style="width: 220px; margin-left: 16px"
          clearable
        />
        <el-button type="primary" style="margin-left: 8px" @click="GetReceivables">查询</el-button>
      </div>
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        empty-text="暂无数据"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="receivableCode" label="应收款编号" />
        <el-table-column prop="receivablePay" label="应收款" />
        <!-- <el-table-column prop="receivablePay" label="已收款" />
        <el-table-column label="剩余应收" :formatter="(row) => row.amount - row.receivablePay" /> -->
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
      <el-pagination
        v-model:current-page="pagination.PageIndex"
        v-model:page-size="pagination.PageSize"
        :total="pagination.totalCount"
        layout="total, prev, pager, next, sizes"
        style="margin-top: 16px; text-align: right"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import ReceivablesViewAPI, {
  ReceivablesPageQuery,
  ReceivableSearch,
} from "@/api/Finance/receivables.api";
import { ElMessage, ElMessageBox } from "element-plus";

const loading = ref(false);
const tableData = ref<ReceivableSearch[]>([]);
const pagination = reactive({
  PageIndex: 1,
  PageSize: 10,
  totalCount: 0,
  pageCount: 0,
});

const searchForm = reactive({
  receivableCode: "",
});
watch(pagination, () => {
  GetReceivables();
})

const GetReceivables = () => {
  loading.value = true;
  const params: ReceivablesPageQuery = {
    PageIndex: pagination.PageIndex,
    PageSize: pagination.PageSize,
    //receivableCode: searchForm.receivableCode,
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

function handleAdd() {
  // 这里可以弹出添加表单Dialog，或跳转到添加页面
  ElMessage.info("请实现添加应收款功能");
}

function handleDelete(id: string) {
  ElMessageBox.confirm("确定要删除该应收款吗？", "提示", {
    type: "warning",
  }).then(() => {
    ReceivablesViewAPI.DeleteReceivable(id).then(() => {
      ElMessage.success("删除成功");
      GetReceivables();
    });
  });
}

onMounted(() => {
  GetReceivables();
});
</script>

<style scoped></style>
