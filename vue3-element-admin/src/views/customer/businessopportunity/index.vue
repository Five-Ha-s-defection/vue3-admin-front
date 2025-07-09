<template>
  <div class="app-container">
    <!-- 查询商机部分 -->
    <el-card class="search-card" shadow="never">
      <div class="clue-header">
        <span>商机列表 | 总记录数：<b>{{ queryParams.totalCount }}</b> 条</span>
      </div>
      <!-- 查看范围 -->
      <el-row class="clue-row" align="middle">
        <el-col :span="24">
          <span class="clue-label">查看范围</span>
          <el-link v-for="item in scopeOptions" :key="item.value" :underline="false"
            :type="queryParams.type === item.value ? 'primary' : 'default'" class="clue-link"
            @click="handleScopeChange(item.value)">
            {{ item.label }}
          </el-link>
        </el-col>
      </el-row>
      <!-- 选择时间 -->
      <el-row class="clue-row" align="middle">
        <el-col :span="24">
          <span class="clue-label">选择时间</span>
          <el-date-picker v-model="dateRange" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss" :shortcuts="dateShortcuts" style="width: 380px" @change="handleQuery" />
          <el-radio-group v-model="queryParams.TimeType" class="ml16" @change="handleQuery">
            <el-radio :label="2">创建时间</el-radio>
            <el-radio :label="1">下次联系</el-radio>
            <el-radio :label="0">最后跟进</el-radio>
          </el-radio-group>
        </el-col>
      </el-row>
      <!-- 排序方式 -->
      <el-row class="clue-row" align="middle">
        <el-col :span="24">
          <span class="clue-label">排序方式</span>
          <el-link v-for="item in orderOptions" :key="item.value" :underline="false"
            :type="queryParams.OrderBy === item.value ? 'primary' : 'default'" class="clue-link"
            @click="handleOrderClick(item.value)">
            {{ item.label }}
            <span class="order-arrows">
              <el-icon
                :class="['arrow-icon', queryParams.OrderBy === item.value && queryParams.OrderDesc ? 'active' : '']">
                <ArrowUp />
              </el-icon>
              <el-icon
                :class="['arrow-icon', queryParams.OrderBy === item.value && !queryParams.OrderDesc ? 'active' : '']">
                <ArrowDown />
              </el-icon>
            </span>
          </el-link>
        </el-col>
      </el-row>
      <!-- 底部操作区 -->
      <el-row class="clue-row clue-bottom" align="middle" justify="space-between">
        <el-col :span="12">
          <el-button type="primary" class="clue-large-btn" @click="handleAddClue">
            <el-icon class="clue-btn-icon">
              <DocumentAdd />
            </el-icon>
            添加商机
          </el-button>
          <el-button type="warning" @click="handleResetQuery()">
            重置
          </el-button>
        </el-col>
        <el-col :span="12" class="clue-bottom-right">
          <el-input v-model="queryParams.Keyword" placeholder="商机编号（不含编号）/商机名称" clearable style="width: 320px"
            class="mr8 clue-large-input clue-search-input" @keyup.enter="handleQuery">
            <template #append>
              <el-button class="clue-search-btn" link @click="handleQuery">
                <el-icon>
                  <Search />
                </el-icon>
              </el-button>
            </template>
          </el-input>
          <el-button style="width: 80px;" icon="el-icon-filter" class="mr8 clue-large-btn"
            @click="advancedDialogVisible = true">
            <el-icon>
              <Filter />
            </el-icon>
            高级搜索
          </el-button>
          <el-dropdown>
            <el-button class="clue-large-btn">操作<el-icon>
                <ArrowDown />
              </el-icon></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>删除商机</el-dropdown-item>
                <el-dropdown-item>导出数据</el-dropdown-item>
                <el-dropdown-item>Excel导入</el-dropdown-item>
                <el-dropdown-item>下载模版</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-col>
      </el-row>
    </el-card>

    <!-- 添加商机弹出框 -->
    <el-dialog v-model="addbusinessdialogVisible" title="添加客户" width="700">
      <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto">
        <el-form-item label="所属客户" prop="customerId">
          <el-select v-model="ruleForm.customerId" placeholder="请选择客户">
            <el-option v-for="item in selcustomerList" :label="item.customerName" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priorityId">
          <el-select v-model="ruleForm.priorityId" placeholder="请选择优先级">
            <el-option v-for="item in priorityList" :label="item.priorityName" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="商机名称" prop="businessOpportunityName">
          <el-input v-model="ruleForm.businessOpportunityName" />
        </el-form-item>

        <el-form-item label="销售进度" prop="salesProgressId">
          <el-select v-model="ruleForm.salesProgressId" placeholder="请选择销售进度">
            <el-option v-for="item in salesProgressList" :label="item.salesProgressName" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="预算金额">
          <el-input v-model="ruleForm.budget" />
        </el-form-item>

        <el-form-item label="预计成交日期">
          <el-date-picker v-model="ruleForm.expectedDate" type="datetime" placeholder="选择时间" />
        </el-form-item>

        <el-form-item label="备注">
          <div style="border: 1px solid #ccc">
            <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :default-config="toolbarConfig" />
            <Editor v-model="ruleForm.remark" style="height: 500px; overflow-y: hidden;" :default-config="editorConfig"
              @on-created="handleCreated" />
          </div>
        </el-form-item>

        <el-form-item label="所属产品">
          <el-select v-model="ruleForm.productId" placeholder="请选择商品">
            <el-option v-for="item in productList" :label="item.productBrand" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm(ruleFormRef)">
            提交
          </el-button>
          <el-button @click="resetForm(ruleFormRef)">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 弹出抽屉，显示商机详情 -->
    <el-drawer v-model="table" direction="rtl" size="60%" :with-header="false">
      <div class="clue-detail-new-container">
        <!-- 顶部横向信息区：线索名称和操作按钮 -->
        <div class="drawer-top-row">
          <!-- 商机名称 -->
          <div class="drawer-title-big">{{ currentCustomer?.businessOpportunityName || '-' }}</div>
          <!-- 右侧操作按钮区 -->
          <div class="drawer-btns">
            <el-button type="primary">转客户</el-button>
            <el-button>放弃</el-button>
            <el-button>转移</el-button>
            <el-button type="danger">删除</el-button>
          </div>
        </div>
        <!-- 线索基础信息区，横向排列 -->
        <div class="drawer-info-row">
          <!-- 负责人 -->
          <div class="info-item"><span>负责人</span>{{ currentCustomer?.userName || '--' }}</div>
          <!-- 最后跟进时间，若无效则显示自定义图标 -->
          <div class="info-item">
            <span>最后跟进</span>
            <template v-if="isValidTime(currentCustomer?.lastFollowTime)">
              {{ moment(currentCustomer.lastFollowTime).format('YYYY-MM-DD HH:mm') }}
            </template>
            <template v-else>
              <StopIcon style="font-size:32px;color:#bbb;" />
            </template>
          </div>
          <!-- 下次联系时间，若无效则显示自定义图标 -->
          <div class="info-item">
            <span>下次联系时间</span>
            <template v-if="isValidTime(currentCustomer?.nextContactTime)">
              {{ moment(currentCustomer.nextContactTime).format('YYYY-MM-DD HH:mm') }}
            </template>
            <template v-else>
              <StopIcon style="font-size:32px;color:#bbb;" />
            </template>
          </div>
          <!-- 创建时间 -->
          <div class="info-item"><span>创建时间</span>{{ currentCustomer?.creationTime ?
            moment(currentCustomer.creationTime).format('YYYY-MM-DD HH:mm') : '--' }}</div>
          <!-- 创建人 -->
          <div class="info-item"><span>创建人</span>{{ currentCustomer?.createName || '--' }}</div>
          <!-- 负责人 -->
          <div class="info-item"><span>录入方式</span>手动录入</div>
        </div>

        <!-- 线索详情标题和分割线 -->
        <div class="clue-detail-title-row">
          <!-- <span class="clue-detail-title">线索详情</span> -->
          <el-tabs v-model="activeTabcus" class="clue-detail-tabs" style="position:relative;">
            <!-- 客户详情tab -->
            <el-tab-pane label="客户详情" name="contact">
              <div class="contact-records">
                <!-- 按钮 -->
                <el-button type="primary" size="small"
                  style="text-align: right; margin-top: 20px;width: 80px;">修改</el-button>
                <!-- 线索详情tab，分两列展示 -->
                <div class="detail-table-flex">
                  <!-- 左侧信息列 -->
                  <div class="detail-table-col">
                    <div class="detail-row"><span>客户编号</span>{{ currentCustomer?.customerCode }}</div>
                    <div class="detail-row"><span>客户名称</span>{{ currentCustomer?.customerName }}</div>
                    <div class="detail-row"><span>体检金额</span>{{ currentCustomer?.checkAmount || '--' }}</div>
                    <div class="detail-row"><span>到期时间</span>{{ currentCustomer?.customerExpireTime }}</div>
                    <div class="detail-row"><span>客户级别</span>{{ currentCustomer?.customerLevelName }}</div>
                    <div class="detail-row"><span>邮箱</span>{{ displayValue(currentCustomer?.customerEmail) }}</div>
                    <div class="detail-row"><span>客户来源</span>{{ displayValue(currentCustomer?.clueSourceName) }}</div>
                    <div class="detail-row"><span>客户地址</span>{{ displayValue(currentCustomer?.customerAddress) }}</div>
                    <div class="detail-row"><span>备注</span>{{ currentCustomer?.customerRemark }}</div>
                  </div>
                  <!-- 右侧信息列 -->
                  <div class="detail-table-col">
                    <div class="detail-row"><span>车架号</span>{{ displayValue(currentCustomer?.carFrameNumberName) }}
                    </div>
                    <div class="detail-row">
                      <span>电话</span>
                      <span>
                        {{ displayValue(currentCustomer?.customerPhone) }}
                        <el-icon v-if="currentCustomer?.customerPhone" class="phone-icon">
                          <Phone />
                        </el-icon>
                      </span>
                    </div>
                    <div class="detail-row"><span>客户类别</span>{{ displayValue(currentCustomer?.customerTypeName) }}</div>
                    <div class="detail-row"><span>客户地区</span>{{ displayValue(currentCustomer?.customerRegionName) }}
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <!-- 联系人详情tab -->
            <el-tab-pane label="联系人" name="attachment">
              <div style="padding:32px 0;text-align:center;color:#bbb;">暂无联系人</div>
            </el-tab-pane>
            <!-- 联系人详情tab -->
            <el-tab-pane label="商机" name="attachment">
              <div style="padding:32px 0;text-align:center;color:#bbb;">暂无商机</div>
            </el-tab-pane>
            <!-- 联系人详情tab -->
            <el-tab-pane label="合同" name="attachment">
              <div style="padding:32px 0;text-align:center;color:#bbb;">暂无合同</div>
            </el-tab-pane>
            <!-- 联系人详情tab -->
            <el-tab-pane label="财务" name="attachment">
              <div style="padding:32px 0;text-align:center;color:#bbb;">暂无财务</div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <el-divider class="divider-mt" />
        <!-- 详情tab区 -->
        <el-tabs v-model="activeTab" class="clue-detail-tabs" style="position:relative;">
          <!-- 联系记录tab -->
          <el-tab-pane label="联系记录" name="contact">
            <div class="contact-records">
              <!-- 添加联系记录按钮 -->
              <el-button type="primary" icon="Edit" @click="AddCommunication()">添加联系记录</el-button>
              <!-- 联系记录列表 -->
              <div class="contact-list">
                <div v-for="item in contactList" :key="item.id" class="contact-item">
                  <div class="contact-meta">
                    <span class="contact-type">{{ item.typeName }}</span>
                    <span class="contact-time">{{ item.time }}</span>
                    <span class="contact-user">{{ user.userInfo.realName }} 联系了</span>
                    <el-button link icon="Edit" size="small" />
                    <el-button link icon="Delete" size="small" />
                    <el-button link icon="ChatDotSquare" size="small" />
                  </div>
                  <div class="contact-content">{{ item.content }}</div>
                </div>
                <!-- 没有联系记录时显示空状态 -->
                <el-empty v-if="!contactList.length" description="暂无联系记录" :image-size="80" />
              </div>
            </div>
          </el-tab-pane>
          <!-- 附件tab -->
          <el-tab-pane label="附件" name="attachment">
            <div style="padding:32px 0;text-align:center;color:#bbb;">暂无附件</div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>

    <!-- 添加联系记录弹出框 -->
    <el-dialog v-model="addcommunicationdialogVisible" title="添加联系记录" width="900">
      <!-- <div class="drawer-bottom-form" style="padding: 32px 32px 24px 32px;"> -->
      <el-form ref="communicationruleFormRef" style="max-width: 600px" :model="communicationruleForm"
        :rules="communicationrules" label-width="auto">
        <!-- 富文本编辑器区域 -->
        <el-form-item>
          <el-input v-model="communicationruleForm.content" type="textarea" :rows="12" placeholder=""
            style="margin-bottom: 32px; border-radius: 8px;" />
        </el-form-item>

        <!-- 附件上传和底部表单区 -->
        <el-form-item>
          <el-button type="default"
            style="height:26px;width:140px;font-size:12px;border-radius:6px;display:flex;align-items:center;justify-content:center;"
            @click="uploadDialogVisible = true">
            <el-icon style="font-size:24px;margin-right:8px;">
              <Upload />
            </el-icon>
            上传附件
          </el-button>
          <!-- 已上传文件名回显 -->
          <div v-if="fileList.length" style="margin-top:8px;">
            <div v-for="file in fileList" :key="file.uid" style="font-size:13px;color:#666;">
              {{ file.name }}
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-select v-model="communicationruleForm.expectedDateId" placeholder="沟通类型" style="width:140px;">
            <el-option v-for="item in communicationtypeList" :label="item.communicationTypeName" :value="item.id" />
          </el-select>
        </el-form-item>

        <!-- 只有勾选保存为模板时才显示自定义回复下拉框 -->
        <el-form-item v-if="communicationruleForm.isServe">
          <el-select v-model="communicationruleForm.customReplyId" placeholder="自定义回复" style="width:140px;"
            :disabled="!communicationruleForm.expectedDateId">
            <template v-if="customReplyList.length">
              <el-option v-for="item in customReplyList" :key="item.id" :label="item.customReplyName"
                :value="item.id" />
            </template>
            <template v-else>
              <el-option disabled label="无数据" value="" />
            </template>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-date-picker v-model="communicationruleForm.nextContactTime" placeholder="下次联系时间" style="width:140px;" />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="communicationruleForm.isServe" style="margin-right:8px;">保存为跟进模板</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="communicationsubmitForm(communicationruleFormRef)">
            添加记录
          </el-button>
          <el-button @click="communicationresetForm(communicationruleFormRef)">重置</el-button>
        </el-form-item>
      </el-form>
      <!--</div> -->
    </el-dialog>

    <!-- 上传附件弹出框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传附件" width="600">
      <el-upload ref="uploadRef" v-model:file-list="fileList" action="/api/app/common/upload-file" :multiple="true"
        :auto-upload="false" :on-success="handleUploadSuccess" :on-remove="handleUploadRemove" :limit="5"
        :on-exceed="handleUploadExceed" :on-progress="handleUploadProgress" list-type="text">
        <template #trigger>
          <el-button type="primary">选择文件</el-button>
        </template>
        <el-button type="success" style="margin-left: 12px;" @click="submitUpload">开始上传</el-button>
        <template #file="{ file }">
          <span>{{ file.name }}</span>
          <span v-if="uploadStatusMap[file.uid] === 'uploading'">
            <el-progress :percentage="uploadProgressMap[file.uid] || 0"
              style="width: 100px; display: inline-block; margin-left: 12px;" />
          </span>
          <span v-else-if="uploadStatusMap[file.uid] === 'success'"
            style="color: #67c23a; margin-left: 12px;">上传成功</span>
          <span v-else>
            <el-button type="danger" size="small" @click.stop="handleRemoveFile(file)">删除</el-button>
          </span>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 显示商机列表信息 -->
    <!-- 表格区域和分页保持不变 -->
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="customerList" style="width: 100%" @selection-change="handleSelectionChange"
        @row-click="handleRowClick">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="优先级" prop="priorityName" width="80" align="center" />
        <el-table-column label="商机名称" prop="businessOpportunityName" width="120" align="center" />
        <el-table-column label="所属客户" prop="customerName" min-width="100" />
        <el-table-column label="销售进度" prop="salesProgressName" min-width="100" />
        <el-table-column label="最后跟进" prop="lastFollowTime" min-width="180">
          <template #default="{ row }">
            <template v-if="row.lastFollowTime">
              {{ moment(row.lastFollowTime).format('YYYY-MM-DD HH:mm') }}
            </template>
            <template v-else>
              <el-icon style="color: #bfbfbf; font-size: 18px;">
                <CircleClose />
              </el-icon>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="下次联系" prop="nextContactTime" min-width="180">
          <template #default="{ row }">
            <template v-if="row.nextContactTime">
              {{ moment(row.nextContactTime).format('YYYY-MM-DD HH:mm') }}
            </template>
            <template v-else>
              <el-icon style="color: #bfbfbf; font-size: 18px;">
                <CircleClose />
              </el-icon>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="creationTime" min-width="180">
          <template #default="{ row }">
            <template v-if="row.creationTime">
              {{ moment(row.creationTime).format('YYYY-MM-DD HH:mm') }}
            </template>
            <template v-else>
              <el-icon style="color: #bfbfbf; font-size: 18px;">
                <CircleClose />
              </el-icon>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="负责人" prop="userName" min-width="100" />
        <el-table-column label="创建人" prop="createName" min-width="100" />
      </el-table>
      <!-- 分页区域 -->
      <table>
        <tbody>
          <tr>
            <td>
              <el-pagination v-model:current-page="queryParams.PageIndex" v-model:page-size="queryParams.PageSize"
                :page-sizes="[2, 4, 6, 8, 10, 20, 30]" layout="slot, sizes" :total="queryParams.totalCount"
                prev-text="上一页" next-text="下一页" @size-change="handleSizeChange" @current-change="handleCurrentChange">
                共{{ queryParams.pageCount }}页 共{{ queryParams.totalCount }}条
                当前第{{ queryParams.PageIndex }}/{{ queryParams.pageCount }}页
              </el-pagination>
            </td>

            <td>
              <el-pagination v-model:current-page="queryParams.PageIndex" v-model:page-size="queryParams.PageSize"
                :page-sizes="[2, 4, 6, 8, 10, 20, 30]" layout="slot, prev, pager, next" :total="queryParams.totalCount"
                prev-text="上一页" next-text="下一页" @size-change="handleSizeChange" @current-change="handleCurrentChange">
                <el-button :disabled="queryParams.PageIndex == 1" @click="handleCurrentChange(1)">首页</el-button>
              </el-pagination>
            </td>

            <td>
              <el-pagination v-model:current-page="queryParams.PageIndex" v-model:page-size="queryParams.PageSize"
                :page-sizes="[2, 4, 6, 8, 10, 20, 30]" layout=" slot,jumper" :total="queryParams.totalCount"
                prev-text="上一页" next-text="下一页" @size-change="handleSizeChange" @current-change="handleCurrentChange">
                <el-button :disabled="queryParams.PageIndex == queryParams.pageCount"
                  @click="handleCurrentChange(queryParams.pageCount)">尾页</el-button>
              </el-pagination>
            </td>
          </tr>
        </tbody>
      </table>
    </el-card>

    <!-- 高级筛选弹出框 -->
    <el-dialog v-model="advancedDialogVisible" width="1000px" :close-on-click-modal="false">
      <template #header>
        <div class="advanced-dialog-header">
          <span class="advanced-dialog-title">高级搜索</span>
          <div class="advanced-dialog-actions">
            <el-button type="primary" class="advanced-dialog-btn" @click="handleAdvancedSearch">搜索</el-button>
            <el-button type="primary" class="advanced-dialog-btn" @click="advancedDialogVisible = false">取消</el-button>
          </div>
        </div>
      </template>
      <el-form :model="queryParams" label-width="100px" class="advanced-form">
        <el-row :gutter="0">
          <el-col :span="24" style="margin-bottom: 16px;">
            <div class="advanced-match-flex">
              <span class="advanced-match-label el-form-item__label">满足条件</span>
              <el-radio-group v-model="queryParams.MatchMode">
                <el-radio :label="0">全部满足</el-radio>
                <el-radio :label="1">部分满足</el-radio>
              </el-radio-group>
              <el-tooltip content="部分满足是指只要满足部分条件就查询出来，全部满足则查询满足全部条件的" placement="right">
                <el-icon class="advanced-match-info">
                  <InfoFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </el-col>
          <el-col :span="24"><el-form-item label="负责人">
              <div class="form-item-flex">
                <el-select v-model="queryParams.UserIds" multiple placeholder="请选择">
                  <el-option v-for="item in userList" :label="item.userName" :value="item.id" />
                </el-select>
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="创建人">
              <div class="form-item-flex">
                <el-select v-model="queryParams.CreatedByIds" multiple placeholder="请选择">
                  <el-option v-for="item in userList" :label="item.userName" :value="item.id" />
                </el-select>
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="所属客户">
              <div class="form-item-flex">
                <el-select v-model="ruleForm.customerId" placeholder="请选择客户">
                  <el-option v-for="item in selcustomerList" :label="item.customerName" :value="item.id" />
                </el-select>
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>

          <el-col :span="24"><el-form-item label="商机编号">
              <div class="form-item-flex">
                <el-input v-model="queryParams.BusinessOpportunityCode" placeholder="不包含客户编码" />
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>

          <el-col :span="24"><el-form-item label="优先级">
              <div class="form-item-flex">
                <el-select v-model="queryParams.PriorityId" placeholder="请选择">
                  <el-option v-for="item in priorityList" :label="item.priorityName" :value="item.id" />
                </el-select>
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>

          <el-col :span="24"><el-form-item label="商机名称">
              <div class="form-item-flex">
                <el-input v-model="queryParams.BusinessOpportunityName" />
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>

          <el-col :span="24"><el-form-item label="销售进度">
              <div class="form-item-flex">
                <el-select v-model="queryParams.SalesProgressId" placeholder="请选择">
                  <el-option v-for="item in salesProgressList" :label="item.salesProgressName" :value="item.id" />
                </el-select>
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>

          <el-col :span="24"><el-form-item label="预算金额">
              <div class="form-item-flex">
                <el-input v-model="queryParams.Budget" />
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>

          <el-col :span="24"><el-form-item label="到期时间">
              <div class="form-item-flex">
                <el-date-picker v-model="ruleForm.expectedDate" type="datetime" placeholder="选择时间" />
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>

        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { ArrowDown, ArrowUp, DocumentAdd, Search, InfoFilled, CircleClose, Phone, Upload, Filter } from '@element-plus/icons-vue';
