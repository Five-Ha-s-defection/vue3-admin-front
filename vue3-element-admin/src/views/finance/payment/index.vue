<template>
  <div>
    <el-card>
      <!-- 顶部筛选区 -->
      <div style="margin-bottom: 16px">
        <div style="display: flex; align-items: center; margin-bottom: 8px">
          <span style="font-weight: bold; font-size: 16px">收款列表</span>
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
        <div style="display: flex; align-items: center; margin-bottom: 8px">
          <el-button type="primary" style="margin-left: 10px; margin-right: 400px" @click="Addlist">
            添加收款
          </el-button>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD"
            style="width: 50px; margin-right: 12px"
            @change="handleDateRangeChange"
          />
          <el-input
            v-model="searchForm.PaymentCode"
            placeholder="应收款编号(不含符号)"
            style="width: 200px; margin-left: 16px"
            clearable
          />
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
      </div>
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        empty-text="暂无数据"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="paymentCode" label="收款编号" >
          <template #default="scope">
            <span class="ellipsis-cell">
              {{ scope.row.paymentCode }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="scope">
            <span
              :style="{
                color:
                  scope.row.paymentStatus === 0
                    ? '#faad14'
                    : scope.row.paymentStatus === 1
                      ? '#1890ff'
                      : scope.row.paymentStatus === 2
                        ? '#52c41a'
                        : scope.row.paymentStatus === 3
                          ? '#f5222d'
                          : '#999',
              }"
            >
              {{
                scope.row.paymentStatus === 0
                  ? "待审核"
                  : scope.row.paymentStatus === 1
                    ? "审核中"
                    : scope.row.paymentStatus === 2
                      ? "已通过"
                      : scope.row.paymentStatus === 3
                        ? "已驳回"
                        : "未知状态"
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="receivablePay" label="应收款" />
        <el-table-column prop="amount" label="实际收款金额" />
        <el-table-column prop="paymentMethodName" label="收款方式" >
          <template #default="scope">
            <span class="ellipsis-cell">
              {{scope.row.paymentMethodName}}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentDate" label="收款时间">
          <template #default="scope">
            <span class="ellipsis-cell">
                {{ scope.row.paymentDate.substring(0, 10) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="所属客户" />
        <el-table-column prop="contractName" label="关联合同" />
        <el-table-column prop="realName" label="负责人" />
        <el-table-column prop="auditorNames" label="审核人" >
          <template #default="scope">
            <span class="ellipsis-cell">
              {{ scope.row.auditorNames || "-" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="creatorRealName" label="创建人" />
      </el-table>

      <!-- 分页区域 -->
      <div style="margin-top: 16px; display: flex; justify-content: center">
        <el-pagination
          v-model:current-page="pagination.PageIndex"
          v-model:page-size="pagination.PageSize"
          :page-sizes="[5, 10, 15, 20]"
          :total="pagination.totalCount"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 添加应收款弹窗 -->
      <el-dialog v-model="showAddDialog" title="添加收款" width="600px" @close="resetAddForm">
        <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="120px">
          <el-form-item label="所属客户" prop="customerName">
            <el-button type="primary" @click="showCustomer('add')">选择客户</el-button>
            <span style="margin-left: 10px; color: #999">
              {{ addForm.customerName || "未选择客户" }}
            </span>
          </el-form-item>
          <!-- 关联合同 -->
          <el-form-item label="关联合同" prop="contractId">
            <el-select v-model="addForm.contractId" placeholder="请选择合同" style="width: 100%">
              <el-option
                v-for="item in contractList"
                :key="item.id"
                :label="item.contractName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <!-- 关联应收款 -->
          <el-form-item label="关联应收款" prop="receivableId">
            <el-select
              v-model="addForm.receivableId"
              placeholder="请选择应收款"
              style="width: 100%"
            >
              <el-option
                v-for="item in receivableList"
                :key="item.id"
                :label="item.receivablePay"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <!-- 负责人 -->
          <el-form-item label="负责人" prop="userId">
            <el-select v-model="addForm.userId" placeholder="请选择负责人" style="width: 100%">
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.realName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <!-- 收款编号 -->
          <el-form-item label="收款编号" prop="paymentCode">
            <el-input v-model="addForm.paymentCode" placeholder="自动生成或手动输入" />
          </el-form-item>
          <!-- 收款金额 -->
          <el-form-item label="收款金额" prop="amount" required>
            <el-input v-model="addForm.amount" placeholder="请输入收款金额" type="number" />
          </el-form-item>
          <!-- 收款方式 -->
          <el-form-item label="收款方式" prop="paymentMethod" required>
            <el-select
              v-model="addForm.paymentMethod"
              placeholder="请选择收款方式"
              style="width: 100%"
            >
              <el-option
                v-for="item in paymentMethodList"
                :label="item.paymentMethodName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <!-- 收款时间 -->
          <el-form-item label="收款时间" prop="paymentDate" required>
            <el-date-picker
              v-model="addForm.paymentDate"
              type="datetime"
              placeholder="选择时间"
              style="width: 100%"
              value-format="YYYY-MM-DDTHH:mm:ss"
            />
          </el-form-item>
          <!-- 审核人 -->
          <el-form-item label="审核人" prop="approverIds" required>
            <el-select
              v-model="addForm.approverIds"
              multiple
              placeholder="请选择审核人"
              style="width: 100%"
            >
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.realName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <!-- 备注 -->
          <el-form-item label="备注" prop="remark">
            <el-input v-model="addForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleAddSubmit">提交</el-button>
        </template>
      </el-dialog>

      <!-- 客户选择抽屉 -->
      <el-drawer
        v-model="showCustomerDrawer"
        title="客户列表"
        direction="rtl"
        size="80%"
        :with-header="true"
      >
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px">
          <el-button type="primary" @click="handleCustomerSubmit">提交</el-button>
          <el-button @click="showCustomerDrawer = false">取消</el-button>
        </div>
        <el-table :data="customerList" style="width: 100%" highlight-current-row>
          <el-table-column
            width="50"
            :fixed="true"
            label=""
          >
            <template #default="{ row }">
              <el-radio
                :model-value="selectedCustomer && selectedCustomer.id"
                :label="row.id"
                @change="() => handleCustomerRadio(row)"
              >
              &nbsp;
              </el-radio>
            </template>
          </el-table-column>
          <el-table-column prop="customerCode" label="客户编号" />
          <el-table-column prop="customerName" label="客户名称" />
          <el-table-column prop="customerPhone" label="联系电话" />
          <el-table-column prop="creationTime" label="创建时间" >
            <template #default="scope">
            {{ scope.row.creationTime.substring(0, 19).replace("T", " ") }}
          </template>
          </el-table-column>
        </el-table>
      </el-drawer>

      <!-- 高级搜索弹窗 -->
      <el-dialog
        v-model="showAdvancedSearch"
        title="高级搜索"
        width="800px"
        :close-on-click-modal="false"
        append-to-body
      >
        <el-form :model="searchForm" label-width="100px" label-position="right">
          <el-form-item label="负责人">
            <el-select v-model="searchForm.UserId" placeholder="请选择">
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.realName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建人">
            <el-select v-model="searchForm.CreatorId" placeholder="请选择创建人">
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.realName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="所属客户" prop="customerName">
            <el-button type="primary" @click="showCustomer('search')">选择客户</el-button>
            <span style="margin-left: 10px; color: #999">
              {{ searchForm.CustomerName || "未选择客户" }}
            </span>
          </el-form-item>
          <el-form-item label="关联合同">
            <el-select v-model="searchForm.ContractId" placeholder="选择关联合同">
              <el-option
                v-for="item in contractList"
                :key="item.id"
                :label="item.contractName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="收款编号">
            <el-input v-model="searchForm.PaymentCode" placeholder="不包含收款编号" />
          </el-form-item>
          <el-form-item label="收款方式">
            <el-select v-model="searchForm.PaymentMethod" placeholder="请选择收款方式">
              <el-option
                v-for="item in paymentMethodList"
                :key="item.value"
                :label="item.paymentMethodName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="收款时间">
            <el-date-picker
              v-model="searchForm.PaymentDate"
              type="date"
              placeholder="选择时间"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="收款状态">
            <el-select v-model="searchForm.PaymentStatus" placeholder="选择收款状态">
              <el-option label="待审核" :value="0" />
              <el-option label="审核中" :value="1" />
              <el-option label="已审核" :value="2" />
              <el-option label="已驳回" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="收款审核人">
            <el-select v-model="searchForm.ApproverIds" multiple placeholder="选择收款审核人">
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.realName"
                :value="item.id"
              />
            </el-select>
            <el-tooltip content="可多选" placement="top">
              <el-icon style="margin-left: 8px">
                <InfoFilled />
              </el-icon>
            </el-tooltip>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showAdvancedSearch = false">取消</el-button>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </template>
      </el-dialog>
    </el-card>

    <el-drawer
      v-model="showDetailDrawer"
      title="收款详情"
      size="60%"
      direction="rtl"
      :with-header="false"
    >
      <div style="padding: 24px 32px 0 32px">
        <!-- 顶部编号和按钮 -->
        <div style="display: flex; align-items: center; justify-content: space-between">
          <div style="font-weight: bold; font-size: 18px">
            <el-icon style="color: #409eff; margin-right: 6px">
              <Document />
            </el-icon>
            {{ detailData?.paymentCode || "-" }}
          </div>
          <div>
            <el-button type="primary" size="small" @click="handleEditDetail">修改</el-button>
            <el-button
              type="danger"
              size="small"
              style="margin-left: 8px"
              @click="handleDelete(detailData)"
            >
              删除
            </el-button>
          </div>
        </div>

        <!-- 基本信息分区 -->
        <div style="margin-top: 24px">
          <div
            style="
              font-weight: bold;
              font-size: 15px;
              border-left: 3px solid #faad14;
              padding-left: 8px;
              margin-bottom: 18px;
            "
          >
            基本信息
          </div>
          <el-row :gutter="32">
            <el-col :span="12">
              <div class="info-row">
                <span class="info-label">收款编号：</span>
                {{ detailData.paymentCode }}
              </div>
              <div class="info-row">
                <span class="info-label">所属客户：</span>
                <el-link type="primary" :underline="false">{{ detailData?.customerName }}</el-link>
              </div>
              <div class="info-row">
                <span class="info-label">应收款：</span>
                {{ detailData.receivablePay }}
              </div>
              <div class="info-row">
                <span class="info-label">收款方式：</span>
                {{ detailData.paymentMethodName }}
              </div>
              <div class="info-row">
                <span class="info-label">负责人：</span>
                {{ detailData.realName }}
              </div>
              <div class="info-row">
                <span class="info-label">创建人：</span>
                {{ detailData.creatorRealName }}
              </div>
              <div class="info-row">
                <span class="info-label">备注：</span>
                {{ detailData.remark || "-" }}
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-row">
                <span class="info-label">状态：</span>
                <span
                  :style="{
                    color:
                      detailData.paymentStatus === 0
                        ? '#faad14'
                        : detailData.paymentStatus === 1
                          ? '#1890ff'
                          : detailData.paymentStatus === 2
                            ? '#52c41a'
                            : detailData.paymentStatus === 3
                              ? '#f5222d'
                              : '#999',
                  }"
                >
                  {{
                    detailData.paymentStatus === 0
                      ? "待审核"
                      : detailData.paymentStatus === 1
                        ? "审核中"
                        : detailData.paymentStatus === 2
                          ? "已通过"
                          : detailData.paymentStatus === 3
                            ? "已驳回"
                            : "未知状态"
                  }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">关联合同：</span>
                <el-link type="primary" :underline="false">{{ detailData?.contractName }}</el-link>
              </div>
              <div class="info-row">
                <span class="info-label">实际收款金额：</span>
                <span style="color: #f5222d">{{ detailData?.amount }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">收款时间：</span>
                {{ detailData.paymentDate.substring(0, 19).replace("T", "") }}
              </div>
              <div class="info-row">
                <span class="info-label">审核人：</span>
                {{ detailData.auditorNames }}
              </div>
              <div class="info-row">
                <span class="info-label">创建时间：</span>
                {{ detailData.creationTime.substring(0, 19).replace("T", "") }}
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 审核信息 -->
        <div
          style="
            font-weight: bold;
            font-size: 15px;
            border-left: 3px solid #faad14;
            padding-left: 8px;
            margin-bottom: 18px;
          "
        >
          审核信息
        </div>
        <el-divider content-position="left"></el-divider>
        <div v-if="detailData.approveComments && detailData.approveComments.length">
          <div
            v-for="(comment, idx) in detailData.approveComments"
            :key="idx"
            style="margin-bottom: 8px; display: flex; align-items: center"
          >
            <el-icon style="margin-right: 4px"><el-icon-user /></el-icon>
            <span style="color: #1890ff">{{ getUserNameById(detailData.approverIds?.[idx]) }}</span>
            <span style="margin-left: 8px; color: #999">
              {{ detailData.approveTimes?.[idx]?.replace("T", " ").substring(0, 16) || "-" }}
            </span>
            <span style="margin-left: 8px">{{ comment || "-" }}</span>
          </div>
        </div>
        <div v-else style="color: #aaa; text-align: center">没有更多了</div>

        <!-- 发票信息 -->
        <div>
          <div
            style="
              font-weight: bold;
              font-size: 15px;
              border-left: 3px solid #faad14;
              padding-left: 8px;
              margin-bottom: 18px;
            "
          >
            发票信息
          </div>
        </div>
        <el-table :data="invoiceList" style="width: 100%; margin-bottom: 16px">
          <el-table-column prop="invoiceNumberCode" label="发票编号" />
          <el-table-column prop="invoiceStatus" label="状态">
            <template #default="scope">
              <span
                :style="{
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
                }"
              >
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
          <el-table-column prop="amount" label="开票金额" />
          <el-table-column prop="invoiceType" label="开票类型">
            <template #default="scope">
              <span class="info-label">开票类型：</span>
              <span v-if="scope.row.invoiceType === 0">增值税普通发票</span>
              <span v-else-if="scope.row.invoiceType === 1">增值税专用发票</span>
              <span v-else-if="scope.row.invoiceType === 3">收据</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="invoiceDate" label="开票时间">
            <template #default="scope">
              {{ scope.row.invoiceDate ? scope.row.invoiceDate.substring(0, 10) : "" }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 操作日志 -->
        <div>
          <div
            style="
              font-weight: bold;
              font-size: 15px;
              border-left: 3px solid #faad14;
              padding-left: 8px;
              margin-bottom: 18px;
            "
          >
            操作日志
          </div>
        </div>
        <el-divider content-position="left"></el-divider>
        <div v-if="recordlist && recordlist.length">
          <div
            v-for="item in recordlist"
            :key="item.id"
            style="margin-bottom: 8px; display: flex; align-items: center"
          >
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
      </div>
    </el-drawer>

    <!-- 修改收款抽屉 -->
    <el-drawer
      v-model="showEditDrawer"
      title="修改收款"
      size="600px"
      direction="rtl"
      :with-header="true"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="addRules" label-width="120px">
        <el-form-item label="所属客户" prop="customerName">
          <el-input v-model="editForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="关联合同" prop="contractId">
          <el-select
            v-model="editForm.contractId"
            placeholder="请选择合同"
            style="width: 100%"
            disabled
          >
            <el-option
              v-for="item in contractList"
              :key="item.id"
              :label="item.contractName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联应收款" prop="receivableId">
          <el-select
            v-model="editForm.receivableId"
            placeholder="请选择应收款"
            style="width: 100%"
            disabled
          >
            <el-option
              v-for="item in receivableList"
              :key="item.id"
              :label="item.receivablePay"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="userId">
          <el-select v-model="editForm.userId" placeholder="请选择负责人" style="width: 100%">
            <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.realName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="收款编号" prop="paymentCode">
          <el-input v-model="editForm.paymentCode" />
        </el-form-item>
        <el-form-item label="收款金额" prop="amount">
          <el-input v-model="editForm.amount" type="number" />
        </el-form-item>
        <el-form-item label="收款方式" prop="paymentMethod">
          <el-select
            v-model="editForm.paymentMethod"
            placeholder="请选择收款方式"
            style="width: 100%"
          >
            <el-option
              v-for="item in paymentMethodList"
              :label="item.paymentMethodName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="收款时间" prop="paymentDate">
          <el-date-picker
            v-model="editForm.paymentDate"
            type="datetime"
            placeholder="选择时间"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="审核人" prop="approverIds">
          <el-select
            v-model="editForm.approverIds"
            multiple
            placeholder="请选择审核人"
            style="width: 100%"
          >
            <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.realName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="editForm.remark" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleEditSubmit">提交</el-button>
          <el-button @click="showEditDrawer = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated } from "vue";
import ReceivablesViewAPI from "@/api/Finance/receivables.api";
import PaymentViewAPI, { PaymentSearch } from "@/api/Finance/payment.api";
import CustomerAPI from "@/api/CustomerProcess/Customer/customer.api";
import CrmContractAPI from "@/api/CrmContract/crmcontract";
import UserAPI from "@/api/User/user.api";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import InvoiceViewAPI from "@/api/Finance/invoice.api";
import { useUserStore } from "@/store";
import RecordAPI from "@/api/Record/record.api";
const store = useUserStore();

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const tableData = ref<PaymentSearch[]>([]);

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

  GetPayment();
});

// 搜索表单
const searchForm = reactive({
  UserId: "",
  CreatorId: "",
  CustomerId: "",
  CustomerName:"",
  ContractId: "",
  PaymentCode: "",
  PaymentMethod: "",
  PaymentDate: "",
  PaymentStatus: "",
  ApproverIds: [],
  StartTime: "",
  EndTime: "",
  scopeType: "all",
  progressType: "all",
});
// 获取收款数据
const GetPayment = () => {
  loading.value = true;
  const params = {
    PageIndex: pagination.PageIndex,
    PageSize: pagination.PageSize,
    StartTime: searchForm.StartTime,
    EndTime: searchForm.EndTime,
    UserId: searchForm.UserId,
    CreatorId: searchForm.CreatorId,
    PaymentCode: searchForm.PaymentCode,
    CustomerId: searchForm.CustomerId,
    ContractId: searchForm.ContractId,
    PaymentMethod: searchForm.PaymentMethod,
    PaymentDate: searchForm.PaymentDate,
    PaymentStatus: searchForm.PaymentStatus,
    ApproverIds: searchForm.ApproverIds,
  };

  PaymentViewAPI.GetPaymentPage(params)
    .then((res) => {
      tableData.value = res.data;
      pagination.totalCount = res.totalCount;
      pagination.pageCount = res.pageCount;
    })
    .finally(() => {
      loading.value = false;
    });
};

const receivableList: any = ref([]); // 用于存储应收款列表数据
// 获取应收款数据
const GetReceivables = () => {
  loading.value = true;
  const params = {
    PageIndex: 1,
    PageSize: 111,
  };

  ReceivablesViewAPI.GetReceivablesPage(params)
    .then((res) => {
      console.log("应收款数据", res);

      receivableList.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

// 收款方式列表
const paymentMethodList: any = ref([]);
const GetPaymentMethodList = () => {
  PaymentViewAPI.GetPaymentMeathod()
    .then((res) => {
      console.log("收款方式数据", res);
      paymentMethodList.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

// 添加弹窗相关
const showAddDialog = ref(false); // 添加应收款弹窗
const showCustomerDrawer = ref(false); // 客户选择抽屉

const Addlist = () => {
  showAddDialog.value = true;
};

const addFormRef = ref();
const addForm = reactive({
  customerId: "",
  contractId: "",
  receivableId: "",
  userId: "",
  paymentCode: "",
  amount: null,
  paymentMethod: "",
  paymentDate: "",
  approverIds: [],
  remark: "",
  paymentStatus: 0,
  customerName: "",
});

const addRules = {
  customerId: [{ required: true, message: "请选择客户", trigger: "change" }],
  contractId: [{ required: true, message: "请选择合同", trigger: "change" }],
  receivableId: [{ required: false }],
  userId: [{ required: true, message: "请选择负责人", trigger: "change" }],
  amount: [{ required: true, message: "请输入收款金额", trigger: "blur" }],
  paymentMethod: [{ required: true, message: "请选择收款方式", trigger: "change" }],
  paymentDate: [{ required: true, message: "请选择收款时间", trigger: "change" }],
  approverIds: [{ required: true, message: "请选择审核人", trigger: "change" }],
};

// 分页大小改变
function handleSizeChange(val: number) {
  pagination.PageSize = val;
  pagination.PageIndex = 1; // 重置到第一页
  GetPayment();
}

// 当前页改变
function handleCurrentChange(val: number) {
  pagination.PageIndex = val;
  GetPayment();
}
// 高级搜索抽屉
const showAdvancedSearch = ref(false);
const search = () => {
  showAdvancedSearch.value = true;
  searchForm.UserId = "";
  searchForm.CreatorId = "";
  searchForm.CustomerId = "";
  searchForm.ContractId = "";
  searchForm.PaymentCode = "";
  searchForm.PaymentMethod = "";
  searchForm.PaymentDate = "";
  searchForm.PaymentStatus = "";
  searchForm.ApproverIds = [];
};

// 搜索
function handleSearch() {
  // 这里将form的内容作为搜索条件，刷新页面或重新请求数据
  showAdvancedSearch.value = false;
  pagination.PageIndex = 1; // 重置到第一页
  GetPayment();
}

// 监听时间范围变化，自动同步到 StartTime 和 EndTime，并自动查询
function handleDateRangeChange(val: any) {
  searchForm.StartTime = val?.[0] || "";
  searchForm.EndTime = val?.[0] || "";
  GetPayment();
}

// 客户列表数据（实际应从API获取，这里举例）
const customerList = ref([]);
// 客户选择
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
      pagination.totalCount = res.totalCount;
      pagination.pageCount = res.pageCount;
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

// 重置添加表单
function resetAddForm() {
  addForm.contractId = "";
  addForm.customerId = "";
  addForm.receivableId = "";
  addForm.userId = "";
  addForm.paymentCode = "";
  addForm.amount = null;
  addForm.paymentMethod = "";
  addForm.paymentDate = "";
  addForm.approverIds = [];
  addForm.remark = "";
  addForm.paymentStatus = 0;
}
// 提交添加应收款
function handleAddSubmit() {
  addFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // 这里写实际的添加API调用
      PaymentViewAPI.AddPayment(addForm).then((res) => {
        if (res) {
          ElMessage.success("添加成功");
        } else {
          ElMessage.error("添加失败");
        }
      });
      showAddDialog.value = false;
      resetAddForm();
      GetPayment(); // 刷新列表
    } else {
      ElMessage.error("请完善表单信息");
    }
  });
}

// 页面加载时获取数据
onMounted(() => {
  GetPayment();
  GetPaymentMethodList();
  GetReceivables();
  GetcontractData();
  UserData();
});

// 路由激活时刷新（用于Add.vue返回后刷新列表）
onActivated(() => {
  // 判断是否带有刷新标记
  if (route.query.refresh) {
    GetPayment();
    // 清除刷新标记，避免重复刷新
    router.replace({ query: { ...route.query, refresh: undefined } });
  }
});

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
    PaymentViewAPI.BatchDeletePayment(ids).then(() => {
      // 提示用户
      ElMessage.success("删除成功");
      // 刷新表格
      GetPayment();
      // 清空选中
      tableRef.value.clearSelection();
    });
  });
}

function handleExport() {
  location.href = "https://localhost:44341/api/app/payment/export-async-excel";
}

const showDetailDrawer = ref(false);
// 用于存储收款详情数据
const detailData: any = ref({});
// 用于存储发票列表数据
const invoiceList: any = ref([]);

function handleRowClick(row: any) {
  detailData.value = row;
  showDetailDrawer.value = true;
  fetchInvoiceList(row.id);
  RecordData(row.id); // 获取操作日志列表数据
}
// 获取发票列表数据
function fetchInvoiceList(PaymentId: string) {
  InvoiceViewAPI.GetInvoicePayment(PaymentId)
    .then((res) => {
      invoiceList.value = res || [];
    })
    .catch(() => {
      invoiceList.value = [];
    });
}

// 获取操作日志列表数据
const recordlist: any = ref([]);
//显示查询分页
const RecordData = async (id: any) => {
  const params = {
    bizType: "payment",
  };
  console.log("操作日志列表数据id", id);
  try {
    const list = await RecordAPI.GetRecord(params, id);
    console.log("操作日志列表数据:", list);
    recordlist.value = list || [];
  } catch (err: any) {
    console.error("获取操作日志列表失败:", err.message);
  }
};

// 删除应收款
function handleDelete(row: any) {
  detailData.value = row;
  ElMessageBox.confirm("确定要删除该收款吗？", "提示", {
    type: "warning",
  }).then(() => {
    PaymentViewAPI.DeletePayment(row.id)
      .then(() => {
        ElMessage.success("删除成功");
        GetReceivables(); // 重新加载数据
      })
      .catch((error) => {
        console.error("删除失败:", error);
        ElMessage.error("删除失败");
      });
  });
}

// 修改收款
const showEditDrawer = ref(false);
const editFormRef = ref();
const editForm = reactive({
  customerId: "",
  contractId: "",
  receivableId: "",
  userId: "",
  paymentCode: "",
  amount: null,
  paymentMethod: "",
  paymentDate: "",
  approverIds: [],
  remark: "",
  paymentStatus: 0,
  customerName: "",
});
function handleEditDetail() {
  // 反填数据
  Object.assign(editForm, detailData.value);
  showEditDrawer.value = true;
}
function handleEditSubmit() {
  editFormRef.value.validate((valid: boolean) => {
    if (!valid) return;
    PaymentViewAPI.UpdatePayment(detailData.value.id, editForm).then((res) => {
      if (res) {
        ElMessage.success("修改成功");
        showEditDrawer.value = false;
        showDetailDrawer.value = false;
        GetPayment();
      } else {
        ElMessage.error("修改失败");
      }
    });
  });
}

// 通过用户ID获取用户姓名(审核信息)
function getUserNameById(id: any) {
  const user = userList.value.find((u: any) => u.id === id);
  return user ? user.realName : id || "-";
}
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
  white-space: nowrap;      /* 禁止换行 */
  overflow: hidden;         /* 隐藏溢出内容 */
  text-overflow: ellipsis;  /* 显示省略号（可选） */
  max-width: 100%;          /* 确保不超出单元格 */
}
</style>
