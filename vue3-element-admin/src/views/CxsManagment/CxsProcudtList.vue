<template>
  <div class="product-page">
    <h1>产品列表演示</h1>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="categoryId" label="Date" align="center" />
      <el-table-column prop="parentId" label="Date" align="center" />
      <el-table-column prop="productImageUrl" label="Date" align="center" />
      <el-table-column prop="productBrand" label="Date" align="center" />
      <el-table-column prop="productSupplier" label="Date" align="center" />
      <el-table-column prop="productCode" label="Date" align="center" />
      <el-table-column prop="productDescription" label="Date" align="center" />
      <el-table-column prop="suggestedPrice" label="Date" align="center" />
      <el-table-column prop="productStatus" label="Date" align="center" />
      <el-table-column prop="dealPrice" label="Date" align="center" />
      <el-table-column label="操作" align="center">
        <template #default="scoped">
          <el-button type="primary" @click="handleEdit(scoped.row)">编辑</el-button>
          <el-button type="danger" @click="handleDelete(scoped.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
import ProductApi from "@/api/CxsApi/CxsProductApi";
import { ref } from 'vue';
import { useRouter } from 'vue-router';
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

const GetProductList = async () => {
  const res: any = await ProductApi.getProductList(productForm);
  tableData.value = res || [];
  console.log(res);
}
onMounted(() => {
  GetProductList();
})
const handleEdit = (row: any) => {
  router.push({ path: '/cxs/product/edit', query: { id: row.id } });
};
const handleDelete = (id: number) => {
  ElMessageBox.confirm('确认删除？')
};
</script>
<style scoped></style>
