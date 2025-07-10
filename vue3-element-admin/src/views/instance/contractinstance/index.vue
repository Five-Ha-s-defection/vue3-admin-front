<template>
  <div class="contract-query-ui">
    <!-- 查询板块 -->
    <el-card>
      <div class="header">
        <span class="title">合同列表</span>
        <span class="total">
          | 总记录数：
          <span class="count">{{ pageinfo.totalCount }}</span>
          条
        </span>
      </div>
      <div class="query-bar">
        <div class="row mt-2">
          <span>选择时间</span>
          &nbsp;&nbsp;&nbsp;
          <el-date-picker v-model="searchForm.BeginTime" type="date" size="small" placeholder="开始时间"
            style="width: 200px" @change="getTableData" />
          --
          <el-date-picker v-model="searchForm.EndTime" type="date" size="small" placeholder="结束时间" style="width: 200px"
            @change="getTableData" />
          <el-radio-group v-model="searchForm.SearchTimeType" class="ml-4" size="small" @change="getTableData">
            <el-radio label="创建时间" :value="0">创建时间</el-radio>
            <el-radio label="签订日期" :value="1">签订日期</el-radio>
            <el-radio label="生效日期" :value="2">生效日期</el-radio>
            <el-radio label="截止日期" :value="3">截止日期</el-radio>
          </el-radio-group>
        </div>
        <div class="row mt-2 flex-between">
          <el-button type="primary" icon="Plus" size="small" @click="goAddContract">
            添加合同
          </el-button>
          <div class="right-group">
            <el-input v-model="searchForm.ContractName" placeholder="合同名称" class="ml-4" style="width: 220px" clearable
              size="small">
              <template #suffix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
            <el-button class="ml-2" icon="Filter" plain size="small" @click="showAdvancedSearch = true">
              高级搜索
            </el-button>
            <el-dropdown class="ml-2">
              <el-button size="small">
                操作
                <el-icon>
                  <ArrowDown />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="deleteManyContracts">删除合同</el-dropdown-item>
                  <el-dropdown-item>导出数据</el-dropdown-item>
                  <el-dropdown-item>导入excel</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 高级搜索组件 -->
    <el-dialog v-model="showAdvancedSearch" title="高级搜索" width="60%" destroy-on-close>
      <div class="search-form">
        <!-- 满足条件 -->
        <div class="form-item">
          <span class="label">满足条件</span>
          <el-radio-group v-model="searchForm.CheckType" class="flexstyle" size="small">
            <el-radio :label="1">全部满足</el-radio>
            <el-radio :label="2">部分满足</el-radio>
          </el-radio-group>
          <el-tooltip content="全部满足：所有条件都必须匹配；部分满足：任意条件匹配即可" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>

        <!-- 负责人 -->
        <div class="form-item">
          <span class="label">负责人</span>
          <el-select v-model="searchForm.UserIds" placeholder="请选择" clearable multiple size="small" style="width: 400px"
            class="flexstyle">
            <el-option v-for="item in users" :key="item.id" :label="item.realName" :value="item.id" />
          </el-select>
        </div>

        <!-- 创建人 -->
        <div class="form-item">
          <span class="label">创建人</span>
          <el-select v-model="searchForm.CreateUserIds" placeholder="请选择" clearable multiple size="small"
            style="width: 400px" class="flexstyle">
            <el-option v-for="item in users" :key="item.id" :label="item.realName" :value="item.id" />
          </el-select>
        </div>

        <!-- 所属客户 -->
        <div style="display: flex; align-items: center">
          <span class="label">所属客户</span>
          <template v-if="searchForm.CustomerId">
            <el-tag type="success" closable style="margin-right: 10px" @close="clearSelectedCustomer">
              {{ getSelectedCustomerName() }}
            </el-tag>
          </template>
          <template v-else>
            <span style="color: #aaa; margin-right: 10px">未选择客户</span>
          </template>
          <el-button type="primary" size="small" @click="selectCustomer">选择客户</el-button>
          <el-tooltip content="选择需要筛选的客户" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>

        <!-- 合同金额 -->
        <div class="form-item">
          <span class="label">合同金额</span>
          <el-input v-model="searchForm.ContractProceeds" type="number" placeholder="请输入金额" size="small"
            style="width: 400px" class="flexstyle" />
          <el-tooltip content="输入合同金额进行搜索" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>

        <!-- 签订日期 -->
        <div class="form-item">
          <span class="label">签订日期</span>
          <el-date-picker v-model="searchForm.SignDate" type="date" placeholder="选择时间" size="small" style="width: 400px"
            class="flexstyle" />
          <el-tooltip content="选择合同签订日期" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>

        <!-- 合同名称 -->
        <div class="form-item">
          <span class="label">合同名称</span>
          <el-input v-model="searchForm.ContractName" placeholder="请输入合同名称" size="small" style="width: 400px"
            class="flexstyle" />
          <el-tooltip content="输入合同名称进行模糊搜索" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>

        <!-- 生效日期 -->
        <div class="form-item">
          <span class="label">生效日期</span>
          <el-date-picker v-model="searchForm.CommencementDate" type="date" placeholder="选择时间" size="small"
            style="width: 400px" class="flexstyle" />
          <el-tooltip content="选择合同生效日期" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>

        <!-- 截止日期 -->
        <div class="form-item">
          <span class="label">截止日期</span>
          <el-date-picker v-model="searchForm.ExpirationDate" type="date" placeholder="选择时间" size="small"
            style="width: 400px" class="flexstyle" />
          <el-tooltip content="选择合同截止日期" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>

        <!-- 经销商 -->
        <div class="form-item">
          <span class="label">经销商</span>
          <el-input v-model="searchForm.Dealer" placeholder="请输入经销商" size="small" style="width: 400px"
            class="flexstyle" />
          <el-tooltip content="输入经销商名称进行模糊搜索" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button size="small" @click="handleCancel">取消</el-button>
          <el-button type="primary" size="small" @click="handleSearch">搜索</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 客户选择对话框 -->
    <el-dialog v-model="showCustomerDialog" title="客户列表" width="60%" destroy-on-close>
      <div style="display: flex; justify-content: flex-end; margin-bottom: 10px">
        <el-button type="primary" @click="handleCustomerSubmit">提交</el-button>
        <!-- <el-button @click="showCustomerDialog = false">取消</el-button> -->
      </div>
      <el-table :data="customerList" style="width: 100%; height: 600px" highlight-current-row
        @row-click="handleCustomerRowClick">
        <el-table-column label="" width="50" align="center">
          <template #default="{ row }">
            <el-radio :model-value="selectedCustomerId" :label="row.id" @change="() => handleCustomerRadio(row)">
              <span style="display: none">{{ row.id }}</span>
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="客户编号" />
        <el-table-column prop="customerName" label="客户名称" />
        <el-table-column prop="customerPhone" label="联系电话" />
        <el-table-column prop="creationTime" label="创建时间">
          <template #default="{ row }">
            {{ row.creationTime.substring(0, 10) }} {{ row.creationTime.substring(11, 16) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 表格板块 -->
    <el-card style="margin-top: 10px">
      <el-table :data="tableData" border style="width: 100%" size="small" @row-click="handleRowClick"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="paymentStatus" label="状态" width="80" align="center">
          <template #default="{ row }">
            <span :style="{
              color:
                row.paymentStatus === 0
                  ? '#faad14'
                  : row.paymentStatus === 1
                    ? '#1890ff'
                    : row.paymentStatus === 2
                      ? '#52c41a'
                      : row.paymentStatus === 3
                        ? '#f5222d'
                        : '#999',
            }">
              {{
                row.paymentStatus === 0
                  ? "待审核"
                  : row.paymentStatus === 1
                    ? "审核中"
                    : row.paymentStatus === 2
                      ? "已通过"
                      : row.paymentStatus === 3
                        ? "已驳回"
                        : "未知状态"
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="contractProceeds" label="合同金额" align="center" />
        <el-table-column prop="paymentreceived" label="已收款" align="center" />
        <el-table-column prop="remaining" label="剩余应收" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.remaining > 0 ? '#f5222d' : '#333' }">
              {{ (row.accountsreceivable - row.paymentreceived).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="收款进度" align="center">
          <template #default="{ row }">
            <span>
              {{
                typeof row.accountsreceivable === "number" && row.accountsreceivable > 0
                  ? ((row.paymentreceived / row.accountsreceivable) * 100).toFixed(2) + "%"
                  : "0.00%"
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="signDate" label="签订日期" align="center" width="130">
          <template #default="{ row }">
            {{ row.signDate.substring(0, 10) }} {{ row.signDate.substring(11, 19) }}
          </template>
        </el-table-column>
        <el-table-column prop="contractName" label="合同名称" align="center" />
        <el-table-column prop="expirationDate" label="截止日期" align="center" width="130">
          <template #default="{ row }">
            {{ row.expirationDate.substring(0, 10) }} {{ row.expirationDate.substring(11, 19) }}
          </template>
        </el-table-column>
        <el-table-column prop="dealer" label="经销商" align="center" />
        <el-table-column prop="customerName" label="所属客户" align="center" />
        <el-table-column prop="auditorNames" label="审核人" />
        <el-table-column prop="creationTime" label="创建时间" align="center" width="130">
          <template #default="{ row }">
            {{ row.creationTime.substring(0, 10) }} {{ row.creationTime.substring(11, 16) }}
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="负责人" align="center" />
        <el-table-column prop="createUserName" label="创建人" align="center" />
      </el-table>
    </el-card>

    <!-- 合同表的抽屉 -->
    <el-drawer v-model="showDetailDrawer" direction="rtl" size="70%" :with-header="true">
      <div style="padding: 24px 32px 0 32px">
        <!-- 顶部编号和按钮 -->
        <div style="display: flex; align-items: center; justify-content: space-between">
          <div style="font-weight: bold; font-size: 18px">
            <el-icon style="color: #409eff; margin-right: 6px">
              <Document />
            </el-icon>
            {{ currentDetail?.id || "-" }}
          </div>
          <div>
            <el-button type="primary" size="small" @click="openEditDrawer" @close="resetEditForm">
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
            <el-button type="danger" size="small" style="margin-left: 8px" @click="handleDelete(currentDetail)">
              删除
            </el-button>
          </div>
        </div>
        <div style="margin-top: 24px">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="合同详情" name="contract">
              <div v-if="currentDetail">
                <el-row :gutter="32">
                  <!-- 左侧 基本信息 -->
                  <el-col :span="12">
                    <div class="info-row">
                      <span class="info-label">合同编号：</span>
                      {{ currentDetail.id || "-" }}
                    </div>
                    <div class="info-row">
                      <span class="info-label">所属客户：</span>
                      {{ currentDetail.customerName || "-" }}
                    </div>
                    <div class="info-row">
                      <span class="info-label">签订日期：</span>
                      {{ currentDetail.signDate?.replace("T", " ").substring(0, 16) || "-" }}
                    </div>
                    <div class="info-row">
                      <span class="info-label">开始日期：</span>
                      {{
                        currentDetail.commencementDate?.replace("T", " ").substring(0, 16) || "-"
                      }}
                    </div>
                    <div class="info-row">
                      <span class="info-label">截止日期：</span>
                      {{ currentDetail.expirationDate?.replace("T", " ").substring(0, 16) || "-" }}
                    </div>
                    <div class="info-row">
                      <span class="info-label">经销商：</span>
                      {{ currentDetail.dealer || "-" }}
                    </div>
                    <div class="info-row">
                      <span class="info-label">合同扫描件:</span>
                      <img v-if="currentDetail.contractScanning" :src="currentDetail.contractScanning"
                        style="width: 35px; height: 45px" />
                      <span v-else>-</span>
                    </div>
                  </el-col>

                  <!-- 右侧 基本信息 -->
                  <el-col :span="12">
                    <div class="info-row">
                      <span class="info-label">合同名称：</span>
                      {{ currentDetail.contractName || "-" }}
                    </div>
                    <div class="info-row">
                      <span class="info-label">合同金额：</span>
                      {{ currentDetail.contractProceeds || "-" }}
                    </div>
                    <div class="info-row">
                      <span class="info-label">创建人：</span>
                      {{ currentDetail.createUserName || "-" }}
                    </div>
                    <div class="info-row">
                      <span class="info-label">负责人：</span>
                      {{ currentDetail.userName || "-" }}
                    </div>
                    <div class="info-row">
                      <span class="info-label">创建时间：</span>
                      {{ currentDetail.creationTime?.replace("T", " ").substring(0, 16) || "-" }}
                    </div>
                    <div class="info-row">
                      <span class="info-label">合同条款：</span>
                      {{ stripHtml(currentDetail.contractTerms || "-") }}
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
              <div v-if="currentDetail.approveComments && currentDetail.approveComments.length">
                <div v-for="(comment, idx) in currentDetail.approveComments" :key="idx"
                  style="margin-bottom: 8px; display: flex; align-items: center">
                  <el-icon style="margin-right: 4px"><el-icon-user /></el-icon>
                  <span style="color: #1890ff">
                    {{ getUserNameById(currentDetail.approverIds?.[idx]) }}
                  </span>
                  <span style="margin-left: 8px; color: #999">
                    {{
                      currentDetail.approveTimes?.[idx]?.replace("T", " ").substring(0, 16) || "-"
                    }}
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
                <div v-for="item in recordlist" :key="item.id"
                  style="margin-bottom: 8px; display: flex; align-items: center">
                  <el-icon style="vertical-align: middle; margin-right: 4px">
                    <el-icon-user />
                  </el-icon>
                  <span style="color: #1890ff">
                    <!-- 操作人ID（如有名字可替换为名字） -->
                    {{ item.creatorName || "-" }}
                  </span>
                  <span style="margin-left: 8px; color: #999">
                    <!-- 操作时间 -->
                    {{
                      item.creationTime ? item.creationTime.replace("T", " ").substring(0, 16) : "-"
                    }}
                  </span>
                  <span style="margin-left: 8px">
                    <!-- 操作内容 -->
                    {{ item.action || "-" }}
                  </span>
                </div>
              </div>
              <div v-else style="color: #aaa; text-align: center">没有更多了</div>
            </el-tab-pane>
            <el-tab-pane label="产品详情" name="product">
              <el-table :data="productList" style="width: 100%; margin-bottom: 16px">
                <el-table-column prop="productImageUrl" label="图片" width="80">
                  <template #default="{ row }">
                    <el-image :src="row.productImageUrl" style="width: 40px; height: 40px" fit="cover" />
                  </template>
                </el-table-column>
                <el-table-column prop="productBrand" label="产品名称" />
                <el-table-column prop="productCode" label="产品编号" />
                <el-table-column prop="sellPrice" label="售价" />
                <el-table-column prop="buyProductNum" label="数量" />
                <el-table-column prop="sumPrice" label="总价" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-drawer>

    <!-- 合同修改抽屉 -->
    <el-drawer v-model="showEditDrawer" title="修改合同" size="70%">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="110px" class="add-contract-form"
        size="small">
        <el-row :gutter="24">
          <!-- 左侧：合同基本信息 -->
          <el-col :span="12">
            <el-form-item label="负责人" prop="userId" required>
              <el-select v-model="editForm.userId" placeholder="请选择负责人" style="width: 100%" clearable>
                <el-option v-for="item in users" :key="item.id" :label="item.realName" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="合同金额" prop="contractProceeds">
              <el-input v-model.number="editForm.contractProceeds" type="number" placeholder="请输入合同金额" />
            </el-form-item>
            <el-form-item label="签订日期" prop="signDate">
              <el-date-picker v-model="editForm.signDate" type="datetime" placeholder="选择签订日期" style="width: 100%" />
            </el-form-item>
            <el-form-item label="合同名称" prop="contractName">
              <el-input v-model="editForm.contractName" placeholder="请输入合同名称" />
            </el-form-item>
            <el-form-item label="生效日期" prop="commencementDate">
              <el-date-picker v-model="editForm.commencementDate" type="datetime" placeholder="选择生效日期"
                style="width: 100%" />
            </el-form-item>
            <el-form-item label="截止日期" prop="expirationDate">
              <el-date-picker v-model="editForm.expirationDate" type="datetime" placeholder="选择截止日期"
                style="width: 100%" />
            </el-form-item>
            <el-form-item label="经销商" prop="dealer">
              <el-input v-model="editForm.dealer" placeholder="请输入经销商" />
            </el-form-item>
            <el-form-item label="合同条款" prop="contractTerms">
              <WangEditor v-model="editForm.contractTerms" type="textarea" :rows="4" placeholder="请输入合同条款" />
            </el-form-item>
            <el-form-item label="审核人" prop="approverIds">
              <el-select v-model="editForm.auditorId" multiple placeholder="请选择审核人" style="width: 100%">
                <el-option v-for="item in userList" :key="item.id" :label="item.realName" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="合同扫描件">
              <el-upload class="avatar-uploader" action="https://localhost:44341/api/app/common/upload-file"
                :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                <img v-if="editForm.contractScanning" :src="editForm.contractScanning" class="avatar"
                  style="width: 35px; height: 45px" />
                <el-icon v-else class="avatar-uploader-icon">
                  <Plus />
                </el-icon>
                <div>上传图片</div>
              </el-upload>
            </el-form-item>
            <div>
              <el-button type="primary" @click="handleEditSubmit">提交</el-button>
              <el-button @click="showEditDrawer = false">取消</el-button>
            </div>
          </el-col>
          <!-- 右侧：产品明细 -->
          <el-col :span="12">
            <div class="form-title-row">
              <div class="form-title">产品明细</div>
            </div>
            <el-button type="primary" size="small" style="margin-bottom: 8px" @click="openEditProductDialog">
              添加产品
            </el-button>
            <el-table :data="editProductList" style="width: 100%; margin-bottom: 16px">
              <el-table-column prop="productImageUrl" label="图片" width="80">
                <template #default="{ row }">
                  <el-image :src="row.productImageUrl" style="width: 40px; height: 40px" fit="cover" />
                </template>
              </el-table-column>
              <el-table-column prop="productBrand" label="产品名称" />
              <el-table-column prop="productCode" label="产品编号" />
              <el-table-column label="售价">
                <template #default="{ row }">
                  <el-input v-model.number="row.sellPrice" size="small" @input="updateEditSumPrice(row)" />
                </template>
              </el-table-column>
              <el-table-column label="数量">
                <template #default="{ row }">
                  <el-input v-model.number="row.buyProductNum" size="small" @input="updateEditSumPrice(row)" />
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
              <span style="color: #409eff">{{ editTotalAmount.toFixed(2) }}</span>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-drawer>

    <!-- 审核/驳回弹窗 -->
    <el-dialog
      v-model="showApproveDialog"
      :title="approveType == true ? '审核通过' : '审核驳回'"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form>
        <el-form-item label="原因（非必填）" label-width="100px">
          <el-input
            v-model="approveComment"
            type="textarea"
            :rows="4"
            placeholder="请输入原因（可不填）"
            prefix-icon="el-icon-smile"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="handleApproveSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>

  <!-- 产品列表和多选 -->
  <el-dialog v-model="showProductDialog" title="选择产品" width="800px" @close="handleProductDialogClose">
    <el-table ref="productTableRef" v-loading="productLoading" :data="getproductList" :row-key="'id'"
      style="width: 100%" height="350" border @selection-change="handleProductSelectionChange">
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
</template>

<script setup lang="ts">
import CrmContractAPI from "@/api/CrmContract/crmcontract";
import UserAPI from "@/api/User/user.api";
import CustomerAPI from "@/api/CustomerProcess/Customer/customer.api";
import RecordAPI from "@/api/Record/record.api";
import ProductApi from "@/api/CxsApi/CxsProductApi"; // 按你的实际路径引入
import { useRouter } from "vue-router";
import type { UploadProps } from "element-plus";
import "@wangeditor/editor/dist/css/style.css";
import { useUserStore } from "@/store";

const store = useUserStore();

const router = useRouter();

//#region 显示数据查询分页
// 定义合同数据类型
interface ContractItem {
  id: string;
  customerId: string;
  customerName: string;
  businessOpportunityId: string;
  userId: string;
  userName: string;
  createUserName: string;
  signDate: string; // ISO 日期字符串
  contractName: string;
  commencementDate: string;
  expirationDate: string;
  dealer: string;
  contractTerms: string;
  auditorId: string[]; // 审核人ID列表
  contractScanning: string;
  attachment: string;
  contractProceeds: number; // 合同金额
  paymentStatus: number; // 支付状态
  isDeleted: boolean;
  deleterId: string;
  deletionTime: string;
  lastModificationTime: string;
  lastModifierId: string;
  creationTime: string;
  creatorId: string;
}

const searchForm = reactive({
  SearchTimeType: 0, // 查询时间类型 0:创建时间 1:签订日期 2:生效日期 3:截至日期
  BeginTime: "", // 开始时间
  EndTime: "", // 结束时间
  CheckType: 0, // 查询方式 0:不使用高级搜索 1:使用全部满足条件搜索 2:部分满足条件搜索
  UserIds: [], // 负责用户
  CreateUserIds: [], // 创建人
  CustomerId: "", // 客户ID
  ContractName: "", // 合同名称
  SignDate: "", // 签订日期
  CommencementDate: "", // 生效日期
  ExpirationDate: "", // 截止日期
  Dealer: "", // 经销商
  ContractProceeds: 0, // 合同金额
  PageIndex: 1,
  PageSize: 10,
});

const tableData: any = ref<ContractItem[]>([]);
const pageinfo = reactive({
  pageCount: 0,
  totalCount: 0,
});

const showAdvancedSearch = ref(false);

// 高级搜索取消
function resetSearchForm() {
  searchForm.SearchTimeType = 0;
  searchForm.BeginTime = "";
  searchForm.EndTime = "";
  searchForm.CheckType = 0;
  searchForm.UserIds = [];
  searchForm.CreateUserIds = [];
  searchForm.CustomerId = "";
  searchForm.ContractName = "";
  searchForm.SignDate = "";
  searchForm.CommencementDate = "";
  searchForm.ExpirationDate = "";
  searchForm.Dealer = "";
  searchForm.ContractProceeds = 0;
  searchForm.PageIndex = 1;
  searchForm.PageSize = 10;
}
const handleCancel = () => {
  resetSearchForm();
  showAdvancedSearch.value = false;
  getTableData();
};

// 高级搜索确认
const handleSearch = () => {
  showAdvancedSearch.value = false;
  getTableData();
};

//显示查询分页
const getTableData = async () => {
  try {
    const res: any = await CrmContractAPI.getInfo(searchForm);

    // 如果返回的是数组，进行数据转换
    if (Array.isArray(res)) {
      tableData.value = res.map((item) => ({
        // 将API返回的数据映射到表格需要的字段
        id: item.id || "",
        status: item.status || "待审核",
        amount: item.amount || item.contractAmount || 0,
        received: item.received || item.receivedAmount || 0,
        remaining:
          (item.amount || item.contractAmount || 0) - (item.received || item.receivedAmount || 0),
        progress: item.progress || "0%",
        signDate: item.signDate || item.createTime,
        name: item.contractName || item.name || "未命名合同",
        endDate: item.expirationDate || item.endDate,
        dealer: item.dealer || "",
        customer: item.customerName || item.customer || "",
        createTime: item.createTime || "",
        manager: item.manager || "",
        createUser: item.createUser || "",
      }));
      pageinfo.totalCount = res.length;
    } else if (res && res.data) {
      // 处理标准API返回格式
      tableData.value = res.data || [];
      console.log(tableData.value);
      pageinfo.pageCount = res.pageCount || 0;
      pageinfo.totalCount = res.totalCount || 0;
    } else {
      tableData.value = [];
      pageinfo.totalCount = 0;
    }
  } catch (error) {
    console.error("获取数据失败:", error);
    tableData.value = [];
  }
};

//#endregion

//#region 删除多个合同
const deleteids = ref<string[]>([]);

const handleSelectionChange = (selection: ContractItem[]) => {
  deleteids.value = selection.map((item) => item.id);
};

const deleteManyContracts = async () => {
  if (deleteids.value.length === 0) {
    ElMessage.warning("请选择要删除的合同");
    return;
  }
  try {
    await ElMessageBox.confirm("确认删除选中的合同吗？", "提示", { type: "warning" });
    await CrmContractAPI.deleteManyContracts({ DeleteIds: deleteids.value });
    ElMessage.success("删除成功");
    getTableData();
  } catch (e) {
    console.log(e);
  }
};
//#endregion

//#region 用户下拉框
// 定义用户数据类型
interface UserItem {
  id: string;
  name: string;
  realName?: string;
}

// 用户列表数据
const users = ref<UserItem[]>([]);

// 获取用户列表
const getUsers = async () => {
  const res: any = await UserAPI.GetUserPage();
  users.value = res;
  console.log(users.value);
};
//#endregion

//#region 客户选择
// 定义客户数据类型
interface CustomerItem {
  id: string;
  customerName: string;
  customerPhone?: string;
  creationTime?: string;
}

// 客户选择相关
const showCustomerDialog = ref(false);
const customerList = ref<CustomerItem[]>([]);
const selectedCustomerId = ref<string>("");
// 获取客户列表
const getCustomerList = async () => {
  try {
    const params = { PageIndex: 1, PageSize: 100 };
    const res = await CustomerAPI.GetCustomerPage(params);
    if (res && res.data) {
      customerList.value = res.data;
    }
  } catch (error) {
    console.error("获取客户列表失败:", error);
  }
};
// 打开客户选择对话框
const selectCustomer = () => {
  showCustomerDialog.value = true;
  getCustomerList();
};
// 单选客户
const handleCustomerRadio = (row: CustomerItem) => {
  selectedCustomerId.value = row.id;
};
// 提交客户选择
const handleCustomerSubmit = () => {
  if (selectedCustomerId.value) {
    searchForm.CustomerId = selectedCustomerId.value;
    showCustomerDialog.value = false;
  }
};

// 去除html标签
function stripHtml(html: any) {
  return html ? html.replace(/<[^>]+>/g, "") : "";
}

//#region 产品信息
//获取产品列表
const productList: any = ref([]);
// 产品列表的加载状态动画
const productLoading = ref(false);

// 获取产品列表
async function fetchProductList(CrmContractId: string) {
  try {
    productLoading.value = true;
    const res = await CrmContractAPI.GetCrmContractProduct(CrmContractId);
    productList.value = res || [];
  } catch (e) {
    console.error("加载产品失败", e);
    productList.value = [];
  } finally {
    productLoading.value = false;
  }
}
//#endregion

//#region 产品列表和多选
//获取产品列表
const getproductList: any = ref([]);
const openEditProductDialog = () => {
  showProductDialog.value = true;
};
// 产品列表搜索
const productSearch = ref({
  ProductBrand: "",
  PageIndex: 1,
  PageSize: 111,
});
// 产品列表对话框状态
const showProductDialog = ref(false);
// 存储已选择的产品ID，用于反填
const selectedProductIds = ref<string[]>([]);
// 产品选中列表
const productSelection = ref<any[]>([]);
// 产品列表的响应式引用
const productTableRef = ref();

function handleProductSelectionChange(selection: any) {
  console.log("产品id", selection);
  productSelection.value = selection;
}
// 获取产品列表
async function ProductList() {
  productLoading.value = true;
  try {
    //调用接口获取产品列表
    const res: any = await ProductApi.getProductList(productSearch.value);
    console.log("产品列表", res.data);

    // 将产品列表赋值给productList
    getproductList.value = res.data || [];

    // dom的更新循环,产品列表数据加载完成后，反填已选择的产品(获取已选择的产品ids后,利用nextTick的特性来反填产品列表)
    nextTick(() => {
      restoreProductSelection();
    });
  } finally {
    productLoading.value = false;
  }
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
    productList.value.forEach((product: any) => {
      //将选中到的产品数据id利用toggleRowSelection方法(让el-table组件能够手动选中,ture就是给多选框选中)选中
      if (selectedProductIds.value.includes(product.id)) {
        productTableRef.value.toggleRowSelection(product, true);
      }
    });
  });
}

// 选中产品后，添加到产品明细
function handleProductDialogConfirm() {
  // 获取当前合同Id
  const contractId = editForm.id || currentDetail.value?.id;
  if (!contractId) {
    ElMessage.error("请先选择合同");
    return;
  }
  // 生成新明细，去重
  const newList = [...editProductList.value];
  // 遍历选中的产品
  productSelection.value.forEach((product) => {
    // 判断是否已存在于明细中，避免重复
    if (!editProductList.value.some((item) => item.productId === product.id)) {
      newList.push({
        contractId, // 关联当前合同Id
        productId: product.id,
        productBrand: product.productBrand,
        productCode: product.id,
        productImageUrl: product.productImageUrl,
        sellPrice: product.dealPrice || product.suggestedPrice || 0,
        buyProductNum: 1,
        sumPrice: product.dealPrice || product.suggestedPrice || 0,
      });
    }
  });
  editProductList.value = newList; // 覆盖赋值
  showProductDialog.value = false;
}

// 弹窗关闭时清空已选
function handleProductDialogClose() {
  productSelection.value = [];
}

//#endregion

//#endregion

//#region 合同详情
const showDetailDrawer = ref(false);
const currentDetail = ref<any>(null);
const activeTab = ref("contract");

const handleRowClick = (row: any) => {
  currentDetail.value = row;
  showDetailDrawer.value = true;
  fetchProductList(row.id);
  RecordData(row.id); // 获取操作日志列表数据
};
//#endregion

// 获取操作日志列表数据
const recordlist: any = ref([]);
//显示查询分页
const RecordData = async (id: any) => {
  const params = {
    bizType: "crmcontract",
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

// 获取负责人列表数据
const userList: any = ref([]);

//显示查询分页
const UserData = async () => {
  UserAPI.GetUserPage().then((res) => {
    console.log("负责人用户列表数据", res);
    userList.value = res;
  });
};
// 通过用户ID获取用户姓名(审核信息)
function getUserNameById(id: any) {
  const user = userList.value.find((u: any) => u.id === id);
  return user ? user.realName : id || "-";
}

// 获取选中客户名称
function getSelectedCustomerName() {
  const customer = customerList.value.find((item) => item.id === searchForm.CustomerId);
  return customer ? customer.customerName : "未知客户";
}

// 清除选中客户
function clearSelectedCustomer() {
  searchForm.CustomerId = "";
  selectedCustomerId.value = "";
}

function handleCustomerRowClick(row: CustomerItem) {
  selectedCustomerId.value = row.id;
}

// 修改相关

const showEditDrawer = ref(false);
const editFormRef = ref();
const editForm: any = reactive({
  id: "",
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
  contractProceeds: 0,
});
//表单数据
const editProductList = ref<any[]>([]);
const editRules = {
  userId: [{ required: true, message: "请选择负责人", trigger: "change" }],
  contractProceeds: [{ required: true, message: "请输入合同金额", trigger: "blur" }],
  signDate: [{ required: true, message: "请选择签订日期", trigger: "blur" }],
  contractName: [{ required: true, message: "请输入合同名称", trigger: "blur" }],
  expirationDate: [{ required: true, message: "请选择截止日期", trigger: "blur" }],
  dealer: [{ required: true, message: "请输入经销商", trigger: "blur" }],
  contractTerms: [{ required: true, message: "请输入合同条款", trigger: "blur" }],
  auditorId: [{ required: true, message: "请选择审核人", trigger: "change" }],
};
// 合计
const editTotalAmount = computed(() =>
  editProductList.value.reduce((sum, item) => sum + (Number(item.sumPrice) || 0), 0)
);
function updateEditSumPrice(row: any) {
  row.sumPrice = (Number(row.sellPrice) || 0) * (Number(row.buyProductNum) || 0);
}
// 打开修改抽屉并反填
function openEditDrawer() {
  if (!currentDetail.value) return;
  Object.assign(editForm, currentDetail.value);
  // 拉取产品明细
  CrmContractAPI.GetCrmContractProduct(currentDetail.value.id).then((res: any) => {
    editProductList.value = (res ?? []).filter(
      (item: any) => item && (item.productId || item.productCode || item.productBrand)
    );
  });
  showEditDrawer.value = true;
}

// 提交修改
async function handleEditSubmit() {
  // 组装产品明细
  const products = editProductList.value
    .filter((item) => item && item.productId)
    .map((item) => ({
      crmContractId: item.crmContractId,
      productId: item.productId,
      sellPrice: item.sellPrice,
      buyProductNum: item.buyProductNum,
      sumPrice: item.sumPrice,
      productImageUrl: item.productImageUrl,
      productBrand: item.productBrand,
    }));
  // 组装提交数据
  const data = {
    ...editForm,
    addCrmcontractandProductDto: products,
    contractProceeds: editTotalAmount.value,
  };
  CrmContractAPI.updateContract(currentDetail.value.id, data);
  ElMessage.success("修改成功");
  showEditDrawer.value = false;
  showDetailDrawer.value = false;
  await getTableData();
}

//重置
function resetEditForm() {
  Object.assign(editForm, {
    id: "",
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
    contractProceeds: 0,
  });
  editProductList.value = [];
  getTableData();
}

// 删除合同
function handleDelete(row: any) {
  editForm.value = row;
  ElMessageBox.confirm("确定要删除该合同吗？", "提示", {
    type: "warning",
  }).then(() => {
    CrmContractAPI.deleteContract(row.id)
      .then(() => {
        ElMessage.success("删除成功");
        showEditDrawer.value = false;
        getTableData(); // 重新加载数据
      })
      .catch((error) => {
        console.error("删除失败:", error);
        ElMessage.error("删除失败");
      });
  });
}

//#region 图片
const handleAvatarSuccess = (val: any) => {
  editForm.contractScanning = val;
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

//#region 审核驳回
// 审核/驳回弹窗
const showApproveDialog = ref(false);
// 审核/驳回原因
const approveComment = ref("");
// 审核/驳回类型
const approveType = ref(true); // true表示审核通过，false表示审核驳回

const currentUserId = store.userInfo.id; // 获取当前登录人ID
console.log("当前登录人ID", currentUserId);

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
  if (!currentDetail.value?.id) return;
  const params = {
    isPass: approveType.value,
    comment: approveComment.value,
  };
  const approverId = currentUserId;
  const id = currentDetail.value.id;
  await CrmContractAPI.CrmContractInstance(id, approverId, params);
  ElMessage.success(params.isPass ? "审核通过" : "审核驳回");
  showApproveDialog.value = false;
  getCustomerList();
}
//#endregion

const goAddContract = () => {
  router.push({
    path: "/crmcontract/addcontract",
    query: { _t: Date.now() },
  });
};

onMounted(() => {
  getTableData();
  getUsers();
  ProductList();
  UserData();
});
</script>

<style scoped>
.detail-row {
  margin-bottom: 12px;
  font-size: 15px;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 10px 30px 0 30px;
}

.form-item {
  display: flex;
  align-items: center;
}

.label {
  width: 100px;
  /* 固定宽度 */
  text-align: right;
  /* 右对齐 */
  margin-right: 16px;
  color: #333;
  font-size: 14px;
  flex-shrink: 0;
}

.form-item,
.el-select,
.el-date-picker {
  width: 500px !important;
  /* 控件宽度统一 */
}

.contract-query-ui {
  background: rgb(245 248 253);
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
}

.header {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 12px;
}

.header .total {
  font-size: 12px;
  font-weight: normal;
  color: #666;
  margin-left: 10px;
}

.header .count {
  color: #409eff;
}

.query-bar .row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.flex-between {
  justify-content: space-between;
}

.right-group {
  display: flex;
  align-items: center;
}

.form-item {
  margin-bottom: 16px;
}

.label {
  color: #333;
  margin-right: 8px;
  font-size: 13px;
}

.date-picker {
  width: 100px;
  margin-left: 8px;
}

.mt-2 {
  margin-top: 10px;
}

.ml-2 {
  margin-left: 8px;
}

.ml-4 {
  margin-left: 16px;
}

.info-row {
  margin-bottom: 10px;
  font-size: 15px;
}

.info-label {
  color: #888;
  min-width: 90px;
  display: inline-block;
}
</style>
