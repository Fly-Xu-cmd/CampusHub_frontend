<template>
  <CommonLayout
    headerType="none"
    contentBg="#f6faff"
    padding="0 0"
    :showTabBar="true"
  >
    <view class="profile-container">
      <!-- 未登录状态占位符 -->
      <view v-if="!isAuthenticated" class="guest-placeholder">
        <view class="guest-content">
          <!-- Logo图标 -->
          <view class="guest-logo">
            <wd-icon
              class-prefix="iconfont"
              name="a-shapequickpressedtrue"
              size="120rpx"
              color="#ffffff"
            ></wd-icon>
          </view>

          <!-- 欢迎文字 -->
          <view class="guest-title">欢迎来到 CampusHub</view>
          <view class="guest-subtitle">登录即可发现精彩校园活动</view>

          <!-- 登录按钮 -->
          <button
            class="guest-login-btn"
            hover-class="btn-hover"
            @click="handleToLogin"
          >
            立即登录
          </button>

          <!-- 注册提示 -->
          <view class="guest-register-tip">
            <text class="text-gray">还没有账号？</text>
            <text class="text-primary font-bold" @click="handleToRegister"
              >立即注册</text
            >
          </view>
        </view>
      </view>
      <!-- 已登录状态 -->
      <template v-else>
        <view class="header-section">
          <view class="top-bar">
            <view class="avatar-wrapper">
              <image :src="avatarUrl" class="avatar-img" mode="aspectFill" />
              <view class="avatar-badges">
                <view class="badge-item orange">跑步</view>
                <view class="badge-item green">徒步</view>
              </view>
            </view>

            <view class="settings-btn" @click="handleToSettings">
              <wd-icon name="setting" size="20px" color="#64748b"></wd-icon>
            </view>
          </view>

          <view class="user-info">
            <text class="nickname">{{ userInfoRef.nickname || "默认名" }}</text>
            <text class="bio">{{ userInfoRef.introduction || "" }}</text>
          </view>

          <view class="tags-row">
            <view class="tag-item orange">
              <wd-icon
                class-prefix="iconfont"
                name="running"
                size="12px"
                custom-style="margin-right:4rpx"
              ></wd-icon
              >跑步
            </view>
            <view class="tag-item green">
              <wd-icon
                class-prefix="iconfont"
                name="mountain"
                size="12px"
                custom-style="margin-right:4rpx"
              ></wd-icon
              >徒步
            </view>
            <view class="tag-item purple">
              <wd-icon
                class-prefix="iconfont"
                name="book"
                size="12px"
                custom-style="margin-right:4rpx"
              ></wd-icon
              >读书
            </view>
          </view>

          <view class="stats-row">
            <view class="stat-item" @click="handleToMyPublished">
              <text class="num">{{ userInfoRef.initiateNum || 0 }}</text>
              <text class="label">发布</text>
            </view>
            <view class="stat-item" @click="handleToJoined">
              <text class="num">{{ userInfoRef.activitiesNum || 0 }}</text>
              <text class="label">参与</text>
            </view>
            <view class="stat-item">
              <text class="num green">{{ userInfoRef.credit || 0 }}</text>
              <text class="label">信用分</text>
            </view>
          </view>
        </view>
      </template>

      <!-- 已登录状态的内容区域 -->
      <template v-if="isAuthenticated">
        <view class="content-section">
          <view class="status-card">
            <view class="status-item" @click="handleToPending">
              <wd-icon
                class-prefix="iconfont"
                name="calendar-check"
                size="60rpx"
                color="#f97316"
                custom-style="margin-bottom:8rpx"
              ></wd-icon>
              <text class="status-label">待参加</text>
            </view>
            <view class="divider-v"></view>
            <view class="status-item" @click="handleToJoined">
              <wd-icon
                class-prefix="iconfont"
                name="lishi"
                size="60rpx"
                color="#3b82f6"
                custom-style="margin-bottom:8rpx"
              ></wd-icon>
              <text class="status-label">已参加</text>
            </view>
          </view>

          <view class="menu-list">
            <view class="menu-item border-bottom" @click="handleToMyPublished">
              <view class="menu-left">
                <view class="icon-box orange-bg">
                  <wd-icon
                    class-prefix="iconfont"
                    name="qizhi-"
                    size="42rpx"
                    color="#f97316"
                  ></wd-icon>
                </view>
                <text class="menu-text">我发起的活动</text>
              </view>
              <wd-icon name="arrow-right" size="16px" color="#cbd5e1"></wd-icon>
            </view>

            <view class="menu-item" @click="handleToVerify">
              <view class="menu-left">
                <view class="icon-box blue-bg">
                  <wd-icon
                    class-prefix="iconfont"
                    name="graduation-cap"
                    size="36rpx"
                    color="#3b82f6"
                  ></wd-icon>
                </view>
                <text class="menu-text">学生认证</text>
              </view>
              <view class="menu-right">
                <!-- 未认证 -->
                <view
                  v-if="verifyStatus === 'not_applied'"
                  class="status-tag neutral"
                >
                  未认证
                </view>
                <!-- 审核中 -->
                <view
                  v-else-if="verifyStatus === 'pending'"
                  class="status-tag warning"
                >
                  审核中
                </view>
                <!-- 已通过 -->
                <view
                  v-else-if="verifyStatus === 'verified'"
                  class="status-tag success"
                >
                  已通过
                </view>
                <!-- 已拒绝 -->
                <view
                  v-else-if="verifyStatus === 'rejected'"
                  class="status-tag danger"
                >
                  未通过
                </view>
              </view>
            </view>
          </view>
        </view>
      </template>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { ref, computed } from "vue";
