<template>
  <el-form
    ref="formRef"
    :model="addContractForm"
    :rules="rules"
    label-width="110px"
    class="add-contract-form"
    size="small"
  >
    <div class="form-main">
      <!-- 左侧：合同基本信息 -->
      <div class="form-left">
        <div class="form-title">添加合同</div>
        <el-form-item label="所属客户" prop="customerId">
          <el-tag v-if="addContractForm.customerId" type="success">
            {{ addContractForm.customerId }}
          </el-tag>
          <el-tag v-else type="info">未选择客户</el-tag>
          <el-button
            type="primary"
            size="small"
            style="margin-left: 8px"
            @click="openCustomerDialog"
          >
            选择客户
          </el-button>
        </el-form-item>
        <el-form-item label="选择商机" prop="businessOpportunityId">
          <el-select
            v-model="addContractForm.businessOpportunityId"
            placeholder="请选择商机"
            style="width: 100%"
          >
            <el-option
              v-for="item in opportunityList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="userId">
          <el-select
            v-model="addContractForm.userId"
            placeholder="请选择负责人"
            style="width: 100%"
          >
            <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="合同金额" prop="contractProceeds">
          <el-input
            v-model="addContractForm.contractProceeds"
            type="number"
            placeholder="请输入合同金额"
          />
        </el-form-item>
        <el-form-item label="签订日期" prop="signDate">
          <el-date-picker
            v-model="addContractForm.signDate"
            type="date"
            placeholder="选择签订日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="合同名称" prop="contractName">
          <el-input v-model="addContractForm.contractName" placeholder="请输入合同名称" />
        </el-form-item>
        <el-form-item label="生效日期" prop="commencementDate">
          <el-date-picker
            v-model="addContractForm.commencementDate"
            type="date"
            placeholder="选择生效日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="截止日期" prop="expirationDate">
          <el-date-picker
            v-model="addContractForm.expirationDate"
            type="date"
            placeholder="选择截止日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="经销商" prop="dealer">
          <el-input v-model="addContractForm.dealer" placeholder="请输入经销商" />
        </el-form-item>

        <el-form-item label="合同条款" prop="contractTerms">
          <Toolbar style="border: 1px solid #ccc" :editor="editorRef" :mode="mode" />
          <Editor
            v-model="addContractForm.contractTerms"
            style="border: 1px solid #ccc; height: 400px; width: 100%; overflow-y: auto"
            :default-config="editorConfig"
            :mode="mode"
            @on-created="handleCreated"
          />
        </el-form-item>
        <el-form-item label="审核人" prop="auditorIds">
          <el-select
            v-model="addContractForm.auditorIds"
            placeholder="请选择审核人"
            style="width: 100%"
            multiple
          >
            <el-option
              v-for="item in auditorList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="合同扫描件">
          <el-upload
            class="upload-demo"
            action="#"
            :file-list="addContractForm.contractScanning"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :limit="1"
            list-type="picture-card"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="上传附件">
          <el-upload
            class="upload-demo"
            action="#"
            :file-list="addContractForm.attachment"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            multiple
            list-type="text"
          >
            <el-button size="small" type="primary">上传附件</el-button>
          </el-upload>
        </el-form-item>
      </div>
      <!-- 右侧：产品和应收款 -->
      <div class="form-right">
        <div class="form-title-row">
          <div class="form-title">添加产品</div>
          <el-button type="primary">提交</el-button>
        </div>
        <!-- 添加产品 -->
        <el-button
          type="primary"
          size="small"
          style="margin-bottom: 8px"
          @click="openProductDialog"
        >
          添加产品
        </el-button>
        <el-table
          :data="addContractForm.addCrmcontractandProductDto"
          style="width: 100%; height: 300px; margin-bottom: 16px"
        >
          <el-table-column prop="name" label="产品名称" />
          <el-table-column prop="category" label="产品分类" />
          <el-table-column prop="price" label="价格" />
          <el-table-column label="售价">
            <template #default="{ row }">
              <el-input v-model.number="row.sellPrice" size="small" @input="updateSumPrice(row)" />
            </template>
          </el-table-column>
          <el-table-column label="数量">
            <template #default="{ row }">
              <el-input
                v-model.number="row.buyProductNum"
                size="small"
                @input="updateSumPrice(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="合计">
            <template #default="{ row }">
              {{ row.sumPrice ? row.sumPrice.toFixed(2) : "0.00" }}
            </template>
          </el-table-column>
        </el-table>
        <div style="text-align: right; margin-bottom: 16px">
          合计：
          <span style="color: #409eff">{{ totalAmount.toFixed(2) }}</span>
        </div>
        <!-- 添加应收款 -->
        <div class="form-title">添加应收款</div>
        <el-form-item label="应收款编号" prop="receivableCode">
          <el-input v-model="createUpdateReceibablesDto.receivableCode" />
        </el-form-item>
        <el-form-item label="应收款金额" prop="receivablePay">
          <el-input
            v-model="createUpdateReceibablesDto.receivablePay"
            type="number"
            placeholder="请输入应收款金额"
          />
        </el-form-item>
        <el-form-item label="应收款时间" prop="receivableDate">
          <el-date-picker
            v-model="createUpdateReceibablesDto.receivableDate"
            type="date"
            placeholder="选择应收款时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="createUpdateReceibablesDto.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </div>
    </div>
  </el-form>

  <!-- 产品列表和多选 -->
  <el-dialog
    v-model="showProductDialog"
    title="选择产品"
    width="800px"
    @close="productSelection = []"
  >
    <div style="margin-bottom: 12px">
      <el-input
        v-model="productSearch.ProductBrand"
        placeholder="搜索产品名称"
        style="width: 240px; margin-right: 8px"
        clearable
        @keyup.enter="handleProductSearch"
      />
      <el-button type="primary" :loading="productLoading" @click="handleProductSearch">
        搜索
      </el-button>
    </div>
    <el-table
      ref="productTableRef"
      v-loading="productLoading"
      :data="productList"
      :row-key="'id'"
      style="width: 100%"
      height="350"
      border
      @selection-change="handleProductSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="categoryId" label="分类" />
      <el-table-column prop="imgUrl" label="图片" width="80">
        <template #default="{ row }">
          <el-image :src="row.imgUrl" style="width: 40px; height: 40px" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column
        prop="productBrand"
        :v-model="AddCrmcontractandProductDto.name"
        label="产品名称"
      />
      <el-table-column prop="id" label="产品编号" />
      <el-table-column prop="dealPrice" label="价格" />
    </el-table>
    <template #footer>
      <el-button @click="showProductDialog = false">取消</el-button>
      <el-button type="primary" @click="handleProductDialogConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, shallowRef, onBeforeUnmount, nextTick, computed } from "vue";
