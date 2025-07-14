<template>
  <div>
    <h3 text-center m-0 mb-20px>{{ t("login.login") }}</h3>
    <el-form
      ref="loginFormRef"
      :model="loginFormData"
      :rules="loginRules"
      size="large"
      :validate-on-rule-change="false"
    >
      <!-- 用户名 -->
      <el-form-item prop="username">
        <el-input v-model.trim="loginFormData.UserName" :placeholder="t('login.username')">
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 密码 -->
      <el-tooltip :visible="isCapsLock" :content="t('login.capsLock')" placement="right">
        <el-form-item prop="password">
          <el-input
            v-model.trim="loginFormData.Password"
            :placeholder="t('login.password')"
            type="password"
            show-password
            @keyup="checkCapsLock"
            @keyup.enter="handleLoginSubmit"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-tooltip>

      <!-- 验证码 -->
      <el-form-item prop="captchaCode">
        <el-row :gutter="8" align="middle">
          <el-col :span="14">
            <el-input
              v-model.trim="loginFormData.captchaCode"
              :placeholder="t('login.captchaCode')"
              maxlength="6"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="10">
            <img
              :src="captchaImg"
              style="height: 38px; cursor: pointer; border-radius: 4px; border: 1px solid #eee"
              :alt="t('login.captchaCode')"
              @click="getCaptcha"
            />
          </el-col>
        </el-row>
      </el-form-item>

      <div class="flex-x-between w-full">
        <el-checkbox v-model="loginFormData.rememberMe">{{ t("login.rememberMe") }}</el-checkbox>
        <el-link type="primary" underline="never" @click="toOtherForm('resetPwd')">
          {{ t("login.forgetPassword") }}
        </el-link>
      </div>

      <!-- 登录按钮 -->
      <el-form-item>
        <el-button :loading="loading" type="primary" class="w-full" @click="handleLoginSubmit">
          {{ t("login.login") }}
        </el-button>
      </el-form-item>
    </el-form>

    <div flex-center gap-10px>
      <el-text size="default">{{ t("login.noAccount") }}</el-text>
      <el-link type="primary" underline="never" @click="toOtherForm('register')">
        {{ t("login.reg") }}
      </el-link>
    </div>

   
  </div>
</template>
<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { LocationQuery, RouteLocationRaw, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
//import AuthAPI, { type LoginFormData } from "@/api/auth.api";
import { type LoginFormData } from "@/api/auth.api";
import router from "@/router";
import { useUserStore } from "@/store";
import { Auth } from "@/utils/auth";
import UserAPI from "@/api/User/user.api"; // 你的API方法

const { t } = useI18n();
const userStore = useUserStore();
const route = useRoute();

//onMounted(() => getCaptcha());

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
// 是否大写锁定
const isCapsLock = ref(false);
// 验证码图片Base64字符串
//const captchaBase64 = ref();
// 记住我
const rememberMe = Auth.getRememberMe();

const captchaImg = ref("");
const captchaId = ref(""); // 用于后端校验

const loginFormData = ref<LoginFormData>({
  UserName: "admin",
  Password: "123",
  captchaKey: "",
  captchaCode: "",
  rememberMe,
});
// 表单验证规则
const loginRules = computed(() => {
  return {
    UserName: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.username.required"),
      },
    ],
    Password: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.password.required"),
      },
      {
        min: 3,
        message: t("login.message.password.min"),
        trigger: "blur",
      },
    ],
    captchaCode: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.captchaCode.required"),
      },
    ],
  };
});

// 获取验证码
async function getCaptcha() {
  // 生成唯一id（可用uuid或时间戳）
  captchaId.value = Date.now().toString();
  // 调用API
  const res: any = await UserAPI.getCaptcha(captchaId.value);
  captchaImg.value = res.img; // 后端返回 { img: "data:image/png;base64,..." }
  loginFormData.value.captchaKey = captchaId.value; // 提交时带上
}

// 页面加载时获取一次验证码
onMounted(getCaptcha);

/**
 * 登录提交
 */
async function handleLoginSubmit() {
  try {
    // 1. 表单验证
    const valid = await loginFormRef.value?.validate();
    if (!valid) return;

    loading.value = true;

    // 2. 执行登录
    await userStore.login(loginFormData.value);

    // 3. 获取用户信息（包含用户角色，用于路由生成）
    await userStore.getUserInfo();

    // 4. 登录成功，让路由守卫处理跳转逻辑
    // 解析目标地址，但不直接跳转
    const redirect = resolveRedirectTarget(route.query);
    console.log("🎉 Login successful, target redirect:", redirect);

    // 通过替换当前路由触发路由守卫，让守卫处理后续的路由生成和跳转
    await router.replace(redirect);

    // 5. 记住我功能已实现，根据用户选择决定token的存储方式:
    // - 选中"记住我": token存储在localStorage中，浏览器关闭后仍然有效
    // - 未选中"记住我": token存储在sessionStorage中，浏览器关闭后失效
  } catch (error) {
    // 6. 统一错误处理
    getCaptcha(); // 刷新验证码
    console.error("登录失败:", error);
  } finally {
    loading.value = false;
  }
}

/**
 * 解析重定向目标
 *
 * @param query 路由查询参数
 * @returns 标准化后的路由地址
 */
function resolveRedirectTarget(query: LocationQuery): RouteLocationRaw {
  // 默认跳转路径
  const defaultPath = "/";

  // 获取原始重定向路径
  const rawRedirect = (query.redirect as string) || defaultPath;

  try {
    // 6. 使用Vue Router解析路径
    const resolved = router.resolve(rawRedirect);
    return {
      path: resolved.path,
      query: resolved.query,
    };
  } catch {
    // 7. 异常处理：返回安全路径
    return { path: defaultPath };
  }
}

// 检查输入大小写
function checkCapsLock(event: KeyboardEvent) {
  // 防止浏览器密码自动填充时报错
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
  }
}

const emit = defineEmits(["update:modelValue"]);
function toOtherForm(type: "register" | "resetPwd") {
  emit("update:modelValue", type);
}
</script>

<style lang="scss" scoped>
.third-party-login {
  .divider-container {
    display: flex;
    align-items: center;
    margin: 20px 0;

    .divider-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--el-border-color-light), transparent);
    }

    .divider-text {
      padding: 0 16px;
      font-size: 12px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
    }
  }
}
</style>