import { useUserStore } from "@/store/user";
import { getProfile, getAuthProgress } from "@/api/profile/router";
import type { GetStudentAuthProgressData } from "@/types/modules/profile";

const userStore = useUserStore();
// 使用绝对路径确保静态资源正确加载
const defaultAvatar = "/static/default_avatar.png";
const loading = ref(false);

// 学生认证进度数据
const authProgress = ref<GetStudentAuthProgressData>({});

// 使用 computed 确保响应式
const isAuthenticated = computed(() => userStore.isAuthenticated);
const hasAvatar = computed(() => userStore.hasAvatar);
const userInfoRef = computed(() => userStore.userInfo);

// 处理头像URL，确保是绝对路径
const avatarUrl = computed(() => {
  const url = userInfoRef.value.avatarUrl;
  if (!url) return defaultAvatar;
  // 如果是相对路径，转换为绝对路径
  if (!url.startsWith("http") && !url.startsWith("/")) {
    return `/${url}`;
  }
  return url;
});

// 学生认证状态
const verifyStatus = computed(() => {
  const status = authProgress.value?.status;
  const action = authProgress.value?.need_action;

  // 未申请
  if (status === -1 || !authProgress.value?.has_record) {
    return "not_applied";
  }
  // 审核中（OCR审核中、待确认、人工审核）
  if (status === 1 || status === 2 || status === 3) {
    return "pending";
  }
  // 已通过
  if (status === 4 || action === "done") {
    return "verified";
  }
  // 已拒绝或超时
  if (status === 5 || status === 6 || action === "rejected") {
    return "rejected";
  }
  // 默认未认证
  return "not_applied";
});

// 映射后端 need_action 中文描述到枚举值
const mapNeedAction = (action: string | undefined): string => {
  if (!action) return "";
  const actionMap: Record<string, string> = {
    请填写认证信息: "apply",
    等待OCR识别: "wait_ocr",
    请确认识别信息: "confirm",
    等待人工审核: "wait_manual",
    认证已完成: "done",
    认证被拒绝: "rejected",
    // 支持枚举值
    apply: "apply",
    wait_ocr: "wait_ocr",
    confirm: "confirm",
    wait_manual: "wait_manual",
    done: "done",
    rejected: "rejected",
  };
  return actionMap[action] || action;
};

