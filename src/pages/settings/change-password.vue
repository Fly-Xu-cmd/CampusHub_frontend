<template>
  <CommonLayout headerType="none" padding="0 0">
    <view class="header">
      <wd-icon
        name="arrow-left"
        size="48rpx"
        color="#000"
        @click="toBack"
      ></wd-icon>
      <view class="title">修改密码</view>
      <view class="right-text" @click="handleSave">完成</view>
    </view>
    <view class="page-padding">
      <view class="notice-bar">
        <wd-icon
          class-prefix="iconfont"
          name="shield-alt"
          size="32rpx"
          color="#f97316"
        ></wd-icon>
        <text class="text"
          >为保障账号安全，请设置包含字母和数字的8位以上密码。</text
        >
      </view>

      <view class="form-section">
        <view class="input-wrap">
          <text class="label">旧密码</text>
          <view class="input-inner">
            <input
              class="real-input"
              placeholder="请输入旧密码"
              :password="!showCurrentPassword"
              v-model="formData.oldPassword"
            />
            <wd-icon
              :name="showNewPassword ? 'browse-off' : 'browse'"
              size="36rpx"
              color="#94a3b8"
              @click="toggleCurrentPassword"
            ></wd-icon>
          </view>
        </view>
        <view class="input-wrap">
          <text class="label">新密码</text>
          <view class="input-inner">
            <input
              class="real-input"
              placeholder="请输入新密码（至少8位）"
              :password="!showNewPassword"
              v-model="formData.newPassword"
            />
            <wd-icon
              :name="showNewPassword ? 'browse-off' : 'browse'"
              size="36rpx"
              color="#94a3b8"
              @click="toggleNewPassword"
            ></wd-icon>
          </view>
        </view>
        <view class="input-wrap">
          <text class="label">确认新密码</text>
          <view class="input-inner">
            <input
              class="real-input"
              placeholder="请再次输入新密码"
              :password="!showConfirmPassword"
              v-model="formData.confirmPassword"
            />
            <wd-icon
              :name="showConfirmPassword ? 'browse-off' : 'browse'"
              size="36rpx"
              color="#94a3b8"
              @click="toggleConfirmPassword"
            ></wd-icon>
          </view>
        </view>
      </view>

      <view class="forget-tip" @click="toForgotPassword">忘记当前密码？</view>
      <button class="submit-btn" @click="handleSave" :disabled="loading">
        {{ loading ? "提交中..." : "确认修改" }}
      </button>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { updatePassword } from "@/api/profile/router";
import { useUserStore } from "@/store/user";
import {
  getBusinessCodeMessage,
  CodePasswordIncorrect,
  CodePasswordInvalid,
  CodePasswordUpdateFailed,
} from "@/utils/businessCodes";
import type { PostUserPasswordRequest } from "@/types/modules/profile";

const userStore = useUserStore();
const loading = ref(false);
const formData = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const timer = ref(0);

// 密码可见性状态
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// 密码强度验证正则（至少8位，包含字母和数字）
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const qqEmailRegex = /^[1-9][0-9]{4,10}@qq\.com$/;

import { safeNavigateBack } from "@/utils/navigation";

const toBack = () => {
  safeNavigateBack("/pages/settings/index");
};

// 切换密码可见性
const toggleCurrentPassword = () => {
  showCurrentPassword.value = !showCurrentPassword.value;
};

