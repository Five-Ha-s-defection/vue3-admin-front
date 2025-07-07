<template>
  <div class="add-product-page">
    <div class="submit-btn-wrapper">
      <el-button type="primary" @click="submitForm">提交</el-button>
    </div>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      style="max-width: 900px; margin: 30px auto"
    >
      <h2>添加产品</h2>
      <el-form-item label="产品分类" prop="categoryId">
        <el-select v-model="form.categoryId" placeholder="选择分类">
          <el-option label="分类A" :value="'00000000-0000-0000-0000-000000000001'" />
          <el-option label="分类B" :value="'00000000-0000-0000-0000-000000000002'" />
        </el-select>
      </el-form-item>

      <el-form-item label="产品图片" prop="productImageUrl">
        <el-upload
          class="avatar-uploader"
          action="https://localhost:44341/api/app/common/upload-file"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="form.productImageUrl" :src="form.productImageUrl" class="avatar" />
          <el-icon v-else><upload /></el-icon>
          <div>上传图片</div>
        </el-upload>
      </el-form-item>

      <el-form-item label="门幅" prop="productBrand" required>
        <el-input v-model="form.productBrand" placeholder="请输入门幅" />
      </el-form-item>

      <el-form-item label="供应商" prop="productSupplier" required>
        <el-input v-model="form.productSupplier" placeholder="请输入供应商" />
      </el-form-item>

      <el-form-item label="产品编号" prop="productCode">
        <el-input v-model="form.productCode" placeholder="请输入产品编号" />
      </el-form-item>

      <el-form-item label="产品描述" prop="productDescription">
        <el-input v-model="form.productDescription" placeholder="请输入产品描述" />
      </el-form-item>

      <el-form-item label="建议售价" prop="suggestedPrice">
        <el-input v-model.number="form.suggestedPrice" placeholder="请输入建议售价" type="number" />
      </el-form-item>

      <el-form-item label="备注" prop="productRemark">
        <el-input type="textarea" v-model="form.productRemark" placeholder="请输入备注" :rows="4" />
      </el-form-item>

      <el-form-item label="上架未上架" prop="productStatus">
        <el-switch v-model="form.productStatus" active-text="上架" inactive-text="下架" />
      </el-form-item>

      <el-form-item label="成交价" prop="dealPrice">
        <el-input v-model.number="form.dealPrice" placeholder="请输入成交价" type="number" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { Upload } from "@element-plus/icons-vue";
import ProductApi from "@/api/CxsApi/CxsProductApi";

const formRef = ref();
const form = reactive({
  categoryId: "",
  parentId: "", // 可选，暂时不展示在表单
  productImageUrl: "",
  productBrand: "",
  productSupplier: "",
  productCode: "",
  productDescription: "",
  suggestedPrice: 0,
  productRemark: "",
  productStatus: false,
  dealPrice: 0,
});

const rules = {
  categoryId: [{ required: true, message: "请选择产品分类", trigger: "change" }],
  productBrand: [{ required: true, message: "请输入门幅", trigger: "blur" }],
  productSupplier: [{ required: true, message: "请输入供应商", trigger: "blur" }],
};

function handleAvatarSuccess(response, file) {
  // 假设后端返回图片URL在response.data.url
  if (response && response.data && response.data.url) {
    form.productImageUrl = response.data.url;
  } else {
    // 兼容本地预览
    form.productImageUrl = URL.createObjectURL(file.raw);
  }
}
function beforeAvatarUpload(file) {
  const isJPG = file.type === "image/jpeg" || file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isJPG) {
    ElMessage.error("上传图片只能是 JPG/PNG 格式!");
  }
  if (!isLt2M) {
    ElMessage.error("上传图片大小不能超过 2MB!");
  }
  return isJPG && isLt2M;
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (valid) {
      const submitData = {
        categoryId: form.categoryId,
        parentId: form.parentId,
        productImageUrl: form.productImageUrl,
        productBrand: form.productBrand,
        productSupplier: form.productSupplier,
        productCode: form.productCode,
        productDescription: form.productDescription,
        suggestedPrice: form.suggestedPrice,
        productRemark: form.productRemark,
        productStatus: form.productStatus,
        dealPrice: form.dealPrice,
      };
      try {
        await ProductApi.addProduct(submitData);
        ElMessage.success("提交成功！");
        // 可选：跳转回产品列表页
        // router.push('/cxsmanagment/product');
      } catch (e) {
        ElMessage.error("提交失败，请重试");
      }
    } else {
      ElMessage.error("请完善表单信息");
      return false;
    }
  });
}
</script>

<style scoped>
.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 178px;
  height: 178px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  margin-bottom: 10px;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.add-product-page {
  position: relative;
  min-height: 100vh;
  background: #f7f9fb;
}
.submit-btn-wrapper {
  position: absolute;
  top: 24px;
  right: 40px;
  z-index: 10;
}
</style>
