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
      <h2>修改产品</h2>
      <el-form-item label="产品分类" prop="categoryId" required>
        <el-select v-model="form.categoryId" placeholder="选择分类">
          <el-option
            v-for="item in categoryList"
            :key="item.id"
            :label="item.categoryName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="产品图片" prop="productImageUrl">
        <el-upload
          class="avatar-uploader"
          action="https://localhost:44341/api/app/common/upload-file"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          name="file"
        >
          <img
            v-if="form.productImageUrl"
            :src="form.productImageUrl"
            class="avatar"
            style="object-fit: contain; background: #fff"
          />
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

      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { Upload } from "@element-plus/icons-vue";
import ProductApi from "@/api/CxsApi/CxsProductApi";

const route = useRoute();
const router = useRouter();
const formRef = ref();

const form = reactive({
  id: "",
  categoryId: "",
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

// 获取分类列表（请替换为实际API）
const categoryList: any = ref<{ id: string; categoryName: string }[]>([]);
const getCategoryList = async () => {
  await ProductApi.getCategorySelect().then((res) => {
    console.log("产品类型来源", res);
    categoryList.value = res;
  });
};

// 图片上传成功处理
function handleAvatarSuccess(response: any) {
  console.log("上传返回：", response);

  if (typeof response === "string") {
    form.productImageUrl = response;
    ElMessage.success("图片上传成功");
    return;
  }
  if (response && (response.data || response.url || response.result)) {
    form.productImageUrl = response.data || response.url || response.result;
    ElMessage.success("图片上传成功");
    return;
  }
  if (response && response.code === 0 && response.data) {
    form.productImageUrl = response.data;
    ElMessage.success("图片上传成功");
    return;
  }
  ElMessage.error("图片上传失败");
}

// 图片上传前验证
function beforeAvatarUpload(file: File) {
  const isJPGorPNG = file.type === "image/jpeg" || file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isJPGorPNG) ElMessage.error("上传图片只能是 JPG/PNG 格式!");
  if (!isLt2M) ElMessage.error("上传图片大小不能超过 2MB!");
  return isJPGorPNG && isLt2M;
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate();
    // 变成普通对象
    const plainForm = JSON.parse(JSON.stringify(form));
    const res: any = await ProductApi.updateProduct(plainForm);

    ElMessage.success(res.message || "修改成功");
    router.push("/cxsmanagment/product");
  } catch (error: any) {
    console.error("修改产品异常：", error);
  }
};

// 获取产品详情并反填（方案一：通过URL参数传递数据）
const getDetail = () => {
  const dataRaw: any = route.query.data;
  console.log("收到的dataRaw：", dataRaw);
  if (!dataRaw) return;
  try {
    const productData = JSON.parse(decodeURIComponent(dataRaw));
    console.log("解析后的productData：", productData);
    Object.assign(form, productData);
  } catch (e) {
    console.error("解析失败", e);
  }
};

// 页面加载时执行
onMounted(() => {
  getCategoryList();
  getDetail();
});
</script>

<style scoped>
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
</style>
