<template>
  <div>
    <el-form ref="formRef" :model="addContractForm" :rules="rules" label-width="110px" class="add-contract-form"
      size="small">
      <div class="form-main">
        <!-- 左侧：合同基本信息 -->
        <div class="form-left">
          <div class="form-title">添加合同</div>
          <el-form-item label="所属客户" prop="customerId">
            <el-tag v-if="otherInfo.customerName" type="success">
              {{ otherInfo.customerName }}
            </el-tag>
            <el-tag v-else type="info">未选择客户</el-tag>
            <el-button type="primary" size="small" style="margin-left: 8px" @click="openCustomerDialog">
              选择客户
            </el-button>
          </el-form-item>
          <el-form-item label="选择商机" prop="businessOpportunityId">
            <el-select v-model="addContractForm.businessOpportunityId" placeholder="请选择商机" style="width: 100%"
              clearable>
              <el-option v-for="item in opportunityList" :key="item.id" :label="item.businessOpportunityName"
                :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="负责人" prop="userId">
            <el-select v-model="addContractForm.userId" placeholder="请选择负责人" style="width: 100%" clearable>
              <el-option v-for="item in userList" :key="item.id" :label="item.realName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="合同金额" prop="contractProceeds">
            <el-input v-model.number="addContractForm.contractProceeds" type="number" placeholder="请输入合同金额" />
          </el-form-item>
          <el-form-item label="签订日期" prop="signDate">
            <el-date-picker v-model="addContractForm.signDate" type="date" placeholder="选择签订日期"
              value-format="YYYY-MM-DDTHH:mm:ss.SSS[Z]" style="width: 100%" />
          </el-form-item>
          <el-form-item label="合同名称" prop="contractName">
            <el-input v-model="addContractForm.contractName" placeholder="请输入合同名称" />
          </el-form-item>
          <el-form-item label="生效日期" prop="commencementDate">
            <el-date-picker v-model="addContractForm.commencementDate" type="date" placeholder="选择生效日期"
              value-format="YYYY-MM-DDTHH:mm:ss.SSS[Z]" style="width: 100%" />
          </el-form-item>
          <el-form-item label="截止日期" prop="expirationDate">
            <el-date-picker v-model="addContractForm.expirationDate" type="date" placeholder="选择截止日期"
              value-format="YYYY-MM-DDTHH:mm:ss.SSS[Z]" style="width: 100%" />
          </el-form-item>
          <el-form-item label="经销商" prop="dealer">
            <el-input v-model="addContractForm.dealer" placeholder="请输入经销商" />
          </el-form-item>

          <el-form-item label="合同条款" prop="contractTerms">
            <Toolbar style="border: 1px solid #ccc" :editor="editorRef" :mode="mode" />
            <Editor v-model="addContractForm.contractTerms"
              style="border: 1px solid #ccc; height: 400px; width: 100%; overflow-y: auto"
              :default-config="editorConfig" :mode="mode" @on-created="handleCreated" />
          </el-form-item>
          <el-form-item label="审核人" prop="auditorId">
            <el-select v-model="addContractForm.auditorId" placeholder="请选择审核人" style="width: 100%" multiple>
              <el-option v-for="item in userList" :key="item.id" :label="item.realName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="合同扫描件">
            <el-upload class="avatar-uploader" action="https://localhost:44341/api/app/common/upload-file"
              :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
              <img v-if="addContractForm.contractScanning" :src="addContractForm.contractScanning" class="avatar"
                style="width: 35px; height: 45px" />
              <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon>
              <div>上传图片</div>
            </el-upload>
          </el-form-item>
        </div>
        <!-- 右侧：产品和应收款 -->
        <div class="form-right">
          <div class="form-title-row">
            <div class="form-title">添加产品</div>
            <el-button type="primary" @click="handleSubmit">提交</el-button>
          </div>
          <!-- 添加产品 -->
          <el-button type="primary" size="small" style="margin-bottom: 8px" @click="openProductDialog">
            添加产品
          </el-button>
          <el-table :data="addContractForm.addCrmcontractandProductDto"
            style="width: 100%; height: 300px; margin-bottom: 16px">
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
                <el-input v-model.number="row.buyProductNum" size="small" @input="updateSumPrice(row)" />
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
          <el-form-item label="应收款编号" prop="createUpdateReceibablesDto.receivableCode">
            <el-input v-model="addContractForm.createUpdateReceibablesDto.receivableCode" />
          </el-form-item>
          <el-form-item label="应收款金额" prop="createUpdateReceibablesDto.receivablePay">
            <el-input v-model="addContractForm.createUpdateReceibablesDto.receivablePay" type="number"
              placeholder="请输入应收款金额" />
          </el-form-item>
          <el-form-item label="应收款时间" prop="createUpdateReceibablesDto.receivableDate">
            <el-date-picker v-model="addContractForm.createUpdateReceibablesDto.receivableDate" type="date"
              placeholder="选择应收款时间" value-format="YYYY-MM-DDTHH:mm:ss.SSS[Z]" style="width: 100%" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="addContractForm.createUpdateReceibablesDto.remark" type="textarea" :rows="3"
              placeholder="请输入备注" />
          </el-form-item>
        </div>
      </div>
    </el-form>

    <!-- 产品列表和多选 -->
    <el-dialog v-model="showProductDialog" title="选择产品" width="800px" @close="productSelection = []">
      <div style="margin-bottom: 12px">
        <el-input v-model="productSearch.ProductBrand" placeholder="搜索产品名称" style="width: 240px; margin-right: 8px"
          clearable @keyup.enter="handleProductSearch" />
        <el-button type="primary" :loading="productLoading" @click="handleProductSearch">
          搜索
        </el-button>
      </div>
      <el-table ref="productTableRef" v-loading="productLoading" :data="productList" :row-key="'id'" style="width: 100%"
        height="350" border @selection-change="handleProductSelectionChange" @row-click="handleProductRowClick">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="categoryId" label="分类" />
        <el-table-column prop="productImageUrl" label="图片" width="80">
          <template #default="{ row }">
            <el-image :src="row.productImageUrl" style="width: 40px; height: 40px" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="productBrand" label="产品名称" />
        <el-table-column prop="id" label="产品编号" />
        <el-table-column prop="dealPrice" label="价格" />
      </el-table>
      <template #footer>
        <el-button @click="showProductDialog = false">取消</el-button>
        <el-button type="primary" @click="handleProductDialogConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 客户弹窗 -->
    <el-dialog v-model="showCustomerDialog" title="选择客户" width="700px" @open="fetchCustomerDialogList">
      <div style="margin-bottom: 12px; display: flex">
        <el-input v-model="customerDialogSearch.customerName" placeholder="搜索客户名称"
          style="width: 220px; margin-right: 8px" clearable @keyup.enter="
            () => {
              customerDialogSearch.PageIndex = 1;
              fetchCustomerDialogList();
            }
          " />
        <el-button type="primary" :loading="customerDialogLoading" @click="
          () => {
            customerDialogSearch.PageIndex = 1;
            fetchCustomerDialogList();
          }
        ">
          搜索
        </el-button>
      </div>
      <el-table v-loading="customerDialogLoading" :data="customerDialogList" highlight-current-row
        :row-key="(row) => row.id" :current-row-key="selectedCustomerRow?.id" style="width: 100%" height="350"
        @current-change="handleSelectCustomer" @row-click="handleSelectCustomer">
        <!-- 单选框列 -->
        <el-table-column label="" width="50" align="center">
          <template #default="{ row }">
            <el-radio :model-value="selectedCustomerRow?.id" :label="row.id"
              @change="() => handleSelectCustomer(row)"></el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="客户编号" />
        <el-table-column prop="customerName" label="客户名称" />
        <el-table-column prop="customerPhone" label="联系电话" />
        <el-table-column prop="creationTime" label="创建时间">
          <template #default="{ row }">
            {{ row.creationTime.substring(0, 10) }} {{ row.creationTime.substring(11, 19) }}
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 12px 0; text-align: right">
        <el-pagination small background layout="prev, pager, next" :total="customerDialogTotal"
          :page-size="customerDialogSearch.PageSize" :current-page="customerDialogSearch.PageIndex" @current-change="
            (page) => {
              customerDialogSearch.PageIndex = page;
              fetchCustomerDialogList();
            }
          " />
      </div>
      <template #footer>
        <el-button @click="showCustomerDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedCustomerRow" @click="handleConfirmCustomer">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, shallowRef, onBeforeUnmount, nextTick, computed, watch } from "vue";
