<template>
  <CommonLayout headerType="standard" title="账号安全" showBack>
    <ClientOnly>
      <template #default>
        <view class="page-padding">
          <view class="menu-group">
            <view class="menu-item border-b" @click="handleEmailDisabled">
              <text class="label">QQ邮箱</text>
              <view class="right-val">
                <text class="val">{{ userInfo.qqEmail || "未绑定" }}</text>
                <!-- 预留修改邮箱功能 -->
                <!-- <wd-icon
                  name="arrow-right"
                  size="14px"
                  color="#cbd5e1"
                ></wd-icon> -->
              </view>
            </view>
            <view class="menu-item" @click="toPassword">
              <text class="label">修改密码</text>
              <wd-icon name="arrow-right" size="14px" color="#cbd5e1"></wd-icon>
            </view>
          </view>

          <view class="menu-group danger-zone">
            <view class="menu-item center" @click="openLogoffFlow">
              <text class="label danger-text">注销账号</text>
            </view>
          </view>
        </view>

        <!-- 注销验证码弹窗 -->
        <view
          v-if="showLogoffDialog"
          class="modal-overlay"
          @click="cancelLogoff"
        >
          <view class="modal-container" @click.stop>
            <view class="modal-header">
              <text class="modal-title">注销账号</text>
              <view class="modal-close" @click="cancelLogoff">
                <wd-icon name="close" size="20px" color="#999"></wd-icon>
              </view>
            </view>

            <view class="modal-body">
              <view class="warning-box">
                <wd-icon
                  name="error-warning"
                  size="18px"
                  color="#f97316"
                ></wd-icon>
                <text class="warning-text"
                  >注销后账号数据将永久删除，无法恢复</text
                >
              </view>

              <view class="email-info">
                <text class="email-label">验证码已发送至</text>
                <text class="email-value">{{ maskedEmail }}</text>
              </view>

              <button
                class="resend-btn"
                @click="sendDeleteQQCode"
                :disabled="sending"
                hover-class="btn-hover"
              >
                <wd-icon
                  name="refresh"
                  size="14px"
                  :color="sending ? '#ccc' : '#f97316'"
                ></wd-icon>
                <text>{{
                  sending ? "发送中..." : codeSent ? "重新发送" : "发送验证码"
                }}</text>
              </button>

              <view class="code-input-wrapper">
                <input
                  class="code-input"
                  placeholder="请输入6位验证码"
                  placeholder-class="placeholder"
                  v-model="codeInput"
                  type="number"
                  maxlength="6"
                  @input="onCodeInput"
                />
              </view>

              <view class="error-message" v-if="codeError">
                <wd-icon
                  name="error-fill"
                  size="14px"
                  color="#e74c3c"
                ></wd-icon>
                <text>{{ codeError }}</text>
              </view>
            </view>

            <view class="modal-footer">
              <button
                class="cancel-btn"
                hover-class="btn-hover"
                @click="cancelLogoff"
              >
                取消
              </button>
              <button
                class="confirm-btn danger"
                hover-class="btn-hover"
                @click="confirmLogoff"
                :disabled="submitting"
              >
                {{ submitting ? "提交中..." : "确认注销" }}
              </button>
            </view>
          </view>
        </view>
      </template>
      <template #placeholder>
        <view class="page-padding">
          <view class="menu-group">
            <view class="menu-item border-b">
              <text class="label">QQ邮箱</text>
              <view class="right-val">
                <text class="val">加载中...</text>
              </view>
            </view>
            <view class="menu-item">
              <text class="label">修改密码</text>
              <wd-icon name="arrow-right" size="14px" color="#cbd5e1"></wd-icon>
            </view>
          </view>

          <view class="menu-group danger-zone">
            <view class="menu-item center">
              <text class="label danger-text">注销账号</text>
            </view>
          </view>
        </view>
      </template>
    </ClientOnly>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useUserStore } from "@/store/user";
