<template>
  <div>
    <el-card>
      <el-card style="margin-top: 10px">
        <!-- 顶部筛选区 -->
        <div style="margin-bottom: 16px">
          <div style="display: flex; align-items: center; margin-bottom: 8px">
            <span style="font-weight: bold; font-size: 16px">待审核收款列表</span>
            <span style="margin-left: 16px; color: #888">总记录数：</span>
            <span style="color: #409eff; margin-left: 2px">{{ pagination.totalCount }}</span>
            <span style="color: #888; margin-left: 2px">条</span>
          </div>
        </div>
      </el-card>
      <el-card style="margin-top: 10px;height: 100vh;">
        <el-table ref="tableRef" v-loading="loading" :data="tableData" border style="width: 100%" empty-text="暂无数据"
          @selection-change="handleSelectionChange" @row-click="handleRowClick">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="invoiceNumberCode" label="发票编号">
            <template #default="scope">
              <span class="ellipsis-cell">{{ scope.row.invoiceNumberCode || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="invoiceStatus" label="状态">
            <template #default="scope">
              <span class="ellipsis-cell" :style="{
                color:
                  scope.row.invoiceStatus === 0
                    ? '#faad14'
                    : scope.row.invoiceStatus === 1
                      ? '#1890ff'
                      : scope.row.invoiceStatus === 2
                        ? '#52c41a'
                        : scope.row.invoiceStatus === 3
                          ? '#f5222d'
                          : '#999',
              }">
                {{
                  scope.row.invoiceStatus === 0
                    ? "待审核"
                    : scope.row.invoiceStatus === 1
                      ? "审核中"
                      : scope.row.invoiceStatus === 2
                        ? "已通过"
                        : scope.row.invoiceStatus === 3
                          ? "已驳回"
                          : "未知状态"
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="开票金额">
            <template #default="scope">
              <span class="ellipsis-cell">{{ scope.row.amount || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="invoiceDate" label="开票时间">
            <template #default="scope">
              <span class="ellipsis-cell">
                {{ scope.row.invoiceDate ? scope.row.invoiceDate.substring(0, 10) : "-" }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="invoiceType" label="开票类型">
            <template #default="scope">
              <span class="ellipsis-cell">
                {{
                  scope.row.invoiceType === 0
                    ? "增值税普通发票"
                    : scope.row.invoiceType === 1
                      ? "增值税专用发票"
                      : "收据"
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="customerName" label="所属客户">
            <template #default="scope">
              <span class="ellipsis-cell">{{ scope.row.customerName || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="contractName" label="关联合同">
            <template #default="scope">
              <span class="ellipsis-cell">{{ scope.row.contractName || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="realName" label="负责人">
            <template #default="scope">
              <span class="ellipsis-cell">{{ scope.row.realName || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="currentAuditorName" label="审核人">
            <template #default="scope">
              <span class="ellipsis-cell">{{ scope.row.currentAuditorName || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="creatorRealName" label="创建人">
            <template #default="scope">
              <span class="ellipsis-cell">{{ scope.row.creatorRealName || "-" }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页区域 -->
        <div style="margin-top: 16px; display: flex; justify-content: center">
          <el-pagination v-model:current-page="pagination.PageIndex" v-model:page-size="pagination.PageSize"
            :page-sizes="[5, 10, 15, 20]" :total="pagination.totalCount" :background="true"
            layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </el-card>
    </el-card>
    <!-- 详情抽屉 -->
    <el-drawer v-model="showDetailDrawer" title="发票详情" size="60%" direction="rtl" :with-header="true">
      <div style="padding: 24px 32px 0 32px">
        <!-- 顶部编号和按钮 -->
        <div style="display: flex; align-items: center; justify-content: space-between">
          <div style="font-weight: bold; font-size: 18px">
            <el-icon style="color: #409eff; margin-right: 6px">
              <Document />
            </el-icon>
            {{ detailData?.invoiceNumberCode || "-" }}
          </div>
          <div style="display: flex; gap: 12px">
            <el-button type="primary" size="small" style="border-radius: 8px; min-width: 70px"
              @click="handleEditDetail">
              修改
            </el-button>
            <el-button type="primary" size="small" style="border-radius: 8px; min-width: 70px"
              @click="handleAuditDetail">
              审核
            </el-button>
            <el-button type="primary" size="small" style="border-radius: 8px; min-width: 70px"
              @click="handleRejectDetail">
              驳回
            </el-button>
            <el-button type="danger" size="small" style="border-radius: 8px; min-width: 70px"
              @click="handleDelete(detailData)">
              删除
            </el-button>
          </div>
        </div>
      </div>
      <div style="padding: 24px 32px 0 32px; color: #fff">
        <el-row :gutter="40">
          <!-- 左侧 基础信息 -->
          <el-col :span="12">
            <div style="font-weight: bold; font-size: 20px;">基础信息</div>
            <div class="info-row">
              <span class="info-label">所属客户：</span>
              {{ detailData?.customerName || "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">关联合同：</span>
              {{ detailData?.contractName || "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">关联收款：</span>
              {{ detailData?.paymentAmount || "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">负责人：</span>
              {{ detailData?.realName || "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">发票号码：</span>
              {{ detailData?.invoiceNumberCode || "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">开票金额：</span>
              {{ detailData?.amount || "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">税额：</span>
              {{ detailData?.taxAmount || "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">开票日期：</span>
              {{ detailData?.invoiceDate ? detailData.invoiceDate.substring(0, 10) : "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">开票类型：</span>
              <span v-if="detailData?.invoiceType === 0">增值税普通发票</span>
              <span v-else-if="detailData?.invoiceType === 1">增值税专用发票</span>
              <span v-else-if="detailData?.invoiceType === 3">收据</span>
              <span v-else>-</span>
            </div>
            <div class="info-row">
              <span class="info-label">审核人：</span>
              {{ detailData?.auditorNames || "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">发票图片：</span>
              <img v-if="detailData?.invoiceImg" :src="detailData.invoiceImg" style="width: 35px; height: 45px" />
              <span v-else>-</span>
            </div>
            <div class="info-row">
              <span class="info-label">备注：</span>
              {{ detailData?.remark || "-" }}
            </div>
          </el-col>
          <!-- 右侧 发票信息 -->
          <el-col :span="12">
            <div style="font-weight: bold; font-size: 20px;">发票信息</div>
            <div class="info-row">
              <span class="info-label">已有发票信息：</span>
              {{ detailData?.inoviceTitle || "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">发票抬头：</span>
              {{ detailData?.title || "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">纳税识别号：</span>
              {{ detailData?.taxNumber || "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">开户行：</span>
              {{ detailData?.bank || "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">开户账号：</span>
              {{ detailData?.bankAccount || "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">开户地址：</span>
              {{ detailData?.billingAddress || "-" }}
            </div>
            <div class="info-row">
              <span class="info-label">电话：</span>
              {{ detailData?.billingPhone || "-" }}
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 审核信息 -->
      <div style="
            font-weight: bold;
            font-size: 15px;
            border-left: 3px solid #faad14;
            padding-left: 8px;
            margin-bottom: 18px;
          ">
        审核信息
      </div>
      <el-divider content-position="left"></el-divider>
      <div v-if="detailData.approveComments && detailData.approveComments.length">
        <div v-for="(comment, idx) in detailData.approveComments" :key="idx"
          style="margin-bottom: 8px; display: flex; align-items: center">
          <el-icon style="margin-right: 4px"><el-icon-user /></el-icon>
          <span style="color: #1890ff">{{ getUserNameById(detailData.approverIds?.[idx]) }}</span>
          <span style="margin-left: 8px; color: #999">
            {{ detailData.approveTimes?.[idx]?.replace("T", " ").substring(0, 16) || "-" }}
          </span>
          <span style="margin-left: 8px">{{ comment || "-" }}</span>
        </div>
      </div>
      <div v-else style="color: #aaa; text-align: center">没有更多了</div>

      <!-- 操作日志 -->
      <div>
        <div style="
              font-weight: bold;
              font-size: 15px;
              border-left: 3px solid #faad14;
              padding-left: 8px;
              margin-bottom: 18px;
            ">
          操作日志
        </div>
      </div>
      <el-divider content-position="left"></el-divider>
      <div v-if="recordlist && recordlist.length">
        <div v-for="item in recordlist" :key="item.id" style="margin-bottom: 8px; display: flex; align-items: center">
          <el-icon style="vertical-align: middle; margin-right: 4px"><el-icon-user /></el-icon>
          <span style="color: #1890ff">
            <!-- 操作人ID（如有名字可替换为名字） -->
            {{ item.creatorName || "-" }}
          </span>
          <span style="margin-left: 8px; color: #999">
            <!-- 操作时间 -->
            {{ item.creationTime ? item.creationTime.replace("T", " ").substring(0, 16) : "-" }}
          </span>
          <span style="margin-left: 8px">
            <!-- 操作内容 -->
            {{ item.action || "-" }}
          </span>
        </div>
      </div>
      <div v-else style="color: #aaa; text-align: center">没有更多了</div>
    </el-drawer>

    <!-- 修改发票弹窗 -->
    <el-drawer v-model="showEditDrawer" title="修改发票" width="2000px" size="50%" :with-header="true" direction="rtl">
      <el-form ref="editFormRef" :model="editForm" :rules="addRules" label-width="120px">
        <el-row :gutter="40">
          <!-- 左侧 基础信息 -->
          <el-col :span="12">
            <el-form-item label="所属客户" prop="customerName">
              <el-input v-model="editForm.customerName" disabled />
            </el-form-item>
            <el-form-item label="关联合同" prop="contractId">
              <el-select v-model="editForm.contractId" placeholder="请选择合同" style="width: 100%" disabled>
                <el-option v-for="item in contractList" :key="item.id" :label="item.contractName" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="关联收款" prop="paymentId">
              <el-select v-model="editForm.paymentId" placeholder="请选择收款" style="width: 100%">
                <el-option v-for="item in paymentList" :key="item.id" :label="item.amount" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="负责人" prop="userId" required>
              <el-select v-model="editForm.userId" placeholder="请选择负责人" style="width: 100%">
                <el-option v-for="item in userList" :key="item.id" :label="item.realName" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="发票号码" prop="invoiceNumberCode">
              <el-input v-model="editForm.invoiceNumberCode" placeholder="请输入发票号码" />
            </el-form-item>
            <el-form-item label="开票金额" prop="amount" required>
              <el-input v-model="editForm.amount" type="number" placeholder="请输入开票金额" />
            </el-form-item>
            <el-form-item label="税额" prop="taxAmount" required>
              <el-input v-model="editForm.taxAmount" type="number" placeholder="请输入税额" />
            </el-form-item>
            <el-form-item label="开票日期" prop="invoiceDate" required>
              <el-date-picker v-model="editForm.invoiceDate" type="datetime" placeholder="选择开票日期" style="width: 100%"
                value-format="YYYY-MM-DDTHH:mm:ss" />
            </el-form-item>
            <el-form-item label="开票类型" prop="invoiceType" required>
              <el-select v-model="editForm.invoiceType" placeholder="请选择开票类型" style="width: 100%">
                <el-option label="增值税普通发票" :value="0" />
                <el-option label="增值税专用发票" :value="1" />
                <el-option label="收据" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="审核人" prop="approverIds" required>
              <el-select v-model="editForm.approverIds" multiple placeholder="请选择审核人" style="width: 100%">
                <el-option v-for="item in userList" :key="item.id" :label="item.realName" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="发票图片" prop="invoiceImg">
              <el-upload class="avatar-uploader" action="https://localhost:44341/api/app/common/upload-file"
                :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                <img v-if="editForm.invoiceImg" :src="editForm.invoiceImg" class="avatar"
                  style="width: 35px; height: 45px" />
                <el-icon v-else class="avatar-uploader-icon">
                  <Plus />
                </el-icon>
                <div>上传图片</div>
              </el-upload>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="editForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
          <!-- 右侧 发票信息 -->
          <el-col :span="12">
            <div style="font-weight: bold; margin-bottom: 16px">发票信息</div>
            <el-form-item label="已有发票信息" prop="invoiceInformationId">
              <el-select v-model="editForm.invoiceInformationId" placeholder="请选择发票信息" style="width: 100%">
                <el-option v-for="item in invoiceInfoList" :key="item.id" :label="item.title" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="发票抬头" prop="title" required>
              <el-input v-model="editForm.title" placeholder="请输入发票抬头" />
            </el-form-item>
            <el-form-item label="纳税识别号" prop="taxNumber" required>
              <el-input v-model="editForm.taxNumber" placeholder="请输入纳税识别号" />
            </el-form-item>
            <el-form-item label="开户行" prop="bank" required>
              <el-input v-model="editForm.bank" placeholder="请输入开户行" />
            </el-form-item>
            <el-form-item label="开户账号" prop="bankAccount" required>
              <el-input v-model="editForm.bankAccount" placeholder="请输入开户账号" />
            </el-form-item>
            <el-form-item label="开户地址" prop="billingAddress" required>
              <el-input v-model="editForm.billingAddress" placeholder="请输入开户地址" />
            </el-form-item>
            <el-form-item label="电话" prop="billingPhone" required>
              <el-input v-model="editForm.billingPhone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item style="text-align: right; width: 100%">
          <el-button type="primary" style="float: right" @click="handleEditSubmit">
            提交
          </el-button>
        </el-form-item>
      </el-form>
    </el-drawer>



    <!-- 审核/驳回弹窗 -->
    <el-dialog v-model="showApproveDialog" :title="approveType == true ? '审核通过' : '审核驳回'" width="400px"
      :close-on-click-modal="false">
      <el-form>
        <el-form-item label="原因（非必填）" label-width="100px">
          <el-input v-model="approveComment" type="textarea" :rows="4" placeholder="请输入原因（可不填）"
            prefix-icon="el-icon-smile" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="handleApproveSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated } from "vue";
import CrmContractAPI from "@/api/CrmContract/crmcontract";
import PaymentViewAPI from "@/api/Finance/payment.api";
import UserAPI from "@/api/User/user.api";
import InvoiceViewAPI, { InvoicePageQuery } from "@/api/Finance/invoice.api";
import { ElMessage, ElMessageBox } from "element-plus";
import type { UploadProps } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store";
import RecordAPI from "@/api/Record/record.api";

const store = useUserStore();

const router = useRouter();
const route = useRoute();

// 页面加载时获取数据
onMounted(() => {
  GetPaymentData();
  GetInvoice();
  GetcontractData();
  UserData();
  InvoiceData();
});

const loading = ref(false);
const tableData: any = ref([]);

// 分页配置
const pagination = reactive({
  PageIndex: 1,
  PageSize: 10,
  totalCount: 0,
  pageCount: 0,
});

const currentUserId = store.userInfo.id; // 获取当前登录人ID
const currentUserName = store.userInfo.realName; // 获取当前登录人姓名
console.log("当前登录人", currentUserName);
console.log("当前登录人ID", currentUserId);

// 搜索表单
const searchForm = reactive({
  StartTime: "",
  EndTime: "",
  UserId: "",
  CreatorId: "",
  CustomerId: "",
  ContractId: "",
  InvoiceNumberCode: "",
  InvoiceType: "",
  InvoiceDate: [],
  InvoiceStatus: "",
  ApproverIds: [],
});

// 获取发票数据
const GetInvoice = () => {
  loading.value = true;
  const params: InvoicePageQuery = {
    PageIndex: pagination.PageIndex,
    PageSize: pagination.PageSize,
    StartTime: searchForm.StartTime,
    EndTime: searchForm.EndTime,
    UserId: searchForm.UserId,
    CreatorId: searchForm.CreatorId,
    CustomerId: searchForm.CustomerId,
    ContractId: searchForm.ContractId,
    InvoiceNumberCode: searchForm.InvoiceNumberCode,
    InvoiceType: searchForm.InvoiceType,
    InvoiceDate: searchForm.InvoiceDate,
    InvoiceStatus: searchForm.InvoiceStatus,
    ApproverIds: searchForm.ApproverIds,
  };

  InvoiceViewAPI.GetInvoicePage(params)
    .then((res) => {
      console.log("发票数据", res);
      // 前端再次过滤，确保只显示待审核和审核中的数据
      const filteredData = res.data.filter(
        (item: any) => (item.invoiceStatus === 0 || item.invoiceStatus === 1) && item.currentAuditorName === currentUserName) // 只显示当前登录人审核中的数据
      debugger;
      tableData.value = filteredData;
      pagination.totalCount = filteredData.length;
      pagination.pageCount = Math.ceil(filteredData.length / pagination.PageSize);
    })
    .finally(() => {
      loading.value = false;
    });
};



const addForm = reactive({
  customerId: "",
  customerName: "",
  customerType: "unselected",
  contractId: "",
  paymentId: "",
  userId: "",
  invoiceNumberCode: "",
  amount: 0,
  taxAmount: 0,
  invoiceDate: "",
  invoiceType: 0,
  invoiceImg: "",
  remark: "",
  approverIds: [],
  invoiceInformationId: "",
  title: "",
  taxNumber: "",
  bank: "",
  billingAddress: "",
  bankAccount: "",
  billingPhone: "",
});

const addRules = {
  customerId: [{ required: true, message: "请选择客户", trigger: "change" }],
  contractId: [{ required: true, message: "请选择合同", trigger: "change" }],
  paymentId: [{ required: true, message: "请选择收款", trigger: "change" }],
  userId: [{ required: true, message: "请选择负责人", trigger: "change" }],
  amount: [{ required: true, message: "请输入开票金额", trigger: "blur" }],
  taxAmount: [{ required: true, message: "请输入税额", trigger: "blur" }],
  invoiceDate: [{ required: true, message: "请选择开票日期", trigger: "change" }],
  invoiceType: [{ required: true, message: "请选择开票类型", trigger: "change" }],
  approverIds: [{ required: true, message: "请选择审核人", trigger: "change" }],
  invoiceImg: [{ required: false }],
  remark: [{ required: false }],
  invoiceInformationId: [{ required: false }],
  title: [{ required: true, message: "请输入发票抬头", trigger: "blur" }],
  taxNumber: [{ required: true, message: "请输入纳税识别号", trigger: "blur" }],
  bank: [{ required: true, message: "请输入开户行", trigger: "blur" }],
  billingAddress: [{ required: true, message: "请输入开户地址", trigger: "blur" }],
  bankAccount: [{ required: true, message: "请输入开户账号", trigger: "blur" }],
  billingPhone: [{ required: true, message: "请输入电话", trigger: "blur" }],
};

// 分页大小改变
function handleSizeChange(val: number) {
  pagination.PageSize = val;
  pagination.PageIndex = 1; // 重置到第一页
  GetInvoice();
}

// 当前页改变
function handleCurrentChange(val: number) {
  pagination.PageIndex = val;
  GetInvoice();
}

// 获取合同列表数据
const contractList: any = ref([]);
//显示查询分页
const GetcontractData = async () => {
  const pageForm = reactive({
    PageIndex: 1,
    PageSize: 111,
  });
  CrmContractAPI.getInfo(pageForm)
    .then((res) => {
      console.log("合同列表数据", res.data);
      contractList.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

// 获取负责人列表数据
const userList: any = ref([]);
//显示查询分页
const UserData = async () => {
  UserAPI.GetUserPage()
    .then((res) => {
      console.log("负责人用户列表数据", res);
      userList.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

// 获取收款列表数据
const paymentList: any = ref([]);
const GetPaymentData = async () => {
  const params = reactive({
    PageIndex: 1,
    PageSize: 111,
  });

  PaymentViewAPI.GetPaymentPage(params)
    .then((res) => {
      console.log("收款列表数据", res);
      paymentList.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

// 发票信息列表数据下拉
const invoiceInfoList: any = ref([]);
const InvoiceData = async () => {
  const params = reactive({
    PageIndex: 1,
    PageSize: 111,
  });

  InvoiceViewAPI.GetInvoicePage(params)
    .then((res) => {
      console.log("收款列表数据", res);
      invoiceInfoList.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};


// 路由激活时刷新（用于Add.vue返回后刷新列表）
onActivated(() => {
  // 判断是否带有刷新标记
  if (route.query.refresh) {
    GetInvoice();
    // 清除刷新标记，避免重复刷新
    router.replace({ query: { ...route.query, refresh: undefined } });
  }
});

//批量删除

const tableRef = ref();
const selectedRows = ref([]); // 存储选中的行

function handleSelectionChange(selection: any) {
  console.log("handleSelectionChange", selection);
  selectedRows.value = selection;
}

const showDetailDrawer = ref(false);
const detailData = ref<any>(null);

// 显示详情抽屉
function handleRowClick(row: any) {
  detailData.value = row;
  showDetailDrawer.value = true;
  RecordData(row.id); // 获取操作日志列表数据
}

// 获取操作日志列表数据
const recordlist: any = ref([]);
//显示查询分页
const RecordData = async (id: any) => {
  const params = {
    bizType: "invoice",
  }
  console.log("操作日志列表数据id", id);
  try {
    const list = await RecordAPI.GetRecord(params, id);
    console.log("操作日志列表数据:", list);
    recordlist.value = list || [];
  } catch (err: any) {
    console.error("获取操作日志列表失败:", err.message);
  }
}

// 删除应收款
function handleDelete(row: any) {
  detailData.value = row;
  ElMessageBox.confirm("确定要删除该应收款吗？", "提示", {
    type: "warning",
  }).then(() => {
    InvoiceViewAPI.DeleteInvoice(row.id)
      .then(() => {
        ElMessage.success("删除成功");
        GetInvoice(); // 重新加载数据
      })
      .catch((error) => {
        console.error("删除失败:", error);
        ElMessage.error("删除失败");
      });
  });
}

const showEditDrawer = ref(false);
const editFormRef = ref();
const editForm = reactive({
  id: "",
  userId: "",
  creationTime: "",
  creatorId: "",
  lastModificationTime: "",
  lastModifierId: "",
  isDeleted: true,
  deleterId: "",
  deletionTime: "",
  customerId: "",
  contractId: "",
  paymentId: "",
  invoiceNumberCode: "",
  amount: 0,
  taxAmount: 0,
  invoiceDate: "",
  invoiceType: 0,
  approverIds: [],
  currentStep: 0,
  approveComments: [],
  approveTimes: [],
  invoiceStatus: 0,
  invoiceImg: "",
  remark: "",
  invoiceInformationId: "",
  title: "",
  taxNumber: "",
  bank: "",
  billingAddress: "",
  bankAccount: "",
  billingPhone: "",
  customerName: "",
  contractName: "",
  realName: "",
  creatorRealName: "",
  auditorNames: "",
});

function handleEditDetail() {
  // 反填数据
  Object.assign(editForm, detailData.value);
  console.log("111", detailData.value);
  showEditDrawer.value = true;
}

// 提交修改
function handleEditSubmit() {
  editFormRef.value.validate((valid: boolean) => {
    if (!valid) return;
    InvoiceViewAPI.UpdateInvoice(detailData.value.id, editForm).then((res) => {
      if (res) {
        ElMessage.success("修改成功");
      } else {
        ElMessage.error("修改失败");
      }
      showEditDrawer.value = false;
      showDetailDrawer.value = false;
      GetInvoice();
    });
  });
}

// 通过用户ID获取用户姓名(审核信息)
function getUserNameById(id: any) {
  const user = userList.value.find((u: any) => u.id === id);
  return user ? user.realName : id || "-";
}


// 处理上传的发票图片
const handleAvatarSuccess = (val: any) => {
  addForm.invoiceImg = val;
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



// 审核/驳回弹窗
const showApproveDialog = ref(false);
// 审核/驳回原因
const approveComment = ref("");
// 审核/驳回类型
const approveType = ref(true); // true表示审核通过，false表示审核驳回

const resetApproveForm = (type: true | false) => {
  approveType.value = type;
  approveComment.value = "";
  showApproveDialog.value = true;
};
// 审核/驳回
const handleAuditDetail = () => {
  resetApproveForm(true);
};

const handleRejectDetail = () => {
  resetApproveForm(false);
};

async function handleApproveSubmit() {
  if (!detailData.value?.id) return;
  const params = {
    isPass: approveType.value,
    comment: approveComment.value,
  };
  const approverId = currentUserId;
  const id = detailData.value.id;
  await InvoiceViewAPI.InvoiceInstance(id, approverId, params);
  ElMessage.success(params.isPass ? "审核通过" : "审核驳回");
  showApproveDialog.value = false;
  GetInvoice();
}
</script>

<style scoped>
.info-row {
  margin-bottom: 18px;
  font-size: 18px;
  color: #101010;
}

.info-label {
  color: #888;
  min-width: 120px;
  display: inline-block;
  font-size: 18px;
}

.ellipsis-cell {
  white-space: nowrap;
  /* 禁止换行 */
  overflow: hidden;
  /* 隐藏溢出内容 */
  text-overflow: ellipsis;
  /* 显示省略号（可选） */
  max-width: 100%;
  /* 确保不超出单元格 */
}
</style>
