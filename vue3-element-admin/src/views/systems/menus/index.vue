<template>
  <el-card shadow="never">
    <!-- 操作按钮 -->
    <div class="mb-4 flex justify-between items-center">
      <div>
        <el-button type="primary" @click="openAddDialog">新增菜单</el-button>
        <el-button @click="expandAll">展开全部</el-button>
        <el-button @click="collapseAll">收起全部</el-button>
      </div>
    </div>

    <!-- 菜单表格 -->
    <el-table ref="menuTableRef" :data="menuList" row-key="id" border style="width: 100%">
      <el-table-column prop="menuName" label="菜单名称" />
      <el-table-column prop="path" label="路径" />
      <el-table-column prop="component" label="组件路径" />
      <el-table-column prop="icon" label="图标" width="80">
        <template #default="{ row }">
          <component :is="formatIconName(row.icon)" class="text-xl" />
        </template>
      </el-table-column>
      <el-table-column prop="hidden" label="是否隐藏" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isVisible ? 'info' : 'success'">
            {{ row.isVisible ? "否" : "是" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteMenu(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑菜单弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" label-width="100px" :rules="rules">
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="treeOptions"
            :props="{ label: 'label', children: 'children', value: 'id' }"
            check-strictly
            placeholder="请选择上级菜单"
          />
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="form.path" placeholder="如 /system/menu" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="form.component" placeholder="如 system/menu/index" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select
            v-model="form.icon"
            placeholder="请选择图标"
            popper-class="icon-select-dropdown"
            style="width: 100%"
          >
            <el-option v-for="icon in iconOptions" :key="icon" :label="icon" :value="icon">
              <div class="icon-option">
                <component :is="iconMap[icon]" class="icon-img" />
                <div class="icon-label">{{ icon }}</div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="权限编码" prop="permissionCode">
          <el-input v-model="form.permissionCode" placeholder="如 system:menu:add" />
        </el-form-item>
        <el-form-item label="是否隐藏" prop="hidden">
          <el-switch v-model="form.isVisible" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import MenuAPI, { MenuInfo } from "@/api/system/menu.api";
import type { ElTable } from "element-plus";
import * as Icons from "@element-plus/icons-vue";

// el-table 引用
const menuTableRef = ref<InstanceType<typeof ElTable>>();

// 菜单数据列表
const menuList: any = ref<MenuInfo[]>([]);

// 弹窗状态与标题
const dialogVisible = ref(false);
const dialogTitle = ref("");

// 表单数据
const form = reactive<MenuInfo>({
  id: "",
  parentId: "0",
  menuName: "",
  path: "",
  component: "",
  icon: "",
  permissionCode: "",
  isVisible: false,
  sort: 1,
});

// 表单验证规则
const rules = {
  menuName: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  path: [{ required: true, message: "请输入路径", trigger: "blur" }],
};
const formRef = ref<FormInstance>();

// 将小写图标名如 "user" 转换为组件名 "User"
const formatIconName = (icon: string) => {
  if (!icon) return "";
  return icon.charAt(0).toUpperCase() + icon.slice(1);
};

// 图标映射
const iconMap: Record<string, any> = {
  user: Icons.User,
  menu: Icons.Menu,
  setting: Icons.Setting,
  lock: Icons.Lock,
  edit: Icons.Edit,
  plus: Icons.Plus,
  delete: Icons.Delete,
  homeFilled: Icons.HomeFilled,
  list: Icons.List,
  pieChart: Icons.PieChart,
};

// 图标选项
const iconOptions = [
  "user",
  "menu",
  "setting",
  "lock",
  "edit",
  "plus",
  "delete",
  "homeFilled",
  "list",
  "pieChart",
];

//展开所有行
const expandAll = () => {
  const expand = (list: any[]) => {
    list.forEach((item) => {
      menuTableRef.value?.toggleRowExpansion(item, true);
      if (item.children?.length) expand(item.children);
    });
  };
  expand(menuList.value);
};

//收起所有行
const collapseAll = () => {
  const collapse = (list: any[]) => {
    list.forEach((item) => {
      menuTableRef.value?.toggleRowExpansion(item, false);
      if (item.children?.length) collapse(item.children);
    });
  };
  collapse(menuList.value);
};

// 树形菜单选项
const treeOptions = ref<any[]>([]);

// 获取菜单数据
const loadMenuList = async () => {
  const res: any = await MenuAPI.getMenuTree();
  menuList.value = res;
  treeOptions.value = [
    { id: "0", label: "根目录", children: res.map((item: any) => convertToTreeOption(item)) },
  ];
};

//递归转为el-el-tree-select 可识别的数据结构
const convertToTreeOption = (item: any) => {
  return {
    id: item.id,
    label: item.menuName,
    children: item.children?.map(convertToTreeOption) || [],
  };
};

// 打开新增窗口
const openAddDialog = () => {
  Object.assign(form, {
    id: "",
    parentId: "0",
    menuName: "",
    path: "",
    component: "",
    icon: "",
    permissionCode: "",
    hidden: false,
    sort: 1,
  });
  dialogTitle.value = "新增菜单";
  dialogVisible.value = true;
};

// 打开编辑窗口
const openEditDialog = (row: any) => {
  Object.assign(form, row);
  form.parentId = String(row.parentId ?? "0");
  console.log("form.parentId", form.parentId);
  dialogTitle.value = "编辑菜单";
  dialogVisible.value = true;
};

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate();
  if (form.id) {
    await MenuAPI.updateMenu(form.id, form);
    ElMessage.success("更新成功");
  } else {
    await MenuAPI.addMenu(form);
    ElMessage.success("新增成功");
  }
  dialogVisible.value = false;
  await loadMenuList();
};

// 删除菜单
const deleteMenu = async (id: string) => {
  // 根据 id 获取菜单名称（可从 menuList 中查找）
  const menu = findMenuById(menuList.value, id);
  if (!menu) {
    ElMessage.warning("菜单不存在");
    return;
  }
  ElMessageBox.confirm(`确定要删除"${menu.menuName}"菜单吗？`, "提示", {
    type: "warning",
  }).then(async () => {
    await MenuAPI.deleteMenu(id);
    ElMessage.success("删除成功");
    await loadMenuList();
  });
};
// 根据 id 查找菜单 递归查找菜单名称
function findMenuById(menuList: any[], id: string): any | null {
  for (const item of menuList) {
    if (item.id === id) return item;
    if (item.children?.length) {
      const found = findMenuById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

// 初始化
onMounted(() => {
  loadMenuList();
});
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
.icon-select-dropdown .el-select-dropdown__wrap {
  padding: 12px 8px;
}
.icon-select-dropdown .el-select-dropdown__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 12px;
  justify-content: start;
}

.icon-option {
  width: 60px;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.icon-option:hover {
  background: #f5f7fa;
}

.icon-img {
  font-size: 20px;
  line-height: 1;
  margin-bottom: 4px;
}

.icon-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}
</style>