import { AddBusinessOpportunity, GetCustomerSelect, GetBusinessPrioritySelect, GetBusinessSalesProgressSelect, GetProductSelect, ShowBusinessOpportunityList, DeleteBusinessOpportunity } from '@/api/CustomerProcess/BusinessOpportunity/businessopportunity.api';
import { AddContactCommunication, GetContactCommunication, GetCommunicationType, GetCustomReplyByType } from '@/api/CustomerProcess/ContactCommunication/contactcommunication.api';
import { GetUserSelect } from '@/api/CustomerProcess/Customer/customer.api'
import moment from 'moment';
import dayjs from 'dayjs';
import { useUserStore } from "@/store";
import type { FormInstance, FormRules, UploadInstance, UploadUserFile, UploadFile, UploadProgressEvent } from 'element-plus'
import StopIcon from '@/components/icons/StopIcon.vue'
//附文本引入
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { onBeforeUnmount, shallowRef } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const user = useUserStore();

//=================添加客户附文本==================
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('<p>hello</p>')

// 模拟 ajax 异步获取内容
onMounted(() => {
  setTimeout(() => {
    valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
  }, 1500)
})

const toolbarConfig = {}
const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      fieldName: 'file',
      server: 'https://localhost:44341/api/app/customer/upload-image-for-edit',
    }
  }
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor: any) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}