import CrmContractAPI from "@/api/CrmContract/crmcontract";
import UserAPI from "@/api/User/user.api";
import "@wangeditor/editor/dist/css/style.css"; // 引入样式
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import ProductApi from "@/api/CxsApi/CxsProductApi"; // 按你的实际路径引入
import { ElMessage } from "element-plus"; // 引入 ElMessage
import { ShowBusinessOpportunityList } from "@/api/CustomerProcess/BusinessOpportunity/businessopportunity.api";
import { ShowCustomerList } from "@/api/CustomerProcess/Customer/customer.api";
import type { UploadProps } from "element-plus";

//#region 暂存数据结构
const otherInfo = reactive({
  customerName: "", // 所属客户名称
  productName: "",
  category: undefined,
  price: 0,
});

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
  auditorId: string[]; // 审核人ID列表
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

// 应收款表字段
interface CreateUpdateReceibablesDto {
  customerId: string; // 客户ID
  contractId: string; // 合同ID
  userId: string; // 负责人ID
  receivableCode: string; // 应收款编号（可选）
  receivablePay: number; // 应收款金额
  receivableDate: string; // 应收款时间
  remark: string; // 备注
  paymentId: string; // 收款ID
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
  auditorId: [],
  contractScanning: "",
  attachment: "",
  contractProceeds: 0,
  currentStep: 0,
  approveComments: [],
  approveTimes: [],
  paymentStatus: 0,
  addCrmcontractandProductDto: [],
  createUpdateReceibablesDto: {
    customerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // 客户ID
    contractId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // 合同ID
    userId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // 负责人ID
    receivableCode: "", // 应收款编号（可选）
    receivablePay: 0, // 应收款金额
    receivableDate: "", // 应收款时间
    remark: "", // 备注
    paymentId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // 收款ID
  },
});
// 表单验证规则
const rules = {
  customerId: [{ required: true, message: "请选择所属客户", trigger: "change" }],
  userId: [{ required: true, message: "请选择负责人", trigger: "change" }],
  contractProceeds: [{ required: true, message: "请输入合同金额", trigger: "blur" }],
  signDate: [{ required: true, message: "请选择签订日期", trigger: "blur" }],
  contractName: [{ required: true, message: "请输入合同名称", trigger: "blur" }],
  expirationDate: [{ required: true, message: "请选择截止日期", trigger: "blur" }],
  dealer: [{ required: true, message: "请输入经销商", trigger: "blur" }],
  contractTerms: [{ required: true, message: "请输入合同条款", trigger: "blur" }],
  auditorId: [{ required: true, message: "请选择审核人", trigger: "blur" }],
  "createUpdateReceibablesDto.receivableCode": [
    { required: true, message: "请输入应收款编号", trigger: "blur" },
  ],
  "createUpdateReceibablesDto.receivablePay": [
    { required: true, message: "请输入应收款金额", trigger: "blur" },
  ],
  "createUpdateReceibablesDto.receivableDate": [
    { required: true, message: "请选择应收款时间", trigger: "blur" },
  ],
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
  buyProductNum: number;
  sellPrice: number;
  sumPrice: number;
}

