import request from "@/utils/request";

const AUTH_BASE_URL = "/api/app";

const AuthAPI = {
  /** 登录接口*/
  login(data: LoginFormData) {
    /*  const formData = new FormData();
    formData.append("UserName", data.UserName);
    formData.append("Password", data.Password);
    formData.append("captchaKey", data.captchaKey);
    formData.append("captchaCode", data.captchaCode); */
    return request<any, LoginResult>({
      url: `${AUTH_BASE_URL}/login-services/login`,
      method: "post",
      data: {
        userName: data.UserName, // 注意大小写要和后端DTO字段对应
        password: data.Password,
        captchaKey: data.captchaKey,
        captchaCode: data.captchaCode,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  /** 刷新 token 接口*/
  refreshToken(refreshToken: string) {
    return request<any, LoginResult>({
      url: `${AUTH_BASE_URL}/refresh-token`,
      method: "post",
      params: { refreshToken },
      headers: {
        Authorization: "no-auth",
      },
    });
  },

  /** 退出登录接口 */
  logout() {
    return request({
      url: `${AUTH_BASE_URL}/logout`,
      method: "delete",
    });
  },

  /** 获取验证码接口*/
  getCaptcha() {
    return request<any, CaptchaInfo>({
      url: `${AUTH_BASE_URL}/captcha`,
      method: "get",
    });
  },
};

export default AuthAPI;

/** 登录表单数据 */
export interface LoginFormData {
  /** 用户名 */
  UserName: string;
  /** 密码 */
  Password: string;
  /** 验证码缓存key */
  captchaKey: string;
  /** 验证码 */
  captchaCode: string;
  /** 记住我 */
  rememberMe: boolean;
}

/** 登录响应 */
export interface LoginResult {
  /** 访问令牌 */
  accessToken: string;
  /** 刷新令牌 */
  refreshToken: string;
  /** 令牌类型 */
  tokenType: string;
  /** 过期时间(秒) */
  expiresIn: number;
}

/** 验证码信息 */
export interface CaptchaInfo {
  /** 验证码缓存key */
  captchaKey: string;
  /** 验证码图片Base64字符串 */
  captchaBase64: string;
}
