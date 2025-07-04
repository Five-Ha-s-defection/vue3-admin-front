<template>
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
              {{ scope.row.productStatus === false ? '下架' : '上架' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
  <template #default="{row}">
    <el-dropdown>
      <span class="el-dropdown-link">···</span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="">修改</el-dropdown-item>
          <el-dropdown-item @click="productDelete(row)">删除</el-dropdown-item>
         
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </template>
</el-table-column>
      </el-table>

  
 
</template>
<script setup lang="ts">
import ProductApi from "@/api/CxsApi/CxsProductApi";
import { number } from "echarts";
import { rowContextKey } from "element-plus";
import { ref, reactive, onMounted } from 'vue';

const router = useRouter();
const tableData = ref([]);
const productPage = reactive({
  totalCount:0,
  pageCount:0,
  pageIndex:1,
  pageSize:10,
  
})
const page=reactive({
  pageIndex:1,
  pageSize:10
})
interface ProductData{
  id:string,
  categoryId: string,
  parentId: string,
  productImageUrl: string,
  productBrand:string,
  productSupplier: string,
  productCode: string,
  productDescription: string,
  suggestedPrice: 0,
  productRemark: string,
  productStatus: null,
  dealPrice: 0
}
  



const GetProductList = async () => {
  console.log("请求数据", productPage);  // 打印请求数据，查看分页是否传递正确
  const res: any = await ProductApi.getProductList(productPage);
  console.log("接口返回数据", res);
  if (res) {
    tableData.value = res.data || [];
    productPage.totalCount = res.data.totalCount;
    productPage.pageCount = res.data.pageCount;
  } else {
    console.log("没有数据返回");
  }
}
onMounted(() => {
  GetProductList();
})

const productDelete = async (row:ProductData ) => {
  ElMessageBox.confirm('确定要删除这条数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const res: any = await ProductApi.deleteProduct(row);
    if (res) {
      ElMessage.success('删除成功');
      GetProductList();
    }
  }).catch(() => {
    // 用户取消
  });
}
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
