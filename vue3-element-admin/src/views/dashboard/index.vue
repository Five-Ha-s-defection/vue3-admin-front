<template>
  <github-corner class="github-corner" />

  <el-card shadow="never" class="mt-2">
    <div class="flex flex-wrap items-center justify-between">
      <!-- 左侧问候语区域 -->
      <div class="flex-1 flex items-center min-w-0">
        <img
          class="w80px h80px rounded-full shadow-lg border border-gray-200"
          :src="userStore.userInfo.avatar + '?imageView2/1/w/80/h/80'"
        />
        <div class="ml-5 min-w-0">
          <p class="text-lg font-bold truncate">{{ greetings }}</p>
          <p class="text-sm text-gray-500 mt-1 truncate">
            今日天气晴朗，气温在15℃至25℃之间，东南风。
          </p>
        </div>
      </div>
      <!-- 右侧图标区域 - PC端 -->
      <div class="hidden sm:block">
        <div class="flex items-end space-x-6">
          <el-icon class="mr-2px"><Folder /></el-icon>
          仓库
        </div>
        <div class="mt-3 whitespace-nowrap flex items-center space-x-2">
          <el-link href="https://gitee.com/youlaiorg/vue3-element-admin" target="_blank">
            <div class="i-svg:gitee text-lg color-#F76560" />
          </el-link>
          <el-link href="https://github.com/youlaitech/vue3-element-admin" target="_blank">
            <div class="i-svg:github text-lg color-#4080FF" />
          </el-link>
          <el-link href="https://gitcode.com/youlai/vue3-element-admin" target="_blank">
            <div class="i-svg:gitcode text-lg color-#FF9A2E" />
          </el-link>
        </div>
      </div>
      <!-- 文档 -->
      <div>
        <div class="font-bold color-#4080ff text-sm flex items-center">
          <el-icon class="mr-2px"><Document /></el-icon>
          文档
        </div>
        <div class="mt-3 whitespace-nowrap flex items-center space-x-2">
          <el-link href="https://juejin.cn/post/7228990409909108793" target="_blank">
            <div class="i-svg:juejin text-lg" />
          </el-link>
          <el-link href="https://youlai.blog.csdn.net/article/details/130191394" target="_blank">
            <div class="i-svg:csdn text-lg" />
          </el-link>
          <el-link href="https://www.cnblogs.com/haoxianrui/p/17331952.html" target="_blank">
            <div class="i-svg:cnblogs text-lg" />
          </el-link>
        </div>
      </div>
      <!-- 视频 -->
      <div>
        <div class="font-bold color-#f76560 text-sm flex items-center">
          <el-icon class="mr-2px"><VideoCamera /></el-icon>
          视频
        </div>
        <div class="mt-3 whitespace-nowrap flex items-center space-x-2">
          <el-link href="https://www.bilibili.com/video/BV1eFUuYyEFj" target="_blank">
            <div class="i-svg:bilibili text-lg" />
          </el-link>
        </div>
      </div>
    </div>
    <!-- 移动端图标区域 -->
    <div class="w-full sm:hidden mt-3">
      <div class="flex justify-end space-x-4 overflow-x-auto">
        <el-link href="https://gitcode.com/youlai/vue3-element-admin" target="_blank">
          <div class="i-svg:gitcode text-lg color-#FF9A2E" />
        </el-link>
        <!-- 文档图标 -->
        <el-link href="https://juejin.cn/post/7228990409909108793" target="_blank">
          <div class="i-svg:juejin text-lg" />
        </el-link>
        <el-link href="https://www.cnblogs.com/haoxianrui/p/17331952.html" target="_blank">
          <div class="i-svg:cnblogs text-lg" />
        </el-link>
        <!-- 视频图标 -->
        <el-link href="https://www.bilibili.com/video/BV1eFUuYyEFj" target="_blank">
          <div class="i-svg:bilibili text-lg" />
        </el-link>
      </div>
    </div>
  </el-card>

  <!-- 静态内容区，仿照第一张图写死 -->
  <el-row :gutter="24" class="mt-7 stat-row">
    <el-col v-for="item in statList" :key="item.title" :span="4">
      <el-card class="stat-card">
        <div v-if="item.icon" class="stat-icon">
          <el-icon :size="32" :style="{ color: item.color }">
            <component :is="item.icon" />
          </el-icon>
        </div>
        <div class="stat-title">{{ item.title }}</div>
        <div class="stat-value" :style="item.color ? { color: item.color } : {}">
          {{ item.value }}
        </div>
      </el-card>
    </el-col>
  </el-row>

  <el-row :gutter="24" class="mt-7">
    <el-col :span="12">
      <el-card class="table-card">
        <div class="card-title">今日新增提醒客户</div>
        <el-table :data="[]" style="width: 100%" size="small" border>
          <el-table-column prop="客户编号" label="客户编号" align="center" />
          <el-table-column prop="客户名称" label="客户名称" align="center" />
          <el-table-column prop="联系电话" label="联系电话" align="center" />
          <el-table-column prop="客户负责人" label="客户负责人" align="center" />
        </el-table>
        <div class="no-data">没有数据</div>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card class="table-card">
        <div class="card-title">3日内提醒回客户</div>
        <el-table
          :data="[
            {
              客户编号: 'C-202506301706-8BEB',
              客户名称: 'Ethan',
              联系电话: '11111111111',
              客户负责人: 'crmtest',
            },
          ]"
          style="width: 100%"
          size="small"
          border
        >
          <el-table-column prop="客户编号" label="客户编号" align="center" />
          <el-table-column prop="客户名称" label="客户名称" align="center" />
          <el-table-column prop="联系电话" label="联系电话" align="center" />
          <el-table-column prop="客户负责人" label="客户负责人" align="center" />
        </el-table>
      </el-card>
    </el-col>
  </el-row>

  <el-row :gutter="24" class="mt-7">
    <el-col :span="12">
      <el-card class="table-card">
        <div class="card-title">客户来源统计</div>
        <el-table :data="sourceList" style="width: 100%" size="small" border>
          <el-table-column prop="渠道" label="渠道" align="center" />
          <el-table-column prop="客户数量" label="客户数量" align="center" />
          <el-table-column prop="成交客户数" label="成交客户数" align="center" />
          <el-table-column prop="客户成交率" label="客户成交率" align="center" />
        </el-table>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card class="table-card">
        <div class="card-title">客户成交统计</div>
        <div class="no-data">没有数据</div>
      </el-card>
    </el-col>
  </el-row>

  <el-row :gutter="24" class="mt-7">
    <el-col :span="12">
      <el-card class="table-card">
        <div class="card-title">员工行动统计</div>
        <el-table
          :data="[{ 员工姓名: 'crmtest', 跟进客户数: 0, 跟进记录数: 0 }]"
          style="width: 100%"
          size="small"
          border
        >
          <el-table-column prop="员工姓名" label="员工姓名" align="center" />
          <el-table-column prop="跟进客户数" label="跟进客户数" align="center" />
          <el-table-column prop="跟进记录数" label="跟进记录数" align="center" />
        </el-table>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card class="table-card">
        <div class="card-title">所有动态</div>
        <el-timeline>
          <el-timeline-item timestamp="2025-07-09" placement="top" color="#409EFF">
            <div class="timeline-item">
              <div class="timeline-content">
                <span class="timeline-user">crmtest-crmtest</span>
                添加了收款
                <el-link type="primary">R-20250709-0007</el-link>
                <span class="timeline-time">14:24</span>
              </div>
              <div class="timeline-content">
                <span class="timeline-user">crmtest-crmtest</span>
                添加了收款
                <el-link type="primary">M-20250709-0064</el-link>
                <span class="timeline-time">14:23</span>
              </div>
              <div class="timeline-content">
                <span class="timeline-user">crmtest-crmtest</span>
                添加了合同
                <span class="timeline-time">14:22</span>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "@/store/modules/user.store";
