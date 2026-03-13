<template>
  <CommonLayout headerType="transparent" contentBg="#fff">
    <view
      class="forgot-container"
      :style="{ paddingTop: `${2 * (systemStore.statusBarHeight + 30)}rpx` }"
    >
      <view class="content-body">
        <view class="header-text">
          <view class="title">忘记密码</view>
          <view class="subtitle">通过QQ邮箱重置您的密码</view>
        </view>

        <view class="form-section">
          <view class="input-wrapper">
            <view class="icon-wrapper">
              <wd-icon name="mail" size="44rpx"></wd-icon>
            </view>
            <input
              class="custom-input"
              placeholder="QQ邮箱"
              placeholder-class="placeholder-style"
              v-model="formData.qqEmail"
              type="text"
            />
          </view>

          <view class="input-wrapper">
            <view class="icon-wrapper">
              <wd-icon name="lock-off" class="icon" size="44rpx" />
            </view>
            <input
              class="custom-input"
              placeholder="新密码"
              placeholder-class="placeholder-style"
              v-model="formData.newPassword"
              :password="!showPassword"
            />
            <view class="icon-wrapper" @click="toggleShowPassword">
              <wd-icon
                :name="showPassword ? 'browse-off' : 'browse'"
                size="44rpx"
              ></wd-icon>
            </view>
          </view>

          <view class="input-wrapper">
            <view class="icon-wrapper">
              <wd-icon name="lock-on" class="icon" size="44rpx" />
            </view>
            <input
              class="custom-input"
              placeholder="确认新密码"
              placeholder-class="placeholder-style"
              v-model="confirmPassword"
              :password="!showConfirmPassword"
            />
            <view class="icon-wrapper" @click="toggleShowConfirmPassword">
              <wd-icon
                :name="showConfirmPassword ? 'browse-off' : 'browse'"
                size="44rpx"
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

          <view
            v-show="formData.passToken"
            class="input-wrapper verify-wrapper"
          >
            <view class="icon-wrapper">
              <wd-icon name="cloud" size="44rpx"></wd-icon>
            </view>
            <input
              class="custom-input"
              placeholder="验证码"
              placeholder-class="placeholder-style"
              v-model="formData.qqCode"
              type="number"
              maxlength="6"
            />
            <view
              class="verify-btn"
              :class="{ disabled: timer > 0 }"
              @click="getVerifyCode"
            >
              {{ timer > 0 ? `${timer}s后重试` : "获取验证码" }}
            </view>
          </view>
        </view>

        <view class="footer-btn">
          <button
            class="reset-btn"
            hover-class="btn-hover"
            @click="handleResetPassword"
          >
            重置密码
          </button>
        </view>

        <view class="back-login" @click="goToLogin">
          <text class="text-gray">返回</text>
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from "vue";
import { useSystemStore } from "@/store/system";
import { authApi } from "@/api/register/router";
import { loadGeetestScript } from "@/utils/geetest";

const systemStore = useSystemStore();

const formData = reactive({
  qqEmail: "",
  qqCode: "",
  newPassword: "",
  captchaOutput: "",
  genTime: "",
  lotNumber: "",
  passToken: "",
});

const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const timer = ref(0);
const captchaObj = ref<any>(null);
const captchaBox = ref<any>(null);
const captchaError = ref(false);

// 初始化极验
const initCaptcha = async () => {
  try {
    await loadGeetestScript();
    const config = await authApi.getCaptchaConfig();
    if (window.initGeetest4) {
      window.initGeetest4(
        {
          captchaId: config.data.captchaId || import.meta.env.VITE_GEETEST_ID,
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
            }
          });

          captcha.onError((err) => {
            console.error("验证码错误:", err);
          });
        },
      );
    }
  } catch (error) {
    console.error("初始化验证码失败:", error);
    captchaError.value = true;
  }
};

const retryCaptcha = () => {
  captchaError.value = false;
  if (captchaBox.value) {
    // #ifdef H5
    const el = document.getElementById("captchaBox");
    if (el) el.innerHTML = "";
    // #endif
  }
  initCaptcha();
};

onMounted(() => {
  // #ifdef H5
  initCaptcha();
  // #endif
});

// 页面卸载时销毁极验实例
onUnmounted(() => {
  // #ifdef H5
  if (captchaObj.value) {
    captchaObj.value.destroy();
    captchaObj.value = null;
  }
  // 清空容器
  const el = document.getElementById("captchaBox");
  if (el) el.innerHTML = "";
  // #endif
});

