<template>
  <CommonLayout headerType="transparent" contentBg="#fff">
    <view
      class="register-container"
      :style="{ paddingTop: `${2 * (systemStore.statusBarHeight + 30)}rpx` }"
    >
      <view class="content-body">
        <view class="header-text">
          <view class="title">注册账号</view>
          <view class="subtitle">填写信息，开启你的旅程</view>
        </view>

        <view class="form-section">
          <view class="input-wrapper">
            <view class="icon-wrapper">
              <wd-icon name="user" class="icon" size="44rpx" />
            </view>
            <input
              class="custom-input"
              placeholder="昵称"
              placeholder-class="placeholder-style"
              v-model="formData.nickname"
            />
          </view>

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
              placeholder="设置密码"
              placeholder-class="placeholder-style"
              v-model="formData.password"
              password
            />
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
            class="register-btn"
            hover-class="btn-hover"
            @click="handleRegister"
          >
            完成注册
          </button>
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useSystemStore } from "@/store/system";
import { authApi } from "@/api/register/router";
import { useUserStore } from "@/store/user";
import { loadGeetestScript } from "@/utils/geetest";

const userStore = useUserStore();

const systemStore = useSystemStore();

const formData = reactive({
  nickname: "",
  qqEmail: "",
  qqCode: "",
  password: "",
  captchaOutput: "",
  genTime: "",
  lotNumber: "",
  passToken: "",
});

const timer = ref(0);
const captchaObj = ref<any>(null);
const captchaBox = ref<any>(null); // 极验验证码容器
const captchaError = ref(false); // 验证码初始化失败状态

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
  // #ifdef H5
  initCaptcha();
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

  // #ifdef H5
  if (!formData.passToken) {
    uni.showToast({ title: "请先完成人机验证", icon: "none" });
    return;
  }
  // #endif

  uni.showLoading({ title: "发送中..." });
  try {
    await authApi.getQQCodeRegister({
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
    // 错误处理已在拦截器中统一处理，此处仅需重置状态
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

const handleRegister = async () => {
  if (
    !formData.qqEmail ||
    !formData.password ||
    !formData.nickname ||
    !formData.qqCode
  ) {
    uni.showToast({ title: "请填写完整信息", icon: "none" });
    return;
  }

  uni.showLoading({ title: "注册中..." });
  try {
    const response = await authApi.register({
      nickname: formData.nickname,
      qqEmail: formData.qqEmail,
      password: formData.password,
      qqCode: formData.qqCode,
    });
    uni.hideLoading();
    uni.showToast({ title: "注册成功", icon: "success" });
    userStore.login(
      response.data.userInfo,
      response.data.accessToken,
      response.data.refreshToken
    );
    // 注册成功，跳转到选择标签页
    setTimeout(() => {
      uni.navigateTo({ url: "/pages/selectTags/index" });
    }, 1000);
  } catch (error) {
    uni.hideLoading();
    uni.showToast({ title: "注册失败，请重试", icon: "none" });
    console.error("注册失败:", error);
  }
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.register-container {
  display: flex;
  flex-direction: column;
}

.nav-header {
  padding: 20rpx 40rpx;
  .back-btn {
    width: 80rpx;
    height: 80rpx;
    background-color: #f9fafb; // 浅灰背景
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
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
  margin-bottom: 80rpx;

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

  // 验证码行的特殊样式
  .verify-wrapper {
    padding-right: 10rpx; // 右边距减小，给按钮腾位置

    .verify-btn {
      background-color: $text-primary; // 黑色按钮
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
  .register-btn {
    padding: $spacing-sm;
    background-color: $primary-color; // 橙色
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
</style>