//=================显示联系记录====================
const contactList = ref<any[]>([]);
const targetType = ref<number>(2); // 线索 1，客户 2，商机 3

// 获取联系记录列表
const fetchContactList = async () => {
  if (!currentCustomerId.value) {
    contactList.value = [];
    return;
  }
  try {
    const res = await GetContactCommunication(currentCustomerId.value, targetType.value);
    console.log('GetContactCommunication返回的res:', res);
    if (Array.isArray(res)) {
      contactList.value = res.map((item: any) => ({
        id: item.id,
        typeName: item.communicationTypeName || '',
        time: item.creationTime ? moment(item.creationTime).format('YYYY-MM-DD HH:mm') : '',
        userName: item.userName || '',
        content: item.content || ''
      }));
      console.log('映射后 contactList', contactList.value);
    } else {
      contactList.value = [];
    }
  } catch (e) {
    contactList.value = [];
    console.error('接口请求异常', e);
  }
};



//=================添加联系记录====================
const addcommunicationdialogVisible = ref(false);
const uploadDialogVisible = ref(false);

const AddCommunication = () => {
  // 赋值当前客户id
  communicationruleForm.customerId = currentCustomer.value?.id || ''
  // 重置所有表单字段
  communicationruleForm.clueId = ''
  communicationruleForm.businessOpportunityId = ''
  communicationruleForm.content = ''
  communicationruleForm.attachmentUrl = ''
  communicationruleForm.expectedDateId = ''
  communicationruleForm.nextContactTime = ''
  communicationruleForm.followUpStatus = 1
  communicationruleForm.comments = ''
  communicationruleForm.customReplyId = '' // 重置自定义回复
  addcommunicationdialogVisible.value = true;

  // 清空上传文件相关数据
  fileList.value = [] // 清空已选文件
  uploadProgressMap.value = {} // 清空进度
  uploadStatusMap.value = {}   // 清空状态

  // 如果用el-form的resetFields也可以加上
  if (communicationruleFormRef.value) {
    communicationruleFormRef.value.resetFields()
  }
}