const getVerifyCode = async () => {
  if (!formData.passToken) {
    uni.showToast({ title: "请先完成人机验证", icon: "none" });
    return;
  }
  if (timer.value > 0) return;
  if (
    !formData.qqEmail ||
    !/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(formData.qqEmail)
  ) {
    uni.showToast({ title: "请输入正确的QQ邮箱", icon: "none" });
    return;
  }

  uni.showLoading({ title: "发送中..." });
  try {
    await authApi.getQQCodeForgotPassword({
      qq_email: formData.qqEmail,
      captchaOutput: formData.captchaOutput,
      genTime: formData.genTime,
      lotNumber: formData.lotNumber,
      passToken: formData.passToken,
    });
    uni.hideLoading();
    uni.showToast({ title: "验证码已发送", icon: "success" });

    timer.value = 60;
    const interval = setInterval(() => {
      timer.value--;
      if (timer.value <= 0) clearInterval(interval);
    }, 1000);
  } catch (error) {
    uni.hideLoading();
    console.error("获取验证码失败:", error);
    // 重置验证码
    if (captchaObj.value) {
      captchaObj.value.reset();
    }
    formData.captchaOutput = "";
    formData.genTime = "";
    formData.lotNumber = "";
    formData.passToken = "";
  }
};

const handleResetPassword = async () => {
  if (!formData.qqEmail) {
    uni.showToast({ title: "请输入QQ邮箱", icon: "none" });
    return;
  }

  if (
    !formData.qqEmail ||
    !/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(formData.qqEmail)
  ) {
    uni.showToast({ title: "请输入正确的QQ邮箱", icon: "none" });
    return;
  }

  if (!formData.qqCode) {
    uni.showToast({ title: "请输入验证码", icon: "none" });
    return;
  }

  if (!formData.newPassword) {
    uni.showToast({ title: "请输入新密码", icon: "none" });
    return;
  }

  if (formData.newPassword.length < 6) {
    uni.showToast({ title: "密码长度不能少于6位", icon: "none" });
    return;
  }

  if (formData.newPassword !== confirmPassword.value) {
    uni.showToast({ title: "两次输入的密码不一致", icon: "none" });
    return;
  }

  uni.showLoading({ title: "重置中..." });
  try {
    await authApi.forgotPassword({
      qq_email: formData.qqEmail,
      qq_code: formData.qqCode,
      new_password: formData.newPassword,
    });
    uni.hideLoading();
    uni.showToast({ title: "密码重置成功", icon: "success" });

    // 延迟跳转到登录页
    setTimeout(() => {
      uni.navigateTo({ url: "/pages/login/index" });
    }, 1500);
  } catch (error) {
    uni.hideLoading();
    console.error("重置密码失败:", error);
  }
};

import { safeNavigateBack } from "@/utils/navigation";

const goToLogin = () => {
  safeNavigateBack("/pages/login/index");
};

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleShowConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.forgot-container {
  display: flex;
  flex-direction: column;
}

.content-body {
  flex: 1;
  padding: 40rpx 60rpx;
  display: flex;
  flex-direction: column;
}

.header-text {
  margin-bottom: 80rpx;
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

  .input-wrapper {
    background-color: #f9fafb;
    border-radius: 32rpx;
    padding: 30rpx 32rpx;
    display: flex;
    align-items: center;

    .icon-wrapper {
      color: $text-tertiary;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
    }

    .custom-input {
      flex: 1;
      font-size: 30rpx;
      color: $text-primary;
      font-weight: 600;
      height: 40rpx;
    }

    :deep(.placeholder-style) {
      color: $text-tertiary;
      font-weight: 700;
    }
  }

  .verify-wrapper {
    padding-right: 10rpx;

    .verify-btn {
      background-color: $text-primary;
      color: #fff;
      font-size: 24rpx;
      font-weight: 700;
      padding: 20rpx 30rpx;
      border-radius: 24rpx;
      transition: opacity 0.3s;

      &.disabled {
        background-color: #e2e8f0;
        color: #94a3b8;
      }
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

.footer-btn {
  .reset-btn {
    padding: $spacing-sm;
    background-color: $primary-color;
    color: #fff;
    font-size: 32rpx;
    font-weight: 700;
    border-radius: 32rpx;
    line-height: 88rpx;
    box-shadow: 0 10px 20px rgba(249, 115, 22, 0.25);

    &::after {
      border: none;
    }
    &.btn-hover {
      opacity: 0.9;
    }
  }
}

.back-login {
  margin-top: 40rpx;
  text-align: center;
  font-size: 28rpx;

  .text-gray {
    color: $text-tertiary;
  }
}
</style>