const toggleNewPassword = () => {
  showNewPassword.value = !showNewPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

// 跳转到忘记密码页面
const toForgotPassword = () => {
  uni.navigateTo({ url: "/pages/forgot-password/index" });
};

const handleSave = async () => {
  // 表单验证
  if (
    !formData.value.oldPassword ||
    !formData.value.newPassword ||
    !formData.value.confirmPassword
  ) {
    uni.showToast({ title: "请填写完整信息", icon: "none" });
    return;
  }

  if (formData.value.newPassword !== formData.value.confirmPassword) {
    uni.showToast({ title: "两次输入的密码不一致", icon: "none" });
    return;
  }

  if (!passwordRegex.test(formData.value.newPassword)) {
    uni.showToast({ title: "新密码需包含字母和数字，至少8位", icon: "none" });
    return;
  }

  loading.value = true;
  try {
    const passwordData: PostUserPasswordRequest = {
      originPassword: formData.value.oldPassword,
      newPassword: formData.value.newPassword,
    };

    await updatePassword(passwordData);

    // 修改密码成功，清除登录状态
    uni.showModal({
      title: "密码修改成功",
      content: "为了您的账号安全，请重新登录",
      showCancel: false,
      success: () => {
        // 清除用户状态
        userStore.logout();
        // 跳转到登录页
        uni.reLaunch({
          url: "/pages/login/index",
        });
      },
    });
  } catch (error: any) {
    console.error("修改密码失败:", error);

    // 根据错误码显示不同的错误信息
    let errorMessage = "修改密码失败，请重试";
    let errorCode = null;

    // 尝试从错误对象中提取错误码
    if (error?.code) {
      errorCode = error.code;
    } else if (error?.message) {
      // 从错误消息中解析错误码（格式：业务错误(XXXX): 消息）
      const codeMatch = error.message.match(/业务错误\((\d+)\)/);
      if (codeMatch) {
        errorCode = parseInt(codeMatch[1]);
      }
    }

    if (errorCode !== null) {
      if (errorCode === CodePasswordIncorrect) {
        errorMessage = "当前密码错误，请重新输入";
      } else if (errorCode === CodePasswordInvalid) {
        errorMessage = "新密码格式不正确，需要包含字母和数字";
      } else if (errorCode === CodePasswordUpdateFailed) {
        errorMessage = "密码修改失败，请稍后重试";
      } else {
        // 使用业务错误码消息
        errorMessage = getBusinessCodeMessage(errorCode);
      }
    }

    uni.showToast({ title: errorMessage, icon: "none" });
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.header {
  @include flex(row, space-between, center);
  padding: $spacing-sm $spacing-md;
  background: $surface-color;
  border-bottom: 1rpx solid $border-light;
  .title {
    font-size: $font-size-base;
    font-weight: bold;
    color: $text-primary;
  }
  .right-text {
    font-size: $font-size-base;
    font-weight: bold;
    color: $primary-color;
    padding: $spacing-sm $spacing-sm;
  }
}

.page-padding {
  padding: $spacing-lg;
}

.notice-bar {
  background: #fff7ed;
  border: 1rpx solid #ffedd5;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  @include flex(row, flex-start, flex-start);
  gap: $spacing-sm;
  margin-bottom: $spacing-xl;
  .text {
    font-size: $font-size-sm;
    color: #c2410c;
    flex: 1;
  }
}

.form-section {
  margin-bottom: 40rpx;
  .input-wrap {
    margin-bottom: $spacing-md;
    .label {
      font-size: $font-size-sm;
      font-weight: bold;
      color: $text-secondary;
      margin-bottom: 10rpx;
      display: block;
      text-transform: uppercase;
    }
    .input-inner {
      background: #fff;
      border: 1rpx solid $border-color;
      border-radius: $border-radius-lg;
      padding: $spacing-md;
      @include flex(row, space-between, center);
      .real-input {
        flex: 1;
        font-size: $font-size-sm;
      }
      .custom-input {
        flex: 1;
        font-size: 30rpx;
        color: $text-primary;
        font-weight: 600;
        height: 40rpx;
      }
      .verify-btn {
        background-color: $text-primary; // 黑色按钮
        color: #fff;
        font-size: 24rpx;
        font-weight: 700;
        padding: 20rpx 30rpx;
        border-radius: 24rpx;
        transition: opacity 0.3s;
        white-space: nowrap;

        &.disabled {
          background-color: #e2e8f0;
          color: #94a3b8;
        }
      }
    }
  }
}

.forget-tip {
  text-align: right;
  font-size: $font-size-sm;
  color: $primary-color;
  font-weight: bold;
  margin-bottom: 40rpx;
}

.submit-btn {
  background: #1e293b;
  color: #fff;
  border-radius: $border-radius-full;
  font-weight: bold;
  font-size: $font-size-sm;
  padding: $spacing-sm 0;
}
</style>
