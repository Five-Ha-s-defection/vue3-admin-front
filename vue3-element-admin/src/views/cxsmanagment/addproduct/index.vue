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
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Upload } from "@element-plus/icons-vue";
import ProductApi from "@/api/CxsApi/CxsProductApi"; // 路径根据实际情况调整
// import CategoryApi from "@/api/CxsApi/CxsCategoryApi"; // 请根据实际路径引入

const router = useRouter();
const formRef = ref();

const form = reactive({
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

const categoryList = ref<{ id: string; categoryName: string }[]>([]);

// 获取分类列表（请替换为实际API）
const getCategoryList = async () => {
  // const res = await CategoryApi.getCategoryList();
  // categoryList.value = res.data || [];
  // 示例数据
  categoryList.value = [
    { id: "00000000-0000-0000-0000-000000000001", categoryName: "分类A" },
    { id: "00000000-0000-0000-0000-000000000002", categoryName: "分类B" },
  ];
};

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

function beforeAvatarUpload(file: File) {
  const isJPGorPNG = file.type === "image/jpeg" || file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isJPGorPNG) ElMessage.error("上传图片只能是 JPG/PNG 格式!");
  if (!isLt2M) ElMessage.error("上传图片大小不能超过 2MB!");
  return isJPGorPNG && isLt2M;
}

const submitForm = async () => {
  try {
    await formRef.value.validate();
    const res: any = await ProductApi.addProduct(form);
    if (res && (res.success || res.code === 0)) {
      ElMessage.success(res.message || "添加成功");
      router.push("/cxsmanagment/product");
    } else {
      ElMessage.error(res?.message || "添加失败");
    }
  } catch (error: any) {
    ElMessage.error(error?.message || "添加失败");
    console.error("添加产品异常：", error);
  }
};

onMounted(() => {
  getCategoryList();
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