import "@wangeditor/editor/dist/css/style.css"; // 引入样式
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import ProductApi from "@/api/CxsApi/CxsProductApi"; // 按你的实际路径引入

//#region 暂存数据结构
// 添加合同表单
interface addContractForm {
  customerId: string; // 所属客户ID
  businessOpportunityId: string; // 选择商机ID
  userId: string; // 负责人ID
  signDate: string; // 签订日期
  contractName: string; // 合同名称
  commencementDate: string; // 生效日期
  expirationDate: string; // 截止日期
  dealer: string; // 经销商
  contractTerms: string; // 合同条款
  auditorIds: string[]; // 审核人ID列表
  contractScanning: string; // 合同扫描件(图片)
  attachment: string; // 上传附件
  contractProceeds: number; // 合同收款
  currentStep: number; // 当前审批到第几人
  approveComments: string[]; // 审批意见
  approveTimes: string[]; // 审批时间（建议用字符串，前端与后端格式化）
  paymentStatus: number; // 收款状态
  addCrmcontractandProductDto: AddCrmcontractandProductDto[]; // 产品信息
  createUpdateReceibablesDto: CreateUpdateReceibablesDto; // 应收款表信息
}

// 添加应收款表单
interface CreateUpdateReceibablesDto {
  receivableCode?: string; // 应收款编号（可选）
  receivablePay: number; // 应收款金额
  receivableDate: string; // 应收款时间
  remark: string; // 备注
}

