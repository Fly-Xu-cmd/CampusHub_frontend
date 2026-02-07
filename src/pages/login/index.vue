<template>
  <CommonLayout headerType="transparent" contentBg="#fff">
    <view
      class="login-container"
      :style="{ paddingTop: `${2 * (systemStore.statusBarHeight + 30)}rpx` }"
    >
      <view class="header-section">
        <view class="logo-box">
          <wd-icon
            class-prefix="iconfont"
            name="a-shapequickpressedtrue"
            size="64rpx"
            color="#ffffff"
          ></wd-icon>
        </view>
        <view class="title">欢迎回来</view>
        <view class="subtitle">登录 Activity Pro，发现精彩校园生活</view>
      </view>

      <view class="form-section">
        <view class="input-wrapper">
          <view class="input-icon">
            <wd-icon
              name="mail"
              size="40rpx"
              color="#94a3b8"
              custom-class="input-icon"
            ></wd-icon>
          </view>
          <input
            class="custom-input"
            placeholder="QQ邮箱"
            placeholder-class="placeholder-style"
            v-model="formData.qqEmail"
            type="text"
            required
          />
        </view>

        <view class="input-wrapper">
          <view class="input-icon">
            <wd-icon
              name="lock-on"
              size="40rpx"
              color="#94a3b8"
              custom-class="input-icon"
            ></wd-icon>
          </view>
          <input
            class="custom-input"
            :placeholder="passwordPlaceholder"
            placeholder-class="placeholder-style"
            v-model="formData.password"
            :password="!showPassword"
          />
          <view class="input-icon" @click="toggleShowPassword">
            <wd-icon
              :name="showPassword ? 'browse' : 'browse-off'"
              size="40rpx"
              color="#94a3b8"
              custom-class="input-icon"
            ></wd-icon>
          </view>
        </view>

        <!-- 极验验证码容器 -->
        <!-- #ifdef H5 -->
        <view
          id="captchaBox"
          ref="captchaBox"
          class="captcha-box"
          v-show="!captchaError"
        ></view>
        <view v-if="captchaError" class="captcha-error" @click="retryCaptcha">
          <text>人机验证初始化失败，点击重试</text>
        </view>
        <!-- #endif -->

        <view class="action-row">
          <text class="text-gray" @click="handleForgot">忘记密码?</text>
        </view>
      </view>

      <view class="footer-section">
        <button class="login-btn" hover-class="btn-hover" @click="handleLogin">
          立即登录
        </button>

        <view class="register-tip">
          <text class="text-gray">还没有账号? </text>
          <text class="text-orange font-bold" @click="goToRegister"
            >立即注册</text
          >
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useSystemStore } from "@/store/system";
import { useUserStore } from "@/store/user";
import { authApi } from "@/api/register/router";
import { loadGeetestScript } from "@/utils/geetest";

const userStore = useUserStore();
const passwordPlaceholder = ref("密码");
const showPassword = ref(false); // 是否显示密码
const redirectUrl = ref(""); // 用来存“原本想去哪”
const captchaObj = ref<any>(null); // 极验验证实例
const captchaBox = ref<any>(null); // 极验验证码容器
const captchaError = ref(false); // 验证码初始化失败状态

const systemStore = useSystemStore();

const formData = reactive({
  qqEmail: "",
  password: "",
  captchaOutput: "",
  genTime: "",
  lotNumber: "",
  passToken: "",
});

// 登录成功后，判断是否有 redirect 参数
onLoad((options) => {
  if (options && options.redirect) {
    // 解码 URL
    redirectUrl.value = decodeURIComponent(options.redirect);
    console.log("登录成功后将跳转至:", redirectUrl.value);
  }
});

// 初始化极验
const initCaptcha = async () => {
  try {
    await loadGeetestScript();
    const config = await authApi.getCaptchaConfig();
    if (window.initGeetest4) {
      window.initGeetest4(
        {
          captchaId: config.data.captchaId,
          product: "float",
          nativeButton: {
            width: "100%",
            height: "42px",
          },
        },
        (captcha) => {
          captchaObj.value = captcha;
          captcha.appendTo("#captchaBox");

          captcha.onSuccess(() => {
            const result = captcha.getValidate();
            if (result) {
              formData.captchaOutput = result.captcha_output;
              formData.genTime = result.gen_time;
              formData.lotNumber = result.lot_number;
              formData.passToken = result.pass_token;
              console.log("验证成功:", result);
            }
          });

          captcha.onError((err) => {
            console.error("验证码错误:", err);
          });
        }
      );
    }
  } catch (error) {
    console.error("初始化验证码失败:", error);
    captchaError.value = true;
  }
};

const retryCaptcha = () => {
  captchaError.value = false;
  // 清空容器内容（如果之前有残留）
  if (captchaBox.value) {
    // #ifdef H5
    // 尝试清空 DOM 内容，虽然 v-show 隐藏了，但重置时最好清理
    const el = document.getElementById("captchaBox");
    if (el) el.innerHTML = "";
    // #endif
  }
  initCaptcha();
};