interface communicationRuleForm {
  customerId: number | string
  clueId: number | string
  businessOpportunityId: number | string
  content: string
  attachmentUrl: string
  expectedDateId: number | string
  nextContactTime: string
  followUpStatus: number
  comments: string
  customReplyId: number | string
  isServe: boolean
}

const communicationruleFormRef = ref<FormInstance>()
const communicationruleForm = reactive<communicationRuleForm>({
  customerId: '',
  clueId: '',
  businessOpportunityId: '',
  content: '',
  attachmentUrl: '',
  expectedDateId: '',
  nextContactTime: '',
  followUpStatus: 1, // 0:未跟进，1:已跟进
  comments: '',
  customReplyId: '',
  isServe: false, // 是否保存为模版
})

const communicationrules = reactive<FormRules<communicationRuleForm>>({
  content: [
    { required: true, message: '请填写沟通记录', trigger: 'blur' },
  ],
  expectedDateId: [
    { required: true, message: '请选择沟通类型', trigger: 'blur' },
  ],
})

const communicationsubmitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('添加沟通记录参数：', communicationruleForm);
      console.log('提交前 attachmentUrl:', communicationruleForm.attachmentUrl);
      await AddContactCommunication(communicationruleForm)
        .then((res) => {
          if (res) {
            ElMessage.success('添加沟通记录成功');
            addcommunicationdialogVisible.value = false;
            communicationresetForm(formEl);
            // 刷新联系记录列表
            fetchContactList()
          }
          else {
            ElMessage.success('添加沟通记录成功');
          }
        })
        .catch((error) => {
          console.error('添加沟通记录失败:', error);
          ElMessage.error('添加沟通记录失败，请稍后再试');
        });
    } else {
      console.log('error submit!', fields)
    }
  })
}

const communicationresetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields() // 重置表单字段
  // 重置所有表单字段
  communicationruleForm.customerId = ''
  communicationruleForm.businessOpportunityId = ''
  communicationruleForm.content = ''
  communicationruleForm.attachmentUrl = ''
  communicationruleForm.expectedDateId = ''
  communicationruleForm.nextContactTime = ''
  communicationruleForm.followUpStatus = 1
  communicationruleForm.comments = ''
  communicationruleForm.customReplyId = '' // 重置自定义回复
  addcommunicationdialogVisible.value = true;

  // 清空上传文件相关数据
  fileList.value = [] // 清空已选文件
  uploadProgressMap.value = {} // 清空进度
  uploadStatusMap.value = {}   // 清空状态
}

//=======================上传文件=========================================
// el-upload 组件的引用，用于手动触发上传等操作
const uploadRef = ref<UploadInstance>()

// 已选择的文件列表，绑定到 el-upload 的 v-model:file-list
const fileList = ref<UploadUserFile[]>([])

// 文件上传进度映射，key为文件uid，value为进度百分比
const uploadProgressMap = ref<Record<string, number>>({})

// 文件上传状态映射，key为文件uid，value为'success'或'uploading'
const uploadStatusMap = ref<Record<string, string>>({})

// 手动触发 el-upload 的上传方法（点击"开始上传"按钮时调用）
const submitUpload = () => {
  uploadRef.value?.submit();
}

// 上传进度回调，实时更新进度条和状态
const handleUploadProgress = (event: UploadProgressEvent, file: UploadFile) => {
  // 更新当前文件的上传进度
  uploadProgressMap.value[file.uid] = Math.floor(event.percent || 0);
  // 标记当前文件为"上传中"状态
  uploadStatusMap.value[file.uid] = "uploading";
}

const handleUploadSuccess = (response: any, file: UploadFile, fileListArr: UploadUserFile[]) => {
  // 标记当前文件上传进度为100%，状态为success
  uploadProgressMap.value[file.uid] = 100;
  uploadStatusMap.value[file.uid] = "success";

  // 只取所有上传成功的文件的 response 字段（你的后端返回的就是url字符串），拼接成逗号分隔的字符串
  communicationruleForm.attachmentUrl = fileListArr
    .filter(f => f.status === 'success' && f.response) // 只要status为success且有response
    .map(f => f.response) // 取response（即url字符串）
    .join(',');

  // 检查所有文件是否都上传成功（加f.uid判断，避免TS报错）
  const allSuccess = fileListArr.every(f => f.uid && uploadStatusMap.value[f.uid] === "success");
  if (allSuccess && fileListArr.length > 0) {
    uploadDialogVisible.value = false; // 关闭上传弹窗
    ElMessage.success('全部文件上传成功！');
  }

  // 调试用，打印当前文件列表和attachmentUrl
  console.log('handleUploadSuccess fileListArr:', fileListArr);
  console.log('attachmentUrl:', communicationruleForm.attachmentUrl);
}

const handleUploadRemove = (file: UploadFile, fileListArr: UploadUserFile[]) => {
  // 删除进度和状态映射中的对应项
  delete uploadProgressMap.value[file.uid];
  delete uploadStatusMap.value[file.uid];

  // 重新拼接所有已上传成功文件的url，赋值给attachmentUrl
  communicationruleForm.attachmentUrl = fileListArr
    .filter(f => f.status === 'success' && f.response)
    .map(f => f.response)
    .join(',');
}

const handleRemoveFile = (file: UploadFile) => {
  // 手动触发el-upload的remove
  uploadRef.value?.handleRemove(file)
}

const handleUploadExceed = () => {
  ElMessage.warning(`最多只能上传5个文件！`)
}

//=================弹出抽屉========================
const table = ref(false)
const currentCustomer = ref<any>(null) // 当前选中的客户数据
const activeTab = ref('detail') // tabs切换
const activeTabcus = ref('detail') // tabs切换

// 处理表格行点击事件
const handleRowClick = (row: any) => {
  console.log('handleRowClick被调用，row.id=', row.id);
  currentCustomer.value = row;
  currentCustomerId.value = row.id;
  table.value = true;
  activeTabcus.value = 'contact'; // 确保默认显示"客户详情"标签页
  fetchContactList();
}


//================添加商机===========================
const addbusinessdialogVisible = ref(false);
interface RuleForm {
  customerId: number | string
  priorityId: number | string
  businessOpportunityName: string
  salesProgressId: number | string
  budget: number
  expectedDate: string
  remark: string
  productId: number | string
  businessOpportunityCode: string
}

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  customerId: '',
  priorityId: '',
  businessOpportunityName: '',
  salesProgressId: '',
  budget: 0,
  expectedDate: '',
  remark: '',
  productId: '',
  businessOpportunityCode: '',
})