import { authApi } from "@/api/register/router";

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);
const maskedEmail = computed(() => {
  const email = userInfo.value.qqEmail || "";
  if (!email) return "未绑定QQ邮箱";
  const parts = email.split("@");
  if (parts.length < 2) return email;
  const local = parts[0];
  const domain = parts[1];
  const shown = local.slice(0, 2);
  const maskLen = Math.max(local.length - 2, 3);
  return `${shown}${"*".repeat(maskLen)}@${domain}`;
});

const toPassword = () =>
  uni.navigateTo({ url: "/pages/settings/change-password" });

const handleEmailDisabled = () => {
  return;
  // uni.showToast({
  //   title: "修改邮箱功能开发中",
  //   icon: "none",
  //   duration: 2000,
  // });
};

// 注销流程
const showLogoffDialog = ref(false);
const sending = ref(false);
const submitting = ref(false);
const codeSent = ref(false);
const codeInput = ref("");
const codeError = ref("");

const openLogoffFlow = () => {
  showLogoffDialog.value = true;
  if (!codeSent.value) {
    sendDeleteQQCode();
  }
};

const cancelLogoff = () => {
  showLogoffDialog.value = false;
  sending.value = false;
  submitting.value = false;
  codeSent.value = false;
  codeInput.value = "";
  codeError.value = "";
};

const sendDeleteQQCode = async () => {
  if (sending.value) return;
  const email = userInfo.value.qqEmail || "";
  if (!email) {
    uni.showToast({ title: "未绑定QQ邮箱", icon: "none" });
    return;
  }
  try {
    sending.value = true;
    await authApi.getQQCodeDeleteUser({ qq_email: email });
    codeSent.value = true;
    uni.showToast({ title: "验证码已发送", icon: "success" });
  } catch (e) {
    uni.showToast({ title: "验证码发送失败", icon: "none" });
  } finally {
    sending.value = false;
  }
};

const onCodeInput = (e: any) => {
  const val = String(e.detail?.value ?? codeInput.value ?? "")
    .replace(/\D/g, "")
    .slice(0, 6);
  codeInput.value = val;
  if (val.length === 6) {
    codeError.value = "";
  }
};

