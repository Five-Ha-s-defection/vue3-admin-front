<template>
  <div>
    <el-dialog v-model="visible" title="菜单搜索" width="500px" :close-on-click-modal="false">
      <el-input v-model="keyword" placeholder="请输入菜单名称关键词" clearable @input="onSearchInput"
        @keyup.enter="searchMenusS" />

      <el-scrollbar height="300px" class="mt-3">
        <el-empty v-if="searchResults.length === 0 && !loading" description="暂无搜索结果" />
        <ul v-else class="menu-result-list">
          <li v-for="item in searchResults" :key="item.id" class="result-item" @click="goToMenu(item)">
            <div v-html="item.highlightedMenuName || item.menuName"></div>
            <div class="menu-path">{{ item.menuPath }}</div>
          </li>
        </ul>
      </el-scrollbar>

      <el-pagination class="mt-3" background layout="prev, pager, next" :total="total" :page-size="pageSize"
        :current-page="pageIndex" @current-change="handlePageChange" />
    </el-dialog>

    <!-- 搜索图标按钮 -->
    <el-button icon="Search" circle class="menu-search-btn" @click="visible = true" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { MenuSearchResultDto } from "@/types/menu"; // 你定义的类型
import { searchMenus } from "@/api/MenuSearch/menuSearch.api"; // 你定义的搜索 API

const visible = ref(false);
const keyword = ref("");
const searchResults = ref<MenuSearchResultDto[]>([]);
const loading = ref(false);

const pageIndex = ref(1);
const pageSize = ref(10);
const total = ref(0);

const router = useRouter();

// 搜索菜单数据
const searchMenusS = async () => {
  if (!keyword.value.trim()) return;

  loading.value = true;
  try {
    const res:any = await searchMenus({
      keyword: keyword.value,
      pageIndex: pageIndex.value,
      pageSize: pageSize.value,
    });
    if (res && res.data) {
      searchResults.value = res.data;
      total.value = res.totalCount;
    } else {
      ElMessage.error(res.message);
    }
  } catch (e) {
    ElMessage.error("搜索失败");
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  pageIndex.value = page;
  searchMenusS();
};

const onSearchInput = () => {
  pageIndex.value = 1;
  searchMenusS();
};

const goToMenu = (item: MenuSearchResultDto) => {
  visible.value = false;
  // 获取所有路由
  const routes = router.getRoutes();

  // 根据菜单项的 path 查找父路径
  const route = routes.find(r => r.path.includes(item.path));
  
  let parentPath = '';
  
  // 如果找到父路径，拼接完整路径
  if (route) {
    parentPath = route.path.split('/')[1]; // 获取第一个路径部分
  }

  // 拼接完整路径
  const fullPath = parentPath ? `/${parentPath}/${item.path}` : item.path;

  if (fullPath) {
    router.push(fullPath);
  } else {
    ElMessage.warning("该菜单未配置路由");
  }
};

// 支持 Ctrl + K 快捷打开
onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      visible.value = true;
    }
  });
});
</script>

<style scoped>
.menu-result-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.result-item:hover {
  background-color: #f5f7fa;
}

.menu-path {
  font-size: 12px;
  color: #999;
}
.menu-search-btn {
  position: absolute;
  top: 10px;  /* 调整垂直位置 */
  right: 6px; /* 调整水平位置 */
  z-index: 9999; /* 确保按钮在最上层 */
  border: none;  /* 移除边框 */
  border-radius: 0;  /* 移除圆角 */
  background: transparent;  /* 设置透明背景 */
}
</style>
