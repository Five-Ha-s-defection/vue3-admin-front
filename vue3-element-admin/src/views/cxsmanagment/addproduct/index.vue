<template>
  <div class="add-product-page">
    <div class="header">
      <span>添加产品</span>
      <el-button type="primary" @click="submitForm" style="float:right;">提交</el-button>
    </div>
    <el-form :model="form" label-width="120px" class="form-content">
      <el-form-item label="产品分类">
        <el-select v-model="form.categoryId" placeholder="选择分类">
          <el-option v-for="item in categoryOptions" :key="item.id" :label="item.categoryName" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="产品图片">
        <el-upload
          class="upload-demo"
          action="你的上传接口"
          :on-success="handleUploadSuccess"
          :show-file-list="false"
        >
          <el-icon><UploadFilled /></el-icon>
          <div>上传图片</div>
        </el-upload>
      </el-form-item>
      <el-form-item label="门幅" required>
        <el-input v-model="form.productBrand" />
      </el-form-item>
      <el-form-item label="供应商" required>
        <el-input v-model="form.productSupplier" />
      </el-form-item>
      <el-form-item label="产品编号" required>
        <el-input v-model="form.productCode" />
      </el-form-item>
      <el-form-item label="产品描述">
        <el-input v-model="form.productDescription" />
      </el-form-item>
      <el-form-item label="建议售价">
        <el-input v-model="form.suggestedPrice" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input type="textarea" v-model="form.productRemark" />
      </el-form-item>
      <!-- 其他表单项... -->
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';

const form = ref({
  categoryId: '',
  productImageUrl: '',
  productBrand: '',
  productSupplier: '',
  productCode: '',
  productDescription: '',
  suggestedPrice: '',
  productRemark: ''
  // 其他字段...
});

const categoryOptions = ref([
  // 这里填充你的分类数据
  {
    id: 0,
    categoryName: ""
  }
]);

function handleUploadSuccess(response: any) {
  form.value.productImageUrl = response.url; // 根据实际返回字段
}
function submitForm() {
  // 提交逻辑
}
</script>

<style scoped>
.add-product-page {
  background: #fff;
  padding: 24px;
  min-height: 100vh;
}
.header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.form-content {
  max-width: 1000px;
}
</style>