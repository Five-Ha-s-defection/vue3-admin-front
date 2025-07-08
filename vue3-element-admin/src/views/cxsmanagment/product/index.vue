<template>
  <div class="product-page">
    <!-- 左侧树形目录 -->
    <div class="left-tree">
      <el-tree
        :data="treeData"
        :props="defaultProps"
        node-key="id"
        default-expand-all
        highlight-current
        style="background: #f8f8f8"
        @node-click="handleNodeClick"
      />

      <div class="record-count">总记录数：{{ productPage.totalCount }} 条</div>
    </div>
    <!-- 右侧内容 -->
    <div class="right-content">
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button type="primary" @click="goToAddProduct()">添加产品</el-button>
        <el-input
          class="search-input"
          placeholder="产品名称/产品编号"
          v-model="searchValue"
          clearable
        />
        <el-button>高级搜索</el-button>
        <el-dropdown>
          <el-button>
            导入导出
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <!-- <el-dropdown-item @click="handleImport">导入</el-dropdown-item> -->
              <el-dropdown-item @click="handleExportCategory">导出全部产品</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <!-- 产品表格 -->
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="categoryName" label="产品分类" />
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
              {{ scope.row.productStatus === false ? "下架" : "上架" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-dropdown>
              <span class="el-dropdown-link">···</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToUpdateProduct(row.id)">修改</el-dropdown-item>
                  <el-dropdown-item @click="productDelete(row)">删除</el-dropdown-item>
                  <el-dropdown-item @click="toggleStatus(row)">
                    {{ row.productStatus === false ? "上架" : "下架" }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页控件 -->
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="productPage.totalCount"
        :page-size="productPage.pageSize"
        :current-page="productPage.pageIndex"
        :page-sizes="[3, 5, 10, 20, 50]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        style="margin-top: 16px; justify-content: center"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import ProductApi from "@/api/CxsApi/CxsProductApi";

import { number } from "echarts";
import { rowContextKey } from "element-plus";
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const tableData = ref([]);
const productPage = reactive({
  totalCount: 0,
  pageCount: 0,
  pageIndex: 1,
  pageSize: 10,
  categoryId: undefined,
});

interface ProductData {
  id: string;
  categoryId: string;
  parentId: string;
  productImageUrl: string;
  productBrand: string;
  productSupplier: string;
  productCode: string;
  productDescription: string;
  suggestedPrice: 0;
  productRemark: string;
  productStatus: null;
  dealPrice: 0;
}

const searchValue = ref("");

const GetProductList = async () => {
  const res: any = await ProductApi.getProductList(productPage);
  if (res) {
    tableData.value = res.data || [];
    productPage.totalCount = res.totalCount ?? 0; // 关键：赋值
    productPage.pageCount = res.pageCount ?? 0;
  } else {
    tableData.value = [];
    productPage.totalCount = 0;
    productPage.pageCount = 0;
  }
};

const handlePageChange = (page: number) => {
  productPage.pageIndex = page;
  GetProductList();
};

const handleSizeChange = (size: number) => {
  productPage.pageSize = size;
  productPage.pageIndex = 1;
  GetProductList();
};

onMounted(() => {
  Gettree();
  GetProductList();
});

const productDelete = async (row: ProductData) => {
  ElMessageBox.confirm("确定要删除这条数据吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const res: any = await ProductApi.deleteProduct(row);
      if (res) {
        ElMessage.success("删除成功");
        GetProductList();
      }
    })
    .catch(() => {
      // 用户取消
    });
};

//导出全部产品
const handleExportCategory = async () => {
  try {
    const res = await ProductApi.exportAllProductCategoryTo();
    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cong先生的产品.xlsx"; // 可自定义文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (e) {
    ElMessage.error("导出失败");
  }
};
//修改产品状态
const toggleStatus = async (row: any) => {
  try {
    const newState = !row.productStatus;
    await ProductApi.updProductState(row.id, newState);
    ElMessage.success(`产品已${newState ? "上架" : "下架"}`);
    GetProductList();
  } catch (e) {
    ElMessage.error("状态修改失败");
  }
};

const goToAddProduct = () => {
  router.push("/cxsmanagment/addproduct");
};

const defaultProps = {
  children: "children",
  label: "categoryName",
};
const treeData = ref<any[]>([]);
const Gettree = async () => {
  const res: any = await ProductApi.listtree();
  let tree = res;
  // 如果接口返回的是 res.data.data，则用 let tree = res.data.data;
  treeData.value = [
    {
      id: undefined,
      categoryName: "全部产品",
      children: tree,
    },
  ];
};

function handleNodeClick(node: any) {
  productPage.categoryId = node.id;
  productPage.pageIndex = 1;
  GetProductList();
}

function showAllProducts() {
  productPage.categoryId = undefined;
  productPage.pageIndex = 1;
  GetProductList();
}

const goToUpdateProduct = (id: any) => {
  router.push(`/cxsmanagment/updateproduct?id=${id}`);
  console.log(id);
};
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
  color: #409eff;
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
.el-dropdown-link {
  font-size: 22px;
  color: #333;
  cursor: pointer;
  user-select: none;
  padding: 0 8px;
  transition: color 0.2s;
}
.el-dropdown-link:hover {
  color: #409eff;
}

.el-dropdown-menu {
  min-width: 80px;
  text-align: center;
}

.el-dropdown-menu__item {
  font-size: 15px;
  padding: 8px 0;
}
</style>
