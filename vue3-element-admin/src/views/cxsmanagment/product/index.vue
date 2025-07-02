<template>
  <div class="product-page">
    <!-- 左侧树形分类 -->
    <div class="left-tree">
      <el-tree
        :data="categoryTree"
        :props="treeProps"
        node-key="id"
        highlight-current
        @node-click="handleTreeClick"
      />
      <div class="record-count">总记录数：{{ total }} 条</div>
    </div>

    <!-- 右侧内容区 -->
    <div class="right-content">
      <!-- 顶部操作栏 -->
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd">添加产品</el-button>
        <el-input
          v-model="searchKeyword"
          placeholder="产品名称/产品编号"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button @click="handleSearch">搜索</el-button>
        <el-button @click="handleExport">导入导出</el-button>
      </div>

      <!-- 产品表格 -->
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="categoryId" label="产品分类" />
        <el-table-column prop="productImageUrl" label="图片">
          <template #default="scope">
            <el-image :src="scope.row.productImageUrl" style="width: 40px; height: 40px" />
          </template>
        </el-table-column>
        <el-table-column prop="productBrand" label="门幅" />
        <el-table-column prop="productSupplier" label="供应商" />
        <el-table-column prop="productCode" label="产品编号" />
        <el-table-column prop="suggestedPrice" label="建议售价" />
        <el-table-column prop="productRemark" label="备注" />
        <el-table-column prop="productStatus" label="状态">
          <template #default="scope">
            <span :style="{ color: scope.row.productStatus === false ? 'red' : 'blue' }">
              {{ scope.row.productStatus === false ? '下架' : '上架' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-dropdown>
              <span class="el-dropdown-link">···</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleEdit(scope.row)">修改</el-dropdown-item>
                  <el-dropdown-item @click="handleDelete(scope.row.id)">删除</el-dropdown-item>
                  <el-dropdown-item @click="handleUpDown(scope.row)">
                    {{ scope.row.productStatus === false ? '上架' : '下架' }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import ProductApi from "@/api/CxsApi/CxsProductApi";
import { ref, reactive, onMounted } from 'vue';
import { Search, ArrowDown } from "@element-plus/icons-vue";
import MenuAPI from "@/api/system/menu.api";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const tableData = ref([]);
const productPage = reactive({
  PageIndex: 1,
  PageSize: 10,
})
const productForm = reactive({
  "categoryId": "",
  "parentId": "",
  "productImageUrl": "",
  "productBrand": "",
  "productSupplier": "",
  "productCode": "",
  "productDescription": "",
  "suggestedPrice": 0,
  "productRemark": "",
  "productStatus": true,
  "dealPrice": 0
})

const categoryTree = ref([]); // 分类树数据
const treeProps = { children: "children", label: "label" };
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const searchKeyword = ref("");

const GetProductList = async () => {
  const res: any = await ProductApi.getProductList(productPage);
  tableData.value = res || [];
  console.log(res);
}
onMounted(() => {
  GetProductList();
})
const loading = ref(false);
function handleDelete(menuId: string) {
  if (!menuId) {
    ElMessage.warning("请勾选删除项");
    return false;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      MenuAPI.deleteById(menuId)
        .then(() => {
          ElMessage.success("删除成功");
          GetProductList(); // 重新刷新菜单列表
        })
        .finally(() => {
          loading.value = false;
        });
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

// 事件处理函数（可复用原有逻辑）
function handleTreeClick() { /* ... */ }
function handleAdd() { /* ... */ }
function handleEdit(row) { /* ... */ }
function handleUpDown(row) { /* ... */ }
function handleSearch() { /* ... */ }
function handleExport() { /* ... */ }
function handlePageChange() { /* 查询数据 */ }
</script>
<style scoped>
.product-page {
  display: flex;
  height: 100%;
}
.left-tree {
  width: 220px;
  padding: 16px 8px 0 0;
  border-right: 1px solid #eee;
  background: #fff;
}
.record-count {
  margin-top: 12px;
  color: #409EFF;
  font-size: 14px;
}
.right-content {
  flex: 1;
  padding: 16px;
  background: #fff;
}
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}
.search-input {
  width: 220px;
}
</style>