// 添加合同表单
const addContractForm = reactive<addContractForm>({
  customerId: "",
  businessOpportunityId: "",
  userId: "",
  signDate: "",
  contractName: "",
  commencementDate: "",
  expirationDate: "",
  dealer: "",
  contractTerms: "",
  auditorIds: [],
  contractScanning: "",
  attachment: "",
  contractProceeds: 0,
  currentStep: 0,
  approveComments: [],
  approveTimes: [],
  paymentStatus: 0,
  addCrmcontractandProductDto: [],
  createUpdateReceibablesDto: {
    receivableCode: "", // 应收款编号（可选）
    receivablePay: 0, // 应收款金额
    receivableDate: "", // 应收款时间
    remark: "", // 备注
  },
});

const createUpdateReceibablesDto = reactive<CreateUpdateReceibablesDto>({
  receivableCode: "", // 应收款编号（可选）
  receivablePay: 0, // 应收款金额
  receivableDate: "", // 应收款时间
  remark: "", // 备注
});

const rules = {
  customerId: [{ required: true, message: "请选择所属客户", trigger: "change" }],
  userId: [{ required: true, message: "请选择负责人", trigger: "change" }],
  contractProceeds: [{ required: true, message: "请输入合同金额", trigger: "blur" }],
  signDate: [{ required: true, message: "请选择签订日期", trigger: "blur" }],
  contractName: [{ required: true, message: "请输入合同名称", trigger: "blur" }],
  expirationDate: [{ required: true, message: "请选择截止日期", trigger: "blur" }],
  dealer: [{ required: true, message: "请输入经销商", trigger: "blur" }],
  contractTerms: [{ required: true, message: "请输入合同条款", trigger: "blur" }],
  auditorIds: [{ required: true, message: "请选择审核人", trigger: "blur" }],
  receivableCode: [{ required: true, message: "请输入应收款编号", trigger: "blur" }],
  receivablePay: [{ required: true, message: "请输入应收款金额", trigger: "blur" }],
  receivableDate: [{ required: true, message: "请选择应收款时间", trigger: "blur" }],
};

//#endregion

//#region 富文本操作

//富文本测试
const mode = "default"; // 或 'simple'
const editorRef = shallowRef(); // 编辑器实例
const editorConfig = {
  placeholder: "请输入合同条款...",
  MENU_CONF: {},
};

// 编辑器创建回调
const handleCreated = (editor: any) => {
  editorRef.value = editor;
};

// 组件卸载时销毁编辑器实例
onBeforeUnmount(() => {
  if (editorRef.value) {
    editorRef.value.destroy();
  }
});
//#endregion

//#region 产品操作
// 添加产品表单
interface AddCrmcontractandProductDto {
  crmContractId: string;
  productId: string;
  name?: string; // 新增
  category?: string; // 新增
  price?: number; // 新增
  buyProductNum: number;
  sellPrice: number;
  sumPrice: number;
}

// 添加产品表单
const AddCrmcontractandProductDto = reactive<AddCrmcontractandProductDto>({
  crmContractId: "",
  productId: "",
  name: "",
  category: "",
  price: 0,
  buyProductNum: 0,
  sellPrice: 0,
  sumPrice: 0,
});

//获取产品列表
const productList = ref<any[]>([]);
// 产品列表的加载状态动画
const productLoading = ref(false);
// 产品列表搜索
const productSearch = ref({
  ProductBrand: "",
  PageIndex: 1,
  PageSize: 10,
});
// 产品列表对话框状态
const showProductDialog = ref(false);
// 存储已选择的产品ID，用于反填
const selectedProductIds = ref<string[]>([]);
// 产品选中列表
const productSelection = ref<any[]>([]);
// 产品列表的响应式引用
const productTableRef = ref();

// 获取产品列表
async function fetchProductList() {
  productLoading.value = true;
  try {
    //调用接口获取产品列表
    const res: any = await ProductApi.getProductList(productSearch.value);
    // 将产品列表赋值给productList
    productList.value = res || [];

    // dom的更新循环,产品列表数据加载完成后，反填已选择的产品(获取已选择的产品ids后,利用nextTick的特性来反填产品列表)
    nextTick(() => {
      restoreProductSelection();
    });
  } finally {
    productLoading.value = false;
  }
}