const confirmLogoff = async () => {
  if (!/^\d{6}$/.test(codeInput.value)) {
    codeError.value = "请输入6位数字验证码";
    return;
  }
  try {
    submitting.value = true;
    await authApi.logoff({ qq_code: codeInput.value } as any);
    uni.showToast({
      title: "注销成功",
      icon: "success",
    });
    // 清除用户状态（包括 store 和本地存储）
    userStore.logout();
    setTimeout(() => {
      uni.navigateTo({
        url: "/pages/login/index",
      });
    }, 1000);
  } catch (error: any) {
    console.log("error::", error.message);
    // 提取错误消息：支持 "业务错误(1003): xxx" 和 "错误：xxx" 两种格式
    const match = error.message.match(/\)\s*:\s*(.+)$/);
    if (match) {
      codeError.value = match[1];
    } else {
      // 尝试按中文冒号分割
      const parts = error.message.split("：");
      codeError.value = parts[1] || error.message.split(":")[1] || "注销失败，请重试";
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.page-padding {
  padding: $spacing-md;
  flex: 1;
  width: 100%;
  @include flex(column, flex-start, center);
}

.menu-group {
  width: 100%;
  background: $surface-color;
  border-radius: $border-radius-lg;
  border: 1rpx solid $border-light;
  overflow: hidden;
  margin-bottom: 40rpx;

  &.danger-zone {
    border-color: #fee2e2;
    background: linear-gradient(180deg, #fff5f5 0%, #ffffff 100%);
  }

  .menu-item {
    padding: 32rpx;
    background: #fff;
    @include flex(row, space-between, center);

    &.border-b {
      border-bottom: 1rpx solid $border-light;
    }

    &.center {
      justify-content: center;
    }

    .label {
      font-size: $font-size-sm;
      font-weight: bold;
      color: $text-primary;
    }

    .danger-text {
      color: $accent-color;
    }

    .right-val {
      @include flex(row, flex-end, center);
      gap: 10rpx;

      .val {
        font-size: $font-size-sm;
        color: $text-tertiary;
      }

      .disabled-badge {
        font-size: 20rpx;
        color: #fff;
        background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
        font-weight: 600;
        margin-right: 4rpx;
      }
    }
  }
}

// 弹窗遮罩
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  @include flex(column, center, center);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// 弹窗容器
.modal-container {
  width: 640rpx;
  background: #fff;
  border-radius: $border-radius-xl;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(40rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// 弹窗头部
.modal-header {
  padding: 32rpx;
  border-bottom: 1rpx solid $border-light;
  @include flex(row, center, center);
  position: relative;

  .modal-title {
    font-size: $font-size-lg;
    font-weight: 700;
    color: $accent-color;
  }

  .modal-close {
    position: absolute;
    right: 32rpx;
    padding: 8rpx;
  }
}

// 弹窗内容
.modal-body {
  padding: 32rpx;
}

.warning-box {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border: 1rpx solid #fed7aa;
  border-radius: $border-radius-md;
  padding: 20rpx 24rpx;
  @include flex(row, flex-start, center);
  gap: 12rpx;
  margin-bottom: 32rpx;

  .warning-text {
    font-size: $font-size-xs;
    color: #c2410c;
    line-height: 1.6;
    flex: 1;
  }
}

.email-info {
  @include flex(column, center, center);
  margin-bottom: 24rpx;

  .email-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-bottom: 8rpx;
  }

  .email-value {
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-primary;
  }
}

.resend-btn {
  background: rgba(249, 115, 22, 0.08);
  border: none;
  border-radius: $border-radius-md;
  padding: 16rpx 24rpx;
  @include flex(row, center, center);
  gap: 8rpx;
  margin: 0 auto 32rpx;
  min-width: 200rpx;

  text {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $primary-color;
  }

  &[disabled] {
    opacity: 0.5;
  }
}

.code-input-wrapper {
  margin-bottom: 16rpx;
}

.code-input {
  width: 100%;
  height: 96rpx;
  text-align: center;
  letter-spacing: 16rpx;
  background: #f9fafb;
  border: 2rpx solid $border-light;
  border-radius: $border-radius-lg;
  font-size: 44rpx;
  font-weight: 700;
  color: $text-primary;
  transition: all 0.2s;

  &:focus {
    border-color: $primary-color;
    background: #fff;
    box-shadow: 0 0 0 4rpx rgba(249, 115, 22, 0.1);
  }
}

.placeholder {
  color: $text-tertiary;
  font-weight: 400;
  letter-spacing: 0;
}

.error-message {
  @include flex(row, flex-start, center);
  gap: 8rpx;
  padding: 16rpx 20rpx;
  background: #fee2e2;
  border-radius: $border-radius-md;

  text {
    font-size: $font-size-xs;
    color: $accent-color;
  }
}

// 弹窗底部
.modal-footer {
  padding: 24rpx 32rpx 32rpx;
  @include flex(row, space-between, center);
  gap: 20rpx;
}

.cancel-btn {
  flex: 1;
  height: 88rpx;
  background: #f1f5f9;
  border: none;
  border-radius: $border-radius-lg;
  font-size: $font-size-base;
  font-weight: 600;
  color: $text-primary;
}

.confirm-btn {
  flex: 1;
  height: 88rpx;
  background: $text-primary;
  border: none;
  border-radius: $border-radius-lg;
  font-size: $font-size-base;
  font-weight: 600;
  color: #fff;

  &.danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    box-shadow: 0 8rpx 16rpx rgba(220, 38, 38, 0.2);
  }

  &[disabled] {
    opacity: 0.6;
  }
}

.btn-hover {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>