const rules = reactive<FormRules<RuleForm>>({
  businessOpportunityName: [
    { required: true, message: '商机名称是必填项', trigger: 'blur' },
  ],
  customerId: [
    {
      required: true,
      message: '所属客户是必填项',
      trigger: 'change',
    },
  ],
  priorityId: [
    {
      required: true,
      message: '优先级是必填项',
      trigger: 'change',
    },
  ],
  salesProgressId: [
    {
      required: true,
      message: '销售进度是必填项',
      trigger: 'change',
    },
  ],
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('添加商机参数：', ruleForm);
      await AddBusinessOpportunity(ruleForm)
        .then((res) => {
          if (res) {
            ElMessage.success('添加商机成功');
            addbusinessdialogVisible.value = false;
            resetForm(formEl);
            fetchBusinessList(); // 刷新商机列表
          }
          else {
            ElMessage.success('添加客户成功');
          }
        })
        .catch((error) => {
          console.error('添加客户失败:', error);
          ElMessage.error('添加客户失败，请稍后再试');
        });
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

//================显示查询参数===========================
const scopeOptions = [
  { label: '我负责的', value: 1 },
  { label: '我创建的', value: 2 },
  { label: '全部', value: 0 }
];
const orderOptions = [
  { label: '按最后跟进时间排序', value: 0 },
  { label: '按下次联系时间排序', value: 1 },
  { label: '按创建时间排序', value: 2 }
];

const loading = ref(false);
const customerList = ref<any[]>([]);
const selectedIds = ref<any[]>([]);

//定义查询显示参数
const queryParams = reactive({
  type: undefined as number | undefined, // 商机类型
  CreatedBy: '', // 创建人uuid
  AssignedTo: '', // 负责人uuid
  SalesProgressList: [], //销售进度（多选）
  StartTime: '', // string (date-time)
  EndTime: '', // string (date-time)
  TimeType: undefined as number | undefined, // 0,1,2
  OrderBy: undefined as number | undefined, // 0,1,2
  OrderDesc: false, // boolean
  Keyword: '', // string
  PageIndex: 1, // int32
  PageSize: 10, // int32
  totalCount: 0, // 总记录数
  pageCount: 0, // 总页数
  UserIds: [],      // 负责人
  CreatedByIds: [], // 创建人
  CustomerId: 0, // 所属客户
  BusinessOpportunityCode: '',     // 商机编号
  PriorityId: 0, //优先级
  BusinessOpportunityName: '',     // 商机名称
  SalesProgressId: 0, // 销售进度（单选）
  Budget: 0, //预算金额
  ExpectedDate: '', //预计成交日期
  MatchMode: 0, // 0: 全部满足, 1: 部分满足
});

const advancedDialogVisible = ref(false);

const dateRange = ref<string[]>([]);
const dateShortcuts = [
  {
    text: '昨天',
    value: () => [
      dayjs().subtract(1, 'day').startOf('day').format('YYYY-MM-DD 00:00:00'),
      dayjs().subtract(1, 'day').endOf('day').format('YYYY-MM-DD 23:59:59')
    ],
    onClick: () => setTimeout(() => handleQuery(), 0)
  },
  {
    text: '今天',
    value: () => [
      dayjs().startOf('day').format('YYYY-MM-DD 00:00:00'),
      dayjs().endOf('day').format('YYYY-MM-DD 23:59:59')
    ],
    onClick: () => setTimeout(() => handleQuery(), 0)
  },
  {
    text: '最近三天',
    value: () => [
      dayjs().subtract(2, 'day').startOf('day').format('YYYY-MM-DD 00:00:00'),
      dayjs().endOf('day').format('YYYY-MM-DD 23:59:59')
    ],
    onClick: () => setTimeout(() => handleQuery(), 0)
  },
  {
    text: '最近一周',
    value: () => [
      dayjs().subtract(6, 'day').startOf('day').format('YYYY-MM-DD 00:00:00'),
      dayjs().endOf('day').format('YYYY-MM-DD 23:59:59')
    ],
    onClick: () => setTimeout(() => handleQuery(), 0)
  },
  {
    text: '最近一个月',
    value: () => [
      dayjs().subtract(1, 'month').add(1, 'day').startOf('day').format('YYYY-MM-DD 00:00:00'),
      dayjs().endOf('day').format('YYYY-MM-DD 23:59:59')
    ],
    onClick: () => setTimeout(() => handleQuery(), 0)
  },
  {
    text: '最近三个月',
    value: () => [
      dayjs().subtract(3, 'month').add(1, 'day').startOf('day').format('YYYY-MM-DD 00:00:00'),
      dayjs().endOf('day').format('YYYY-MM-DD 23:59:59')
    ],
    onClick: () => setTimeout(() => handleQuery(), 0)
  }
];

watch(dateRange, (val) => {
  queryParams.StartTime = val?.[0] || '';
  queryParams.EndTime = val?.[1] || '';
});



//下拉框绑定自定义回复列表
const customReplyList: any = ref([])
const selectCustomReply = async (typeId: string | number) => {
  if (!typeId) {
    customReplyList.value = [];
    return;
  }
  await GetCustomReplyByType(typeId)
    .then(res => {
      customReplyList.value = res || [];
      console.log('自定义回复列表', customReplyList.value);
    });
};

//下拉框绑定沟通类型列表
const communicationtypeList: any = ref([])
const selectCommunicationType = async () => {
  await GetCommunicationType()
    .then(res => {
      console.log('沟通类型列表', res)
      communicationtypeList.value = res
    })
};

// 下拉框绑定用户列表
const userList: any = ref([])
const selectUser = async () => {
  await GetUserSelect()
    .then(res => {
      console.log('用户列表', res)
      userList.value = res
    })
}

// 下拉框绑定客户列表
const selcustomerList: any = ref([])
const selectCustomer = async () => {
  await GetCustomerSelect()
    .then(res => {
      console.log('客户列表', res)
      selcustomerList.value = res
    })
}

// 下拉框绑定优先级列表
const priorityList: any = ref([])
const selectPriority = async () => {
  await GetBusinessPrioritySelect()
    .then(res => {
      console.log('优先级列表', res)
      priorityList.value = res
    })
}

// 下拉框绑定销售进度列表
const salesProgressList: any = ref([])
const selectSalesProgress = async () => {
  await GetBusinessSalesProgressSelect()
    .then(res => {
      console.log('销售进度列表', res)
      salesProgressList.value = res
    })
}

// 下拉框绑定产品列表
const productList: any = ref([])
const selectProduct = async () => {
  await GetProductSelect()
    .then(res => {
      console.log('产品列表', res)
      productList.value = res
    })
}

//高级筛选
const handleAdvancedSearch = () => {
  // 这里可以将queryParams的内容合并到queryParams并请求
  advancedDialogVisible.value = false;
  fetchBusinessList();
  ElMessage.success('高级搜索已应用');
};

//显示商机列表信息
const fetchBusinessList = async () => {
  loading.value = true;
  try {
    const rawParams = {
      type: queryParams.type,
      CreatedBy: queryParams.CreatedBy,
      AssignedTo: queryParams.AssignedTo,
      SalesProgressList: queryParams.SalesProgressList, //销售进度（多选）
      StartTime: queryParams.StartTime,
      EndTime: queryParams.EndTime,
      TimeType: queryParams.TimeType,
      OrderBy: queryParams.OrderBy,
      OrderDesc: queryParams.OrderDesc,
      Keyword: queryParams.Keyword,
      PageIndex: queryParams.PageIndex,
      PageSize: queryParams.PageSize,
      totalCount: queryParams.totalCount, // 总记录数
      pageCount: queryParams.pageCount, // 总页数
      UserIds: queryParams.UserIds,
      CreatedByIds: queryParams.CreatedByIds,
      CustomerId: queryParams.CustomerId || null,
      BusinessOpportunityCode: queryParams.BusinessOpportunityCode,     // 商机编号
      PriorityId: queryParams.PriorityId || null, //优先级
      BusinessOpportunityName: queryParams.BusinessOpportunityName,     // 商机名称
      SalesProgressId: queryParams.SalesProgressId || null, // 销售进度（单选）
      Budget: queryParams.Budget, //预算金额
      ExpectedDate: queryParams.ExpectedDate, //预计成交日期
      MatchMode: queryParams.MatchMode
    };
    const params = filterParams(rawParams);

    // MatchMode为数字
    if (typeof params.MatchMode === 'string') {
      params.MatchMode = params.MatchMode === 'all' ? 0 : 1;
    }

    console.log('最终请求参数:', params);
    const res = await ShowBusinessOpportunityList(params);
    customerList.value = res.data;
    queryParams.totalCount = res.totalCount || 0; // 更新总记录数
    queryParams.pageCount = res.pageCount || 0; // 更新总页数
  } catch (e) {
    ElMessage.error('获取商机列表失败');
    queryParams.totalCount = 0; // 重置总记录数
    queryParams.pageCount = 0; // 重置总页数
  } finally {
    loading.value = false;
  }
};

//查询线索列表（顶部）
const handleQuery = () => {
  queryParams.PageIndex = 1;
  fetchBusinessList();
};

//查询查看范围
const handleScopeChange = (val: number) => {
  queryParams.type = val;
  queryParams.AssignedTo = '';
  queryParams.CreatedBy = '';
  queryParams.UserIds = [];
  queryParams.CreatedByIds = [];
  if (val === 1) {
    queryParams.AssignedTo = user.userInfo.id || '';
  } else if (val === 2) {
    queryParams.CreatedBy = user.userInfo.id || '';
  }
  handleQuery();
};

// 重置查询条件
const handleResetQuery = () => {
  queryParams.SalesProgressList = []; //销售进度（多选）
  queryParams.TimeType = 2;
  queryParams.OrderBy = 0;
  queryParams.Keyword = "";
  queryParams.PageIndex = 1;
  queryParams.PageSize = 10;
  queryParams.UserIds = [];
  queryParams.CreatedByIds = [];
  queryParams.CustomerId = 0; // 所属客户
  queryParams.BusinessOpportunityCode = '';    // 商机编号
  queryParams.PriorityId = 0; //优先级
  queryParams.BusinessOpportunityName = '';     // 商机名称
  queryParams.SalesProgressId = 0; // 销售进度（单选）
  queryParams.Budget = 0; //预算金额
  queryParams.ExpectedDate = ''; //预计成交日期
  queryParams.MatchMode = 0
  handleQuery();
};
const handleSelectionChange = (val: any[]) => {
  selectedIds.value = val.map(item => item.id);
};

//分页
const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
  queryParams.PageSize = val;
  fetchBusinessList();
}
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)
  queryParams.PageIndex = val;
  fetchBusinessList();
}