onMounted(() => {
  // 仅在 H5 环境下初始化极验，其他环境需适配
  // #ifdef H5
  initCaptcha();
  // #endif
});

const handleLogin = async () => {
  if (!formData.qqEmail) {
    uni.showToast({ title: "请输入QQ邮箱", icon: "none" });
    return;
  }
  // 密码登录逻辑
  if (!formData.password) {
    uni.showToast({ title: "请输入密码", icon: "none" });
    return;
  }

  // 检查验证码是否通过
  // #ifdef H5
  if (!formData.passToken) {
    uni.showToast({ title: "请先完成人机验证", icon: "none" });
    return;
  }
  // #endif

  uni.showLoading({ title: "登录中..." });
  try {
    // 3. 发起登录请求
    const response = await authApi.login({
      qqEmail: formData.qqEmail,
      password: formData.password,
      captchaOutput: formData.captchaOutput,
      genTime: formData.genTime,
      lotNumber: formData.lotNumber,
      passToken: formData.passToken,
    });

    uni.hideLoading();
    uni.showToast({ title: "登录成功", icon: "success" });

    // 登录成功，存储用户信息
    userStore.login(
      response.data.userInfo,
      response.data.accessToken,
      response.data.refreshToken
    );

    // 跳转页面
    const targetUrl = redirectUrl.value || "/pages/index/index";
    setTimeout(() => {
      // 使用 reLaunch 确保清空页面栈，避免返回到登录页
      uni.reLaunch({ url: targetUrl });
    }, 1000);
  } catch (error: any) {
    uni.hideLoading();
    console.error("登录失败:", error);
    // 重置验证码
    if (captchaObj.value) {
      captchaObj.value.reset();
    }
    formData.captchaOutput = "";
    formData.genTime = "";
    formData.lotNumber = "";
    formData.passToken = "";

    // 错误提示已在 http 拦截器中处理，但针对特定业务逻辑可补充
    if (error.code === 401 || error.statusCode === 401) {
      uni.showToast({ title: "账号或密码错误", icon: "none" });
    }
  }
};

const goToRegister = () => {
  uni.navigateTo({ url: "/pages/register/index" });
};

const handleForgot = () => {
  uni.showToast({ title: "功能开发中", icon: "none" });
};

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.login-container {
  padding: 0 60rpx;
  display: flex;
  flex-direction: column;
}

.header-section {
  margin-bottom: 80rpx;

  .logo-box {
    width: 120rpx;
    height: 120rpx;
    // 品牌渐变色
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40rpx;
    box-shadow: 0 10px 20px rgba(249, 115, 22, 0.3);
  }

  .title {
    font-size: 56rpx;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 16rpx;
  }

  .subtitle {
    font-size: 28rpx;
    color: $text-tertiary;
  }
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  margin-bottom: 60rpx;

  // 自定义输入框样式 wrapper
  .input-wrapper {
    background-color: #f9fafb; // UI 中的 gray-50
    border-radius: 32rpx;
    padding: 30rpx 32rpx;
    display: flex;
    align-items: center;
    transition: all 0.3s;
    border: 1px solid transparent;

    &:focus-within {
      background-color: #fff;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
    }

    .input-icon {
      margin-right: 24rpx;
    }

    .send-code-btn {
      font-size: 24rpx;
      color: $primary-color;
      font-weight: 600;
      height: 40rpx;
      line-height: 40rpx;
    }

    .custom-input {
      flex: 1;
      font-size: 30rpx;
      color: $text-primary;
      font-weight: 600;
      height: 40rpx;
      line-height: 40rpx;
    }

    :deep(.placeholder-style) {
      color: $text-tertiary; // 浅灰色占位符
      font-weight: normal;
    }
  }

  .action-row {
    display: flex;
    justify-content: space-between;
    font-size: 24rpx;
    font-weight: 600;
    padding: 0 10rpx;

    .text-gray {
      color: $text-tertiary;
    }
    .text-orange {
      color: $primary-color;
    }
  }

  .captcha-box {
    width: 100%;
    min-height: 42px;
  }

  .captcha-error {
    width: 100%;
    padding: 20rpx;
    background-color: #fef2f2;
    border-radius: 16rpx;
    text-align: center;
    color: #ef4444;
    font-size: 28rpx;
    cursor: pointer;
    box-sizing: border-box;

    &:active {
      opacity: 0.8;
    }
  }
}

.footer-section {
  .login-btn {
    background-color: $text-primary; // 黑色背景
    color: #fff;
    font-size: 32rpx;
    font-weight: 700;
    border-radius: 32rpx;
    padding: 10rpx 0;
    line-height: 88rpx;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
    margin-bottom: 40rpx;

    &::after {
      border: none;
    }
    &.btn-hover {
      opacity: 0.9;
      transform: scale(0.99);
    }
  }

  .register-tip {
    text-align: center;
    font-size: 24rpx;

    .text-gray {
      color: $text-tertiary;
    }
    .text-orange {
      color: $primary-color;
      margin-left: 10rpx;
      padding: 10rpx; // 增加点击热区
    }
    .font-bold {
      font-weight: 700;
    }
  }
}
</style>
