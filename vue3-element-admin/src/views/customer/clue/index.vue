<template>
  <div class="app-container">
    <el-card class="search-card" shadow="never">
      <div class="clue-header">
        <span>线索列表 | 总记录数：<b>{{ total }}</b> 条</span>
      </div>
      <!-- 查看范围 -->
      <el-row class="clue-row" align="middle">
        <el-col :span="24">
          <span class="clue-label">查看范围</span>
          <el-link v-for="item in scopeOptions" :key="item.value" :underline="false"
            :type="queryParams.type === item.value ? 'primary' : 'default'" class="clue-link"
            @click="queryParams.type = item.value">{{ item.label }}</el-link>
        </el-col>
      </el-row>
      <!-- 线索状态 -->
      <el-row class="clue-row clue-status-row" align="middle">
        <el-col :span="24">
          <div class="clue-status-flex">
            <span class="clue-label">线索状态</span>
            <el-checkbox-group v-model="queryParams.Status" @change="handleQuery">
              <el-checkbox v-for="item in statusOptions" :key="item.value" :label="item.value">{{ item.label
                }}</el-checkbox>
            </el-checkbox-group>
          </div>
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
            添加线索
          </el-button>
          <el-button type="warning" @click="handleResetQuery()">
            重置
          </el-button>
        </el-col>
        <el-col :span="12" class="clue-bottom-right">
          <el-input v-model="queryParams.Keyword" placeholder="姓名/手机号/邮箱/公司名称" clearable style="width: 320px"
            class="mr8 clue-large-input clue-search-input" @keyup.enter="handleQuery">
            <template #append>
              <el-button class="clue-search-btn" link @click="handleQuery">
                <el-icon>
                  <Search />
                </el-icon>
              </el-button>
            </template>
          </el-input>
          <el-button icon="el-icon-filter" class="mr8 clue-large-btn"
            @click="advancedDialogVisible = true">高级搜索</el-button>
          <el-dropdown>
            <el-button class="clue-large-btn">操作<el-icon>
                <ArrowDown />
              </el-icon></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>批量导出</el-dropdown-item>
                <el-dropdown-item>批量删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-col>
      </el-row>
    </el-card>

    <!-- 显示线索列表信息 -->
    <!-- 表格区域和分页保持不变 -->
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="clueList" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="状态" prop="status" width="80" align="center">
          <template #default="{ row }">
            <el-tag>{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="姓名" prop="clueName" min-width="100" />
        <el-table-column label="电话" prop="cluePhone" min-width="120">
          <template #default="{ row }">
            <span>{{ row.cluePhone }}</span>
            <el-icon style="margin-left:4px;"><i class="el-icon-phone" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="线索来源" prop="clueSourceName" min-width="100" />
        <el-table-column label="邮箱" prop="clueEmail" min-width="160" />
        <el-table-column label="公司名称" prop="companyName" min-width="120" />
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
        <!-- <el-table-column label="录入方式"  min-width="100" /> -->
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-dropdown>
              <el-button type="primary" link>操作</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleEdit(row)">编辑</el-dropdown-item>
                  <el-dropdown-item @click="handleFollow(row)">跟进</el-dropdown-item>
                  <el-dropdown-item divided @click="handleDelete(row)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="queryParams.PageIndex" v-model:page-size="queryParams.PageSize"
        :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px;" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
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
          <el-col :span="24"><el-form-item label="线索编号">
              <div class="form-item-flex">
                <el-input v-model="queryParams.ClueCode" placeholder="不包含线索编码" />
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="姓名">
              <div class="form-item-flex">
                <el-input v-model="queryParams.ClueName" />
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="电话">
              <div class="form-item-flex">
                <el-input v-model="queryParams.CluePhone" />
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="线索来源">
              <div class="form-item-flex">
                <el-select v-model="queryParams.ClueSourceId"  placeholder="请选择">
                  <el-option v-for="item in cluesourceList" :label="item.clueSourceName" :value="item.id" />
                </el-select>
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="邮箱">
              <div class="form-item-flex">
                <el-input v-model="queryParams.ClueEmail" />
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="微信号">
              <div class="form-item-flex">
                <el-input v-model="queryParams.ClueWechat" />
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="QQ">
              <div class="form-item-flex">
                <el-input v-model="queryParams.ClueQQ" />
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="公司名称">
              <div class="form-item-flex">
                <el-input v-model="queryParams.CompanyName" />
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="行业">
              <div class="form-item-flex">
                <el-select v-model="queryParams.IndustryId"  placeholder="请选择">
                  <el-option v-for="item in industryList" :label="item.industryName" :value="item.id" />
                </el-select>
                <el-tooltip content="输入/选择内容模糊查询" placement="right">
                  <el-icon class="advanced-info">
                    <InfoFilled />
                  </el-icon>
                </el-tooltip>
              </div>
            </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="地址">
              <div class="form-item-flex">
                <el-input v-model="queryParams.Address" />
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
import { ArrowDown, ArrowUp, DocumentAdd, Search, InfoFilled, CircleClose } from '@element-plus/icons-vue';
import { ShowClueList, GetUser,GetClueSource,GetIndustry} from '@/api/CustomerProcess/Clue/clue.api';
import moment from 'moment';
import dayjs from 'dayjs';


const scopeOptions = [
  { label: '我负责的', value: 0 },
  { label: '我创建的', value: 1 },
  { label: '全部', value: 2 }
];
const orderOptions = [
  { label: '按最后跟进时间排序', value: 0 },
  { label: '按下次联系时间排序', value: 1 },
  { label: '按创建时间排序', value: 2 }
];

const loading = ref(false);
const total = ref(0);
const clueList = ref<any[]>([]);
const selectedIds = ref<any[]>([]);

const queryParams = reactive({
  type: undefined as number | undefined, // 线索类型
  CreatedBy: '', // 创建人uuid
  AssignedTo: '', // 负责人uuid
  Status: [0, 1, 2] as number[], // 多选
  StartTime: '', // string (date-time)
  EndTime: '', // string (date-time)
  TimeType: undefined as number | undefined, // 0,1,2
  OrderBy: undefined as number | undefined, // 0,1,2
  OrderDesc: false, // boolean
  Keyword: '', // string
  PageIndex: 1, // int32
  PageSize: 10, // int32
  UserIds: [],      // 负责人
  CreatedByIds: [], // 创建人
  ClueCode: '',     // 线索编号
  ClueName: '',     // 姓名
  CluePhone: '',    // 电话
  ClueSourceId: 0, // 线索来源
  ClueEmail: '',    // 邮箱
  clueSource: '',   // 线索来源
  ClueWechat: '',   // 微信号
  ClueQQ: '',       // QQ
  CompanyName: '',  // 公司名称
  IndustryId: 0,   // 行业
  Address: '',      // 地址
  MatchMode: 0, // 0: 全部满足, 1: 部分满足
});

const advancedDialogVisible = ref(false);

const statusOptions = [
  { label: '未跟进', value: 0 },
  { label: '跟进中', value: 1 },
  { label: '已转换', value: 2 }
];

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

const getStatusText = (status: number | string) => {
  // 先转成数字，防止后端返回字符串类型
  const s = Number(status);
  switch (s) {
    case 0: return "未跟进";
    case 1: return "跟进中";
    case 2: return "已转换";
    default: return status;
  }
};

// 下拉框绑定用户列表
const userList: any = ref([])
const selectUser = async () => {
  await GetUser()
    .then(res => {
      userList.value = res
    })
}

//下拉框绑定线索来源列表
const cluesourceList: any = ref([])
const selectClueSource = async () => {
  await GetClueSource()
    .then(res => {
      cluesourceList.value = res
    })
}

//下拉框绑定行业列表
const industryList: any = ref([])
const selectIndustry = async () => {
  await GetIndustry()
    .then(res => {
      industryList.value = res
    })
}

//高级筛选
const handleAdvancedSearch = () => {
  // 这里可以将queryParams的内容合并到queryParams并请求
  advancedDialogVisible.value = false;
  fetchClueList();
  ElMessage.success('高级搜索已应用');
};

//显示线索列表信息
const fetchClueList = async () => {
  loading.value = true;
  try {
    const rawParams = {
      type: queryParams.type,
      CreatedBy: queryParams.CreatedBy,
      AssignedTo: queryParams.AssignedTo,
      Status: queryParams.Status,
      StartTime: queryParams.StartTime,
      EndTime: queryParams.EndTime,
      TimeType: queryParams.TimeType,
      OrderBy: queryParams.OrderBy,
      OrderDesc: queryParams.OrderDesc,
      Keyword: queryParams.Keyword,
      PageIndex: queryParams.PageIndex,
      PageSize: queryParams.PageSize,
      UserIds: queryParams.UserIds,
      CreatedByIds: queryParams.CreatedByIds,
      ClueCode: queryParams.ClueCode,
      ClueName: queryParams.ClueName,
      CluePhone: queryParams.CluePhone,
      ClueSourceId: queryParams.ClueSourceId,
      ClueEmail: queryParams.ClueEmail,
      ClueWechat: queryParams.ClueWechat,
      ClueQQ: queryParams.ClueQQ,
      CompanyName: queryParams.CompanyName,
      IndustryId: queryParams.IndustryId,
      Address: queryParams.Address,
      MatchMode: queryParams.MatchMode
    };
    const params = filterParams(rawParams);

    // MatchMode为数字
    if (typeof params.MatchMode === 'string') {
      params.MatchMode = params.MatchMode === 'all' ? 0 : 1;
    }

    console.log('最终请求参数:', params);
    const res = await ShowClueList(params);
    clueList.value = res.data
  } catch (e) {
    ElMessage.error('获取线索列表失败');
  } finally {
    loading.value = false;
  }
};

//查询线索列表（顶部）
const handleQuery = () => {
  queryParams.PageIndex = 1;
  fetchClueList();
};

// 重置查询条件
const handleResetQuery = () => {
  queryParams.Status = [0, 1, 2];
  dateRange.value = [];
  queryParams.TimeType = 2;
  queryParams.OrderBy = 0;
  queryParams.Keyword = "";
  queryParams.UserIds = [];
  queryParams.CreatedByIds = [];
  queryParams.ClueCode = '';
  queryParams.ClueName = '';
  queryParams.CluePhone = '';
  queryParams.ClueSourceId = 0;
  queryParams.ClueEmail = '';
  queryParams.ClueWechat = '';
  queryParams.ClueQQ = '';
  queryParams.CompanyName = '';
  queryParams.IndustryId = 0;
  queryParams.Address = '';
  queryParams.MatchMode = 0; // 重置为全部满足
  queryParams.PageIndex = 1;
  queryParams.PageSize = 10;
  handleQuery();
};
const handleSelectionChange = (val: any[]) => {
  selectedIds.value = val.map(item => item.id);
};
const handleSizeChange = (val: number) => {
  queryParams.PageSize = val;
  fetchClueList();
};
const handleCurrentChange = (val: number) => {
  queryParams.PageIndex = val;
  fetchClueList();
};
const handleAddClue = () => {
  ElMessage.info('添加线索功能开发中...');
};
const handleEdit = (row: any) => {
  ElMessage.info('编辑功能开发中...');
};
const handleFollow = (row: any) => {
  ElMessage.info('跟进功能开发中...');
};
const handleDelete = (row: any) => {
  ElMessage.info('删除功能开发中...');
};


const handleOrderClick = (value: number) => {
  if (queryParams.OrderBy === value) {
    queryParams.OrderDesc = !queryParams.OrderDesc;
  } else {
    queryParams.OrderBy = value;
    queryParams.OrderDesc = true;
  }
  fetchClueList();
};

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

onMounted(() => {
  fetchClueList();
  selectUser(); // 获取用户列表
  selectClueSource(); // 获取线索来源列表
  selectIndustry(); // 获取行业列表
});
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
</style>