// 添加线索方法
const handleAddClue = () => {
  addbusinessdialogVisible.value = true;
};
// const handleEdit = (row: any) => {
//   ElMessage.info('编辑功能开发中...');
// };
// const handleFollow = (row: any) => {
//   ElMessage.info('跟进功能开发中...');
// };
// const handleDelete = (row: any) => {
//   ElMessage.info('删除功能开发中...');
// };

// 处理排序点击事件
// 0: 按最后跟进时间排序, 1: 按下次联系时间排序, 2: 按创建时间排序
// 如果当前排序字段与点击的字段相同，则切换升降序；否则设置为降序
const handleOrderClick = (value: number) => {
  if (queryParams.OrderBy === value) {
    queryParams.OrderDesc = !queryParams.OrderDesc;
  } else {
    queryParams.OrderBy = value;
    queryParams.OrderDesc = true;
  }
  fetchBusinessList();
};

// 处理查询参数，过滤掉不必要的参数
// 例如空字符串、undefined、null等
function filterParams(params: any) {
  const result: any = {};
  Object.keys(params).forEach(key => {
    const val = params[key];
    // Guid类型不能传空字符串或0
    if (
      val === '' ||
      val === undefined ||
      val === null ||
      (Array.isArray(val) && val.length === 0) ||
      (typeof val === 'number' && val === 0 && (key === 'ClueSourceId' || key === 'IndustryId'))
    ) {
      // 跳过
    } else {
      // 处理响应式数组
      if (Array.isArray(val)) {
        result[key] = Array.from(val);
      } else {
        result[key] = val;
      }
    }
  });
  return result;
}

// 判断时间是否有效
function isValidTime(val: any) {
  if (!val) return false
  // 兼容各种格式
  return !(
    val === '0001-01-01 00:00:00' ||
    val === '0001-01-01T00:00:00' ||
    val === '0001-01-01T00:00:00.000Z'
  )
}

// 显示空值处理函数
function displayValue(val: any) {
  // 你可以根据实际情况扩展
  if (
    val === undefined ||
    val === null ||
    val === '' ||
    val === 'string' ||
    val === 'null' ||
    val === 'undefined'
  ) {
    return '--'
  }
  return val
}

// 监听沟通类型和"保存为模板"勾选变化，动态获取自定义回复
watch([
  () => communicationruleForm.expectedDateId,
  () => communicationruleForm.isServe
], async ([typeId, isServe]) => {
  if (isServe && typeId) {
    await selectCustomReply(typeId);
  } else {
    customReplyList.value = [];
    communicationruleForm.customReplyId = '';
  }
});