onShow(async () => {
  if (isAuthenticated.value) {
    loading.value = true;
    try {
      // 并行获取个人资料和认证进度
      const [profileRes, authRes] = await Promise.allSettled([
        getProfile(),
        getAuthProgress(),
      ]);

      // 更新个人资料
      if (profileRes.status === "fulfilled" && profileRes.value.data) {
        userStore.updateUserInfo(profileRes.value.data);
      }

      // 更新认证进度
      if (authRes.status === "fulfilled" && authRes.value.data) {
        const data = authRes.value.data;
        // 映射 need_action 从中文描述到枚举值
        authProgress.value = {
          ...data,
          need_action: mapNeedAction(data.need_action) as any,
        };
      }
    } catch (error: any) {
      console.error("获取个人资料失败:", error);
      // 如果获取失败且是401错误，清除用户状态
      if (error?.message?.includes("未授权")) {
        userStore.logout();
      }
    } finally {
      loading.value = false;
    }
  } else {
    // 未登录时尝试从本地存储恢复
    userStore.restoreFromStorage();
  }
});

// --- 导航逻辑 ---
const handleToLogin = () => {
  uni.navigateTo({ url: "/pages/login/index" });
};

const handleToRegister = () => {
  uni.navigateTo({ url: "/pages/register/index" });
};

const handleToSettings = () => {
  uni.navigateTo({ url: "/pages/settings/index" });
};

const handleToMyPublished = () => {
  uni.navigateTo({ url: "/pages/profile/published" });
};

const handleToPending = () => {
  uni.navigateTo({ url: "/pages/profile/pending" });
};

const handleToJoined = () => {
  uni.navigateTo({ url: "/pages/profile/history" });
};