// 打开对话框时拉取数据
function openProductDialog() {
  showProductDialog.value = true;
  // 保存当前已选择的产品ID,根据合同表中的产品ids反填产品列表
  selectedProductIds.value = addContractForm.addCrmcontractandProductDto.map(
    (item) => item.productId
  );
  console.log(selectedProductIds.value);
  fetchProductList();
}

// 反填已选择的产品
function restoreProductSelection() {
  // 如果已选择的产品ID列表为空，则不进行反填
  if (!selectedProductIds.value.length) return;
  // 利用nextTick的特性来反填产品列表
  nextTick(() => {
    // 清空当前选择
    productTableRef.value.clearSelection();
    // 遍历产品列表，选中已选择的产品
    productList.value.forEach((product) => {
      //将选中到的产品数据id利用toggleRowSelection方法(让el-table组件能够手动选中,ture就是给多选框选中)选中
      if (selectedProductIds.value.includes(product.id)) {
        productTableRef.value.toggleRowSelection(product, true);
      }
    });
  });
}

// 搜索
function handleProductSearch() {
  fetchProductList();
}

// 确认选择
function handleProductDialogConfirm() {
  // 获取当前选中的产品
  const currentSelectedIds = productSelection.value.map((item) => item.id);
  console.log(currentSelectedIds);

  // 找出新增的产品（当前选中但不在已添加列表中的）
  const existingIds = addContractForm.addCrmcontractandProductDto.map((item) => item.productId);
  const newProducts = productSelection.value.filter((item) => !existingIds.includes(item.id));

  console.log(newProducts);

  // 添加新选中的产品到表单
  if (newProducts.length > 0) {
    addContractForm.addCrmcontractandProductDto.push(
      ...newProducts.map((item) => ({
        crmContractId: "", // 新增时为空
        productId: item.id,
        name: item.productBrand, // 产品名称
        category: item.categoryId, // 产品分类
        price: item.dealPrice, // 价格
        sellPrice: item.dealPrice, // 初始等于价格
        buyProductNum: 1, // 默认1
        sumPrice: item.dealPrice, // 初始等于价格
      }))
    );
  }

  // 更新已选择的产品ID列表
  selectedProductIds.value = currentSelectedIds;

  showProductDialog.value = false;
  // 不清空 productSelection，保持选择状态
}

// 计算单行合计
function updateSumPrice(row: any) {
  row.sumPrice = (Number(row.sellPrice) || 0) * (Number(row.buyProductNum) || 0);
}

// 计算总合计
const totalAmount = computed(() =>
  addContractForm.addCrmcontractandProductDto.reduce(
    (sum, item) => sum + (Number(item.sumPrice) || 0),
    0
  )
);

// handleProductSelectionChange是一个selection-change的选中变化事件,将选中的产品信息动态的获取
function handleProductSelectionChange(selected: any) {
  productSelection.value = selected;

  // 获取所有已选产品的id
  const selectedIds = selected.map((item: any) => item.id);

  // 只保留已选中的产品，移除未选中的
  addContractForm.addCrmcontractandProductDto = addContractForm.addCrmcontractandProductDto.filter(
    (item) => selectedIds.includes(item.productId)
  );
}
//#endregion
</script>

<style scoped>
.add-contract-form {
  padding: 7px;
  background: #f5f8fd;
}
.form-main {
  display: flex;
  gap: 10px;
}
.form-left {
  flex: 1;
  background: #fff;
  padding: 24px 20px 10px 20px;
  border-radius: 6px;
  min-width: 380px;
}
.form-right {
  flex: 1;
  background: #fff;
  padding: 24px 20px 10px 20px;
  border-radius: 6px;
  min-width: 380px;
}
.form-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 18px;
  color: #409eff;
  border-bottom: 2px solid #f5f5f5;
  padding-bottom: 6px;
}
.add-contract-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 20px 0 0;
}
.form-right {
  position: relative;
  padding-bottom: 70px;
}
.add-contract-footer {
  right: 24px;
  bottom: 24px;
}
.form-title-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
}
.form-title-row .form-title {
  margin-bottom: 0; /* 去掉原有的下边距 */
}
</style>