// 钩子函数======================================================
const currentCustomerId = ref<string>(''); // 当前客户id，实际赋值方式根据你的业务调整

onMounted(() => {
  fetchBusinessList();
  selectUser(); //获取用户列表
  selectCustomer(); // 获取客户列表
  selectPriority(); //获取优先级列表
  selectSalesProgress(); //获取销售进度列表
  selectProduct(); //获取产品列表
  handleScopeChange(1); // 默认查看我负责的线索

  selectCommunicationType(); // 获取沟通类型列表
  fetchContactList(); // 获取联系记录列表
  // selectCustomReply(); // 获取自定义回复列表 - 移至watch中
});

console.log('当前登录用户信息', user.userInfo);

</script>

<style scoped>
.app-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.clue-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}

.clue-row {
  margin-bottom: 12px;
}

.clue-label {
  display: inline-block;
  width: 80px;
  color: #666;
  font-size: 20px;
  font-weight: 500;
}

.clue-link {
  margin-right: 18px;
  font-size: 14px;
}

.clue-bottom {
  margin-top: 8px;
}

.clue-bottom-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.mr8 {
  margin-right: 8px;
}

.ml16 {
  margin-left: 16px;
}

.table-card {
  margin-top: 0;
}

.clue-status-row {
  margin-bottom: 12px;
}

.clue-status-flex {
  display: flex;
  align-items: center;
}

.clue-label {
  width: 80px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
}

.clue-status-group {
  margin-left: 2px;
  display: flex;
  align-items: center;
}

.clue-status-checkbox {
  margin-right: 56px !important;
  font-size: 16px;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #1765ff !important;
  font-weight: bold;
}

:deep(.el-checkbox__label) {
  font-size: 16px;
}

.clue-large-btn {
  height: 30px !important;
  font-size: 15px !important;
  padding: 0 16px !important;
  border-radius: 5px !important;
  min-width: 90px;
  box-sizing: border-box;
}

.clue-large-input .el-input__inner {
  height: 36px !important;
  font-size: 15px !important;
  border-radius: 5px !important;
}

.clue-btn-icon {
  margin-right: 6px;
  font-size: 18px;
  vertical-align: -3px;
}

.clue-search-input {
  font-size: 16px;
}

.clue-search-btn {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 8px !important;
  height: 32px !important;
  min-width: 0;
  color: #bfbfbf;
}

.advanced-form .el-form-item {
  margin-bottom: 18px;
}

.advanced-match-flex {
  display: flex;
  align-items: center;
  position: relative;
}

.advanced-match-label {
  width: 100px;
  font-size: 14px;
  color: #303133;
  font-weight: 400;
  text-align: right;
  flex-shrink: 0;
  margin-left: 40px;
}

.advanced-match-info {
  margin-left: auto;
  color: #409eff;
  font-size: 20px;
  cursor: pointer;
}

.advanced-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 4px 0;
  min-height: 44px;
}

.advanced-dialog-title {
  font-size: 18px;
  font-weight: bold;
  color: #222;
}

.advanced-dialog-actions {
  display: flex;
  gap: 12px;
}

.advanced-dialog-btn {
  min-width: 80px;
  height: 34px;
  font-size: 15px;
  border-radius: 6px;
}

.form-item-flex {
  display: flex;
  align-items: center;
  width: 100%;
}

.form-item-flex .el-input,
.form-item-flex .el-select {
  flex: 1;
}

.advanced-info {
  margin-left: 12px;
  color: #409eff;
  font-size: 20px;
  vertical-align: middle;
  cursor: pointer;
  flex-shrink: 0;
}

.advanced-match-flex .el-radio-group {
  margin-right: 8px;
}

.order-arrows {
  display: inline-flex;
  flex-direction: column;
  margin-left: 2px;
  vertical-align: middle;
}

.arrow-icon {
  color: #bfbfbf;
  font-size: 14px;
  line-height: 1;
  height: 12px;
}

.arrow-icon.active {
  color: #1765ff;
}

/* 抽屉详情样式 */
.clue-detail-container {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drawer-icon {
  font-size: 20px;
  color: #409eff;
}

.title-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.detail-section {
  margin-bottom: 24px;
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.section-content {
  background: #fff;
  border-radius: 6px;
  padding: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  min-height: 32px;
}

.info-label {
  width: 100px;
  color: #606266;
  font-size: 14px;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
  font-size: 14px;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.phone-icon {
  color: #409eff;
  font-size: 16px;
  cursor: pointer;
}

.follow-records {
  min-height: 200px;
}

.no-records {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.remark-content {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  min-height: 60px;
}

/* 抽屉详情新样式 */
.clue-detail-new-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.drawer-title-big {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  flex: 1;
  margin-right: 20px;
}

.drawer-btns {
  display: flex;
  gap: 10px;
}

.drawer-info-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #606266;
}

.info-item span {
  color: #909399;
  margin-right: 5px;
}

.status-text {
  font-weight: bold;
  color: #67c23a;
  /* 成功状态颜色 */
}

.clue-detail-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.detail-table-flex {
  display: flex;
  justify-content: center;
  gap: 180px;
  margin: 0 auto 20px auto;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
  max-width: 1000px;
  min-width: 700px;
}

.detail-table-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  color: #303133;
}

.detail-row span {
  color: #909399;
  margin-right: 10px;
}


.contact-records {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
}

.add-contact-input {
  margin-bottom: 15px;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
}

.contact-item {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.contact-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.contact-type {
  background: #ecf5ff;
  color: #409eff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: bold;
}

.contact-time {
  color: #909399;
  font-size: 13px;
}

.contact-user {
  color: #606266;
  font-size: 13px;
}

.contact-content {
  color: #303133;
  font-size: 14px;
  line-height: 1.5;
  margin-top: 5px;
}

.divider-mt {
  margin-top: 20px;
}

.detail-right {
  flex: 1;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.clue-detail-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  margin-top: 10px;
}

.clue-detail-title {
  font-size: 22px;
  font-weight: bold;
  color: #222;
  line-height: 1;
  margin-left: 2px;
}

.drawer-bottom-form {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.drawer-bottom-form .el-input__inner {
  border-radius: 8px;
}

.drawer-bottom-form .el-textarea__inner {
  border-radius: 8px;
}

.drawer-bottom-form .el-date-editor.el-input,
.drawer-bottom-form .el-date-editor.el-input__inner {
  border-radius: 8px;
}

.drawer-bottom-form .el-checkbox__inner {
  border-radius: 4px;
}

.drawer-bottom-form .el-button {
  border-radius: 6px;
}
</style>