// 添加产品表单
const AddCrmcontractandProductDto = reactive<AddCrmcontractandProductDto>({
  crmContractId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  productId: "",
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
    console.log("产品列表", res.data);

    // 将产品列表赋值给productList
    productList.value = res.data || [];


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

  // 找出新增的产品（当前选中但不在已添加列表中的）
  const existingIds = addContractForm.addCrmcontractandProductDto.map((item) => item.productId);
  const newProducts = productSelection.value.filter((item) => !existingIds.includes(item.id));
  console.log(addContractForm.addCrmcontractandProductDto);
  // 添加新选中的产品到表单
  if (newProducts.length > 0) {
    addContractForm.addCrmcontractandProductDto.push(
      ...newProducts.map((item) => ({
        crmContractId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // 新增时为空
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
  console.log(addContractForm.addCrmcontractandProductDto);
}

function handleProductRowClick(row: any) {
  // 反查当前行是否已选中
  const $table = productTableRef.value;
  if (!$table) return;
  $table.toggleRowSelection(row);
}
//#endregion

//#region 提交

const formRef = ref();

const handleSubmit = async () => {
  // 验证表单
  // await formRef.value.validate();

  await CrmContractAPI.addContract(addContractForm);

  // 提交成功提示
  ElMessage.success("合同添加成功！");

  // 可以在这里添加其他成功后的操作，比如跳转页面或重置表单
};
//#endregion

//#region 商机列表
// 商机下拉相关
const opportunityList = ref<any[]>([]);
const opportunityLoading = ref(false);
const opportunityPage = ref(1);
const opportunityTotal = ref(0);
const opportunitySearch = ref({
  PageIndex: 1,
  PageSize: 10,
  businessOpportunityName: "",
}); // 搜索关键字

// 获取商机列表（分页+搜索）
const fetchOpportunityList = async () => {
  opportunityLoading.value = true;
  try {
    const res: any = await ShowBusinessOpportunityList(opportunitySearch.value);
    opportunityList.value = res?.data || [];
    opportunityTotal.value = res?.totalCount || 0;
    opportunityPage.value = res?.pageCount || 0;
  } finally {
    opportunityLoading.value = false;
  }
};
//#endregion

//#region 用户列表
const userList = ref<any[]>([]);
const userLoading = ref(false);

const fetchUserList = async () => {
  userLoading.value = true;
  try {
    const res: any = await UserAPI.getAllUsers();
    userList.value = res || [];
  } finally {
    userLoading.value = false;
  }
};
//#endregion

//#region 客户弹窗相关
const showCustomerDialog = ref(false);
const customerDialogList = ref<any[]>([]);
const customerDialogLoading = ref(false);
const customerDialogPage = ref(1);
const customerDialogTotal = ref(0);
const customerDialogSearch = ref({
  PageIndex: 1,
  PageSize: 10,
  customerName: "",
});
const selectedCustomerRow = ref<any>(null);

// 获取客户列表（弹窗用）
const fetchCustomerDialogList = async () => {
  customerDialogLoading.value = true;
  try {
    const res: any = await ShowCustomerList(customerDialogSearch.value);
    customerDialogList.value = res?.data || [];
    customerDialogTotal.value = res?.totalCount || 0;
    customerDialogPage.value = customerDialogSearch.value.PageIndex;
  } finally {
    customerDialogLoading.value = false;
  }
};

// 打开弹窗
const openCustomerDialog = () => {
  showCustomerDialog.value = true;
  customerDialogSearch.value.PageIndex = 1;
  fetchCustomerDialogList();
};

// 选择客户
const handleSelectCustomer = (row: any) => {
  selectedCustomerRow.value = row;
  addContractForm.customerId = row.id;
  otherInfo.customerName = row.customerName;
};

// 确认选择
const handleConfirmCustomer = () => {
  if (selectedCustomerRow.value) {
    showCustomerDialog.value = false;
  }
};

//#endregion


//#region 图片
const handleAvatarSuccess = (val: any) => {
  addContractForm.contractScanning = val;
};

const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile) => {
  if (rawFile.type !== "image/jpeg") {
    ElMessage.error("Avatar picture must be JPG format!");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("Avatar picture size can not exceed 2MB!");
    return false;
  }
  return true;
};
//#endregion


//#region 修改

//#endregion

//#region 钩子函数
// 监听 totalAmount，实时反填到应收款金额
watch(totalAmount, (newVal) => {
  addContractForm.createUpdateReceibablesDto.receivablePay = Number(newVal);
});

onMounted(() => {
  fetchOpportunityList();
  fetchUserList();
});
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
  margin-bottom: 0;
  /* 去掉原有的下边距 */
}

::v-deep .el-radio__label {
  display: none !important;
}

::v-deep .el-table__row.current-row {
  background: #e6f7ff !important;
}
</style>
