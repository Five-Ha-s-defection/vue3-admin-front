<template>
  <div>
    <el-card>
      <!-- 顶部筛选区 -->
      <el-card style="margin-top: 10px">
        <div style="display: flex; align-items: center; margin-bottom: 8px">
          <span style="font-weight: bold; font-size: 16px">发票列表</span>
          <span style="margin-left: 16px; color: #888">总记录数：</span>
          <span style="color: #409eff; margin-left: 2px">{{ pagination.totalCount }}</span>
          <span style="color: #888; margin-left: 2px">条</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 8px">
          <span style="color: #888">查看范围</span>
          <el-radio-group v-model="scopeType" size="small" style="margin-left: 12px">
            <el-radio-button label="myDuty">我负责的</el-radio-button>
            <el-radio-button label="myCreate">我创建的</el-radio-button>
            <el-radio-button label="all">全部</el-radio-button>
          </el-radio-group>
          <!-- 
          <span style="margin-left: 32px; color: #888">收款进度</span>
          <el-radio-group v-model="progressType" size="small" style="margin-left: 12px">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="unfinished">未完成</el-radio-button>
            <el-radio-button label="finished">收款完成</el-radio-button>
          </el-radio-group> -->
        </div>
        <div style="display: flex; align-items: center;">
          <el-button type="primary" style="margin-right: 350px" @click="Addlist">
            添加发票
          </el-button>
          <el-date-picker v-model="dateRange" type="daterange" range-separator="-" start-placeholder="开始时间"
            end-placeholder="结束时间" value-format="YYYY-MM-DD" style="width: 50px; margin-right: 12px"
            @change="handleDateRangeChange" />
          <el-input v-model="searchForm.InvoiceNumberCode" placeholder="发票编号(不含符号)"
            style="width: 200px; margin-left: 16px" clearable />
          <el-button type="primary" style="margin-left: 8px; margin-right: 10px" @click="search()">
            高级搜索
          </el-button>
          <el-dropdown>
            <el-button>
              操作
              <el-icon>
                <ArrowDown />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleBatchDelete">删除</el-dropdown-item>
                <el-dropdown-item @click="handleExport">导出数据</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-row>
            <el-col :span="4"></el-col>
            <el-col :span="20"></el-col>
          </el-row>
        </div>
      </el-card>
      <el-card style="margin-top: 10px">
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
          <el-table-column prop="auditorNames" label="审核人">
            <template #default="scope">
              <span class="ellipsis-cell">{{ scope.row.auditorNames || "-" }}</span>
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
      <!-- 添加发票弹窗 -->
      <el-dialog v-model="showAddDialog" title="添加发票" width="1000px" @close="resetAddForm">
        <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="120px">
          <el-row :gutter="40">
            <!-- 左侧 基础信息 -->
            <el-col :span="12" style="border-right: 1px solid #e5e7eb; padding-right: 20px;">
              <el-form-item label="所属客户" prop="customerName">
                <el-button type="primary" @click="showCustomer('add')">选择客户</el-button>
                <span style="margin-left: 10px; color: #999">
                  {{ addForm.customerName || "未选择客户" }}
                </span>
              </el-form-item>
              <el-form-item label="关联合同" prop="contractId" required>
                <el-select v-model="addForm.contractId" placeholder="请选择合同" style="width: 100%">
                  <el-option v-for="item in contractList" :key="item.id" :label="item.contractName" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="关联收款" prop="paymentId">
                <el-select v-model="addForm.paymentId" placeholder="请选择收款" style="width: 100%">
                  <el-option v-for="item in paymentList" :key="item.id" :label="item.amount" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="负责人" prop="userId" required>
                <el-select v-model="addForm.userId" placeholder="请选择负责人" style="width: 100%">
                  <el-option v-for="item in userList" :key="item.id" :label="item.realName" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="发票号码" prop="invoiceNumberCode">
                <el-input v-model="addForm.invoiceNumberCode" placeholder="请输入发票号码" />
              </el-form-item>
              <el-form-item label="开票金额" prop="amount" required>
                <el-input v-model="addForm.amount" type="number" placeholder="请输入开票金额" />
              </el-form-item>
              <el-form-item label="税额" prop="taxAmount" required>
                <el-input v-model="addForm.taxAmount" type="number" placeholder="请输入税额" />
              </el-form-item>
              <el-form-item label="开票日期" prop="invoiceDate" required>
                <el-date-picker v-model="addForm.invoiceDate" type="datetime" placeholder="选择开票日期" style="width: 100%"
                  value-format="YYYY-MM-DDTHH:mm:ss" />
              </el-form-item>
              <el-form-item label="开票类型" prop="invoiceType" required>
                <el-select v-model="addForm.invoiceType" placeholder="请选择开票类型" style="width: 100%">
                  <el-option label="增值税普通发票" :value="0" />
                  <el-option label="增值税专用发票" :value="1" />
                  <el-option label="收据" :value="3" />
                </el-select>
              </el-form-item>
              <el-form-item label="审核人" prop="approverIds" required>
                <el-select v-model="addForm.approverIds" multiple placeholder="请选择审核人" style="width: 100%">
                  <el-option v-for="item in userList" :key="item.id" :label="item.realName" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="发票图片" prop="invoiceImg">
                <el-upload class="avatar-uploader" action="https://localhost:44341/api/app/common/upload-file"
                  :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                  <img v-if="addForm.invoiceImg" :src="addForm.invoiceImg" class="avatar"
                    style="width: 35px; height: 45px" />
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                  <div>上传图片</div>
                </el-upload>
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input v-model="addForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
              </el-form-item>
            </el-col>

            <!-- 右侧 发票信息 -->
            <el-col :span="12">
              <div style="font-weight: bold; margin-bottom: 16px">发票信息</div>
              <el-form-item label="已有发票信息" prop="invoiceInformationId">
                <el-select v-model="addForm.invoiceInformationId" placeholder="请选择发票信息" style="width: 100%">
                  <el-option v-for="item in invoiceInfoList" :key="item.id" :label="item.title" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="发票抬头" prop="title" required>
                <el-input v-model="addForm.title" placeholder="请输入发票抬头" />
              </el-form-item>
              <el-form-item label="纳税识别号" prop="taxNumber" required>
                <el-input v-model="addForm.taxNumber" placeholder="请输入纳税识别号" />
              </el-form-item>
              <el-form-item label="开户行" prop="bank">
                <el-input v-model="addForm.bank" placeholder="请输入开户行" />
              </el-form-item>
              <el-form-item label="开户账号" prop="bankAccount">
                <el-input v-model="addForm.bankAccount" placeholder="请输入开户账号" />
              </el-form-item>
              <el-form-item label="开户地址" prop="billingAddress">
                <el-input v-model="addForm.billingAddress" placeholder="请输入开户地址" />
              </el-form-item>
              <el-form-item label="电话" prop="billingPhone">
                <el-input v-model="addForm.billingPhone" placeholder="请输入电话" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleAddSubmit">提交</el-button>
        </template>
      </el-dialog>

      <!-- 客户选择抽屉 -->
      <el-drawer v-model="showCustomerDrawer" title="客户列表" direction="rtl" size="80%" :with-header="true">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px">
          <el-button type="primary" @click="handleCustomerSubmit">提交</el-button>
          <el-button @click="showCustomerDrawer = false">取消</el-button>
        </div>
        <el-table :data="customerList" style="width: 100%" highlight-current-row>
          <el-table-column width="50" :fixed="true" :label="''">
            <template #default="{ row }">
              <el-radio :model-value="selectedCustomer && selectedCustomer.id" :label="row.id"
                @change="() => handleCustomerRadio(row)">
                &nbsp;
              </el-radio>
            </template>
          </el-table-column>
          <el-table-column prop="id" label="客户编号" />
          <el-table-column prop="customerName" label="客户名称" />
          <el-table-column prop="customerPhone" label="联系电话" />
          <el-table-column prop="creationTime" label="创建时间">
            <template #default="scope">
              {{ scope.row.creationTime.substring(0, 19).replace("T", " ") }}
            </template>
          </el-table-column>
        </el-table>
      </el-drawer>

      <!-- 高级搜索弹窗 -->
      <el-dialog v-model="showAdvancedSearch" title="高级搜索" width="800px" :close-on-click-modal="false" append-to-body>
        <el-form :model="searchForm" label-width="100px" label-position="right">
          <!-- 负责人 -->
          <el-form-item label="负责人">
            <el-select v-model="searchForm.UserId" placeholder="请选择">
              <el-option v-for="item in userList" :key="item.id" :label="item.realName" :value="item.id" />
            </el-select>
          </el-form-item>
          <!-- 创建人 -->
          <el-form-item label="创建人">
            <el-select v-model="searchForm.CreatorId" placeholder="请选择">
              <el-option v-for="item in userList" :key="item.id" :label="item.realName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属客户" prop="customerName">
            <el-button type="primary" @click="showCustomer('search')">选择客户</el-button>
            <span style="margin-left: 10px; color: #999">
              {{ searchForm.CustomerName || "未选择客户" }}
            </span>
          </el-form-item>
          <el-form-item label="关联合同" prop="contractId">
            <el-select v-model="searchForm.ContractId" placeholder="请选择合同" style="width: 100%">
              <el-option v-for="item in contractList" :label="item.contractName" :value="item.id" />
            </el-select>
          </el-form-item>
          <!-- 发票编号 -->
          <el-form-item label="发票编号">
            <el-input v-model="searchForm.InvoiceNumberCode" placeholder="不包含收款前缀" />
          </el-form-item>
          <!-- 开票类型 -->
          <el-form-item label="开票类型">
            <el-select v-model="searchForm.InvoiceType" placeholder="请选择开票类型">
              <el-option label="增值税普通发票" :value="0" />
              <el-option label="增值税专用发票" :value="1" />
              <el-option label="收据" :value="3" />
            </el-select>
          </el-form-item>
          <!-- 开票时间 -->
          <el-form-item label="开票时间">
            <el-date-picker v-model="searchForm.InvoiceDate" type="daterange" range-separator="-"
              start-placeholder="开始时间" end-placeholder="结束时间" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
          <!-- 开票状态 -->
          <el-form-item label="开票状态">
            <el-select v-model="searchForm.InvoiceStatus" placeholder="请选择开票状态">
              <el-option label="未开票" :value="0" />
              <el-option label="已开票" :value="1" />
            </el-select>
          </el-form-item>
          <!-- 收款审核人 -->
          <el-form-item label="收款审核人">
            <el-select v-model="searchForm.ApproverIds" multiple placeholder="选择收款审核人">
              <el-option v-for="item in userList" :key="item.id" :label="item.realName" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showAdvancedSearch = false">取消</el-button>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </template>
      </el-dialog>

      <!-- 详情抽屉 -->
      <el-drawer v-model="showDetailDrawer" title="发票详情" size="60%" direction="rtl" :with-header="false">
        <div style="padding: 24px 32px 0 32px">
          <!-- 顶部编号和按钮 -->
          <div style="display: flex; align-items: center; justify-content: space-between">
            <div style="font-weight: bold; font-size: 18px">
              <el-icon style="color: #409eff; margin-right: 6px">
                <Document />
              </el-icon>
              {{ detailData?.invoiceNumberCode || "-" }}
            </div>
            <div>
              <el-button type="primary" size="small" @click="handleEditDetail">修改</el-button>
              <el-button type="danger" size="small" style="margin-left: 8px" @click="handleDelete(detailData)">
                删除
              </el-button>
            </div>
          </div>
        </div>
        <div style="margin-top: 24px">
          <div style="
              font-weight: bold;
              font-size: 15px;
              border-left: 3px solid #faad14;
              padding-left: 8px;
              margin-bottom: 18px;
            ">
            基本信息
          </div>
          <el-row :gutter="32">
            <!-- 左侧 基础信息 -->
            <el-col :span="12">
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated } from "vue";
import CustomerAPI, { CustomerData } from "@/api/CustomerProcess/Customer/customer.api";
import CrmContractAPI from "@/api/CrmContract/crmcontract";
import PaymentViewAPI from "@/api/Finance/payment.api";
import UserAPI from "@/api/User/user.api";
import RecordAPI from "@/api/Record/record.api";
import InvoiceViewAPI, { InvoicePageQuery } from "@/api/Finance/invoice.api";
import { ElMessage, ElMessageBox } from "element-plus";
import type { UploadProps } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store";