const handleToVerify = () => {
  uni.navigateTo({ url: "/pages/profile/verify" });
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.profile-container {
  @include flex(column, flex-start, stretch);
  height: 100vh;
}

/* --- 未登录占位符 --- */
.guest-placeholder {
  flex: 1;
  @include flex(column, center, center);
  padding: $spacing-2xl $spacing-xl;
  background: linear-gradient(180deg, #f6faff 0%, #ffffff 100%);

  .guest-content {
    @include flex(column, center, center);
    width: 100%;
    max-width: 600rpx;
  }

  .guest-logo {
    width: 160rpx;
    height: 160rpx;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border-radius: 48rpx;
    @include flex(row, center, center);
    margin-bottom: $spacing-xl;
    box-shadow: 0 20rpx 60rpx rgba(249, 115, 22, 0.3);
  }

  .guest-title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    text-align: center;
    margin-bottom: $spacing-md;
  }

  .guest-subtitle {
    font-size: $font-size-base;
    color: $text-tertiary;
    text-align: center;
    margin-bottom: $spacing-2xl;
    line-height: 1.6;
  }

  .guest-login-btn {
    width: 100%;
    background-color: $text-primary;
    color: #ffffff;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    border-radius: $border-radius-xl;
    padding: 10rpx 0;
    line-height: 96rpx;
    box-shadow: $shadow-lg;
    margin-bottom: $spacing-lg;

    &::after {
      border: none;
    }

    &.btn-hover {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }

  .guest-register-tip {
    @include flex(row, center, center);
    font-size: $font-size-base;

    .text-gray {
      color: $text-tertiary;
    }

    .text-primary {
      color: $primary-color;
      margin-left: 8rpx;
      padding: 8rpx;
    }

    .font-bold {
      font-weight: $font-weight-bold;
    }
  }
}

/* --- 头部区域 --- */
.header-section {
  background-color: $surface-color; // #ffffff
  padding-bottom: $spacing-xl; // 32rpx
  padding-top: $spacing-xl; // 32rpx
  border-bottom: 1rpx solid $border-light;
  position: relative;
  z-index: 1;

  .top-bar {
    @include flex(row, space-between, flex-start);
    padding: 0 $spacing-md; // 24px -> 48rpx
    margin-bottom: $spacing-lg;

    .avatar-wrapper {
      position: relative;

      .avatar-img {
        width: 180rpx;
        height: 180rpx;
        border-radius: 50%;
        border: 8rpx solid $surface-color; // 白色边框
        box-shadow: $shadow-lg;
      }

      .avatar-badges {
        position: absolute;
        bottom: 10rpx;
        right: -$spacing-md;
        @include flex(row, flex-start, center);
        background: $surface-color;
        padding: 4rpx;
        border-radius: $border-radius-full;
        box-shadow: $shadow-sm;

        .badge-item {
          font-size: $font-size-xs;
          font-weight: $font-weight-bold;
          padding: 4rpx 10rpx;
          border-radius: 8rpx;
          margin-left: 4rpx;

          &:first-child {
            margin-left: 0;
          }
          &.orange {
            background: #fff7ed;
            color: $primary-color;
          }
          &.green {
            background: #f0fdf4;
            color: $secondary-color;
          }
        }
      }
    }

    .settings-btn {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      border: 1rpx solid $border-color;
      @include flex(row, center, center);
      margin-top: 20rpx;
    }
  }

  .user-info {
    padding: 0 $spacing-lg;
    margin-bottom: $spacing-md;

    .nickname {
      font-size: 48rpx;
      font-weight: $font-weight-bold;
      color: $text-primary;
      display: block;
      margin-bottom: 8rpx;
    }

    .bio {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }

  .tags-row {
    @include flex(row, flex-start, center);
    padding: 0 $spacing-lg;
    gap: $spacing-sm;
    margin-bottom: 40rpx;

    .tag-item {
      font-size: $font-size-sm;
      font-weight: $font-weight-bold;
      padding: 8rpx 20rpx;
      border-radius: $border-radius-full;
      @include flex(row, center, center);

      &.orange {
        background: #fff7ed;
        color: $primary-color;
      }
      &.green {
        background: #f0fdf4;
        color: $secondary-color;
      }
      &.purple {
        background: #f5f3ff;
        color: #7c3aed;
      }
    }
  }

  .stats-row {
    @include flex(row, flex-start, center);
    padding-top: $spacing-md;
    border-top: 1rpx solid $border-light;
    margin: 0 $spacing-lg;

    .stat-item {
      @include flex(column, center, center);
      margin-right: $spacing-xl;
      .num {
        font-size: $font-size-xl;
        font-weight: $font-weight-bold;
        color: $text-primary;
        line-height: 1.2;

        &.green {
          color: $secondary-color;
        }
      }

      .label {
        font-size: $font-size-sm;
        font-weight: $font-weight-bold;
        color: $text-tertiary;
        margin-top: 4rpx;
      }
    }
  }
}

/* --- 内容区域 --- */
.content-section {
  flex: 1;
  padding: 40rpx $spacing-lg;
  margin-top: -40rpx; // 向上一点，视觉连贯

  .status-card {
    background: $surface-color;
    border-radius: 48rpx;
    padding: $spacing-xl;
    box-shadow: $shadow-md; // 中等阴影
    @include flex(row, space-between, center);
    margin-bottom: $spacing-md;

    .status-item {
      flex: 1;
      @include flex(column, center, center);

      .status-label {
        font-size: $font-size-base;
        font-weight: $font-weight-bold;
        color: $text-secondary;
      }
    }

    .divider-v {
      width: 2rpx;
      height: 80rpx;
      background-color: $border-light;
    }
  }

  .menu-list {
    background: $surface-color;
    border-radius: 48rpx;
    padding: 0 $spacing-md;
    border: 1rpx solid $border-light;
    box-shadow: $shadow-sm;

    .menu-item {
      padding: 32rpx 0;
      @include flex(row, space-between, center);

      &.border-bottom {
        border-bottom: 1rpx solid $border-light;
      }

      .menu-left {
        @include flex(row, flex-start, center);
        gap: $spacing-md;

        .icon-box {
          width: 72rpx;
          height: 72rpx;
          border-radius: 50%;
          @include flex(row, center, center);

          &.orange-bg {
            background-color: #fff7ed;
          }
          &.blue-bg {
            background-color: #eff6ff;
          }
        }

        .menu-text {
          font-size: $font-size-base;
          font-weight: $font-weight-bold;
          color: $text-secondary;
        }
      }

      .menu-right {
        .status-tag {
          font-size: $font-size-sm;
          font-weight: $font-weight-bold;
          padding: 4rpx 16rpx;
          border-radius: 8rpx;

          &.neutral {
            background-color: #f1f5f9;
            color: #64748b;
          }
          &.warning {
            background-color: #fff7ed;
            color: #f59e0b;
          }
          &.success {
            background-color: #f0fdf4;
            color: $secondary-color;
          }
          &.danger {
            background-color: #fee2e2;
            color: $accent-color;
          }
        }
      }
    }
  }
}
</style>