import {
  Phone,
  Document,
  Folder,
  VideoCamera,
  Money,
  UserFilled,
  EditPen,
} from "@element-plus/icons-vue";
const userStore = useUserStore();
const greetings = computed(() => {
  const hours = new Date().getHours();
  const nickname = userStore.userInfo.realName || userStore.userInfo.username || "用户";
  if (hours < 6) return `凌晨好，${nickname}`;
  if (hours < 9) return `早上好，${nickname}`;
  if (hours < 12) return `上午好，${nickname}`;
  if (hours < 14) return `中午好，${nickname}`;
  if (hours < 17) return `下午好，${nickname}`;
  if (hours < 19) return `傍晚好，${nickname}`;
  if (hours < 22) return `晚上好，${nickname}`;
  return `夜深了，${nickname}`;
});

const statList = [
  { title: "客户数", value: 2, icon: UserFilled, color: "#409EFF" },
  { title: "联系人", value: 0, icon: Phone, color: "#67C23A" },
  { title: "联系记录", value: 0, icon: EditPen, color: "#E6A23C" },
  { title: "合同", value: 3, icon: Document, color: "#F56C6C" },
  { title: "合同金额", value: 200990, icon: Money, color: "#FF6A00" },
];

const sourceList = [
  { 渠道: "电话营销", 客户数量: 0, 成交客户数: 0, 客户成交率: "0%" },
  { 渠道: "网络营销", 客户数量: 0, 成交客户数: 0, 客户成交率: "0%" },
  { 渠道: "上门拜访", 客户数量: 0, 成交客户数: 0, 客户成交率: "0%" },
  { 渠道: "客户推荐", 客户数量: 0, 成交客户数: 0, 客户成交率: "0%" },
];
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 24px;
  background: #f7f8fa;
  min-height: 100vh;
  .github-corner {
    position: absolute;
    top: 0;
    z-index: 1;
    border: 0;
  }
  .stat-row {
    margin-bottom: 32px;
  }
  .stat-card {
    text-align: center;
    min-height: 120px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .stat-icon {
      margin-bottom: 8px;
    }
    .stat-title {
      font-size: 15px;
      color: #888;
      margin-bottom: 2px;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      margin-top: 2px;
      letter-spacing: 1px;
    }
  }
  .table-card {
    min-height: 320px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
    border-radius: 12px;
    margin-bottom: 24px;
    .card-title {
      font-size: 17px;
      font-weight: bold;
      margin-bottom: 18px;
      color: #333;
      letter-spacing: 1px;
    }
    .no-data {
      text-align: center;
      color: #bbb;
      margin: 24px 0 8px 0;
      font-size: 15px;
    }
  }
  .timeline-item {
    padding: 0 0 0 8px;
    .timeline-content {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin-bottom: 6px;
      font-size: 15px;
      color: #444;
      .timeline-user {
        font-weight: 500;
        margin-right: 6px;
      }
      .timeline-time {
        margin-left: auto;
        color: #aaa;
        font-size: 13px;
        min-width: 48px;
        text-align: right;
      }
    }
  }
}
</style>