const store = useUserStore();

const router = useRouter();
const route = useRoute();

// 页面加载时获取数据
onMounted(() => {
  GetInvoice();
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

// 时间范围中间变量
const dateRange = ref([]);

// 查看范围和收款进度筛选
const scopeType = ref("all");
const progressType = ref("all");
const currentUserId = store.userInfo.id; // 获取当前登录人ID
console.log("当前登录人ID", currentUserId);

watch([scopeType, progressType], () => {
  // 先清空筛选条件
  searchForm.UserId = "";
  searchForm.CreatorId = "";

  if (scopeType.value === "myDuty") {
    searchForm.UserId = currentUserId?.toString() || ""; // 负责人=当前用户
  } else if (scopeType.value === "myCreate") {
    searchForm.CreatorId = currentUserId?.toString() || ""; // 创建人=当前用户
  }

  GetInvoice();
});

// 搜索表单
const searchForm = reactive({
  StartTime: "",
  EndTime: "",
  UserId: "",
  CreatorId: "",
  CustomerId: "",
  CustomerName: "",
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

      tableData.value = res.data;
      pagination.totalCount = res.totalCount;
      pagination.pageCount = res.pageCount;
    })
    .finally(() => {
      loading.value = false;
    });
};

// 添加弹窗相关
const showAddDialog = ref(false); // 添加发票弹窗
const showCustomerDrawer = ref(false); // 客户选择抽屉

const Addlist = () => {
  showAddDialog.value = true;
};

const addFormRef = ref();
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
// 高级搜索抽屉
const showAdvancedSearch = ref(false);
const search = () => {
  showAdvancedSearch.value = true;
  searchForm.StartTime = "";
  searchForm.EndTime = "";
  searchForm.UserId = "";
  searchForm.CreatorId = "";
  searchForm.CustomerId = "";
  searchForm.ContractId = "";
  searchForm.InvoiceNumberCode = "";
  searchForm.InvoiceType = "";
  searchForm.InvoiceStatus = "";
  searchForm.ApproverIds = [];
  searchForm.InvoiceDate = [];
  GetInvoice(); // 获取合同列表
};

// 搜索
function handleSearch() {
  // 这里将form的内容作为搜索条件，刷新页面或重新请求数据
  showAdvancedSearch.value = false;
  pagination.PageIndex = 1; // 重置到第一页
  GetInvoice();
}

// 监听时间范围变化，自动同步到 StartTime 和 EndTime，并自动查询
function handleDateRangeChange(val: any) {
  searchForm.StartTime = val?.[0] || "";
  searchForm.EndTime = val?.[0] || "";
  GetInvoice();
}

// 客户列表数据（实际应从API获取，这里举例）
const customerList = ref<CustomerData[]>([]);

const customerMode = ref<"add" | "search">("add");

function showCustomer(mode: "add" | "search") {
  customerMode.value = mode;
  showCustomerDrawer.value = true;
  const params = {
    PageIndex: 1,
    PageSize: 111,
  };

  CustomerAPI.GetCustomerPage(params)
    .then((res) => {
      console.log("客户列表数据", res.data);
      customerList.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 当前选中的客户
const selectedCustomer = ref<any>(null);
// 选择客户单选逻辑
function handleCustomerRadio(row: any) {
  selectedCustomer.value = row;
}
// 提交客户选择
function handleCustomerSubmit() {
  if (!selectedCustomer.value) {
    ElMessage.warning("请选择客户");
    return;
  }
  if (customerMode.value === "add") {
    addForm.customerId = selectedCustomer.value.id;
    addForm.customerName = selectedCustomer.value.customerName;
  } else if (customerMode.value === "search") {
    searchForm.CustomerId = selectedCustomer.value.id;
    searchForm.CustomerName = selectedCustomer.value.customerName;
  }
  showCustomerDrawer.value = false;

  // 根据客户ID筛选合同
  GetcontractData(selectedCustomer.value.id);
  // 根据客户ID筛选收款
  GetPaymentData(selectedCustomer.value.id)
}

// 获取合同列表数据
const contractList: any = ref([]);
//显示查询分页
const GetcontractData = async (customerId: string) => {
  const pageForm = reactive({
    PageIndex: 1,
    PageSize: 111,
    CustomerId: customerId,
    CheckType: 0,
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
const GetPaymentData = async (customerId: string) => {
  const params = reactive({
    PageIndex: 1,
    PageSize: 111,
    CustomerId: customerId,
    PaymentStatus: 2
  });

  PaymentViewAPI.GetPaymentPage(params)
    .then((res) => {
      console.log("收款列表数据", res.data);
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



// 重置添加表单
function resetAddForm() {
  addForm.contractId = "";
  addForm.customerId = "";
  addForm.userId = "";
  addForm.remark = "";
  addForm.customerName = "";
  addForm.customerType = "unselected";
}
// 提交添加发票
function handleAddSubmit() {
  addFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // 这里写实际的添加API调用
      InvoiceViewAPI.AddInvoice(addForm).then((res) => {
        debugger;
        if (res) {
          ElMessage.success("添加成功");
        } else {
          ElMessage.error("添加失败");
        }
      });
      showAddDialog.value = false;
      resetAddForm();
      GetInvoice(); // 刷新列表
    } else {
      ElMessage.error("请完善表单信息");
    }
  });
}

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
function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请先选择要删除的数据！");
    return;
  }
  console.log("选中的", selectedRows.value);
  ElMessageBox.confirm(`确定要删除选中的${selectedRows.value.length}条数据吗？`, "提示", {
    type: "warning",
  }).then(() => {
    // 这里假设你有批量删除API
    const ids: string[] = selectedRows.value.map((item: any) => item.id);
    InvoiceViewAPI.BatchDeleteInvoice(ids).then(() => {
      // 提示用户
      ElMessage.success("删除成功");
      // 刷新表格
      GetInvoice();
      // 清空选中
      tableRef.value.clearSelection();
    });
  });
}

function handleExport() {
  location.href = "https://localhost:44341/api/app/invoice/export-async-excel";
}

const showDetailDrawer = ref(false);
const detailData = ref<any>(null);

// 显示详情抽屉
function handleRowClick(row: any) {
  detailData.value = row;
  console.log("点击行数据", row);
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

// 删除发票
function handleDelete(row: any) {
  detailData.value = row;
  ElMessageBox.confirm("确定要删除该发票吗？", "提示", {
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
  console.log("222", editForm);
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
</script>

<style scoped>
.info-row {
  margin-bottom: 10px;
  font-size: 15px;
}

.info-label {
  color: #888;
  min-width: 90px;
  display: inline-block;
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
