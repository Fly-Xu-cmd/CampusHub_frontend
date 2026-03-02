<template>
  <CommonLayout
    headerType="none"
    :contentBg="isAuthenticated ? 'fff' : '#f6faff'"
    padding="0 0"
    :showTabBar="isAuthenticated"
    :isSafeArea="false"
  >
    <ClientOnly
      style="background: linear-gradient(180deg, #f6faff 0%, #ffffff 100%)"
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
                <!-- 头像加载失败时显示图标兜底 -->
                <view v-if="avatarLoadError" class="avatar-fallback">
                  <wd-icon
                    class-prefix="iconfont"
                    name="morentouxiang"
                    size="190rpx"
                    color="#94a3b8"
                  />
                </view>
                <!-- 正常显示头像 -->
                <wd-avatar
                  v-else
                  :src="avatarUrl"
                  size="180rpx"
                  shape="round"
                  mode="aspectFill"
                  custom-class="profile-avatar"
                  @error="handleAvatarError"
                />
                <!-- 头像徽章：显示前2个兴趣标签 -->
                <view
                  v-if="displayInterestTags.length > 0"
                  class="avatar-badges"
                >
                  <view
                    v-for="(tag, index) in displayInterestTags.slice(0, 2)"
                    :key="tag.id"
                    class="badge-item"
                    :class="getTagColorClass(index)"
                  >
                    <wd-icon
                      v-if="tag.tagIcon"
                      class-prefix="iconfont"
                      :name="tag.tagIcon"
                      size="24rpx"
                      custom-style="margin-right:4rpx"
                    ></wd-icon>
                    {{ tag.tagName }}
                  </view>
                </view>
              </view>

              <view class="settings-btn" @click="handleToSettings">
                <wd-icon name="setting" size="20px" color="#64748b"></wd-icon>
              </view>
            </view>

            <view class="user-info">
              <text class="nickname">{{
                userInfoRef.nickname || "默认名"
              }}</text>
              <text class="bio">{{ userInfoRef.introduction || "" }}</text>
            </view>

            <!-- 兴趣标签行 -->
            <view class="tags-row">
              <!-- 有兴趣标签时显示 -->
              <template v-if="displayInterestTags.length > 0">
                <view
                  v-for="(tag, index) in displayInterestTags"
                  :key="tag.id"
                  class="tag-item"
                  :class="getTagColorClass(index)"
                >
                  <wd-icon
                    v-if="tag.tagIcon"
                    class-prefix="iconfont"
                    :name="tag.tagIcon"
                    size="12px"
                    custom-style="margin-right:4rpx"
                  ></wd-icon>
                  {{ tag.tagName }}
                </view>
              </template>
              <!-- 无兴趣标签时显示兜底提示 -->
              <view
                v-else
                class="tag-item placeholder"
                @click="handleToAddInterests"
              >
                <wd-icon
                  class-prefix="iconfont"
                  name="add"
                  size="12px"
                  custom-style="margin-right:4rpx"
                ></wd-icon>
                添加兴趣
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
              <view class="stat-item" @click="handleToCredit">
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
              <view class="divider-v"></view>
              <view class="status-item" @click="handleScanQRCode">
                <wd-icon
                  class-prefix="iconfont"
                  name="scan"
                  size="60rpx"
                  color="#10b981"
                  custom-style="margin-bottom:8rpx"
                ></wd-icon>
                <text class="status-label">扫码核销</text>
              </view>
            </view>

            <view class="menu-list">
              <view
                class="menu-item border-bottom"
                @click="handleToMyPublished"
              >
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
                <wd-icon
                  name="arrow-right"
                  size="16px"
                  color="#cbd5e1"
                ></wd-icon>
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
    </ClientOnly>
  </CommonLayout>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useUserStore } from "@/store/user";
import { getProfile, getAuthProgress } from "@/api/profile/router";
import type { GetStudentAuthProgressData } from "@/types/modules/profile";
import { getWebSocket } from "@/utils/websocket";

const userStore = useUserStore();
// 使用绝对路径确保静态资源正确加载
const defaultAvatar = "/static/default_avatar.png";
const loading = ref(false);

// 头像加载失败状态
const avatarLoadError = ref(false);

// 学生认证进度数据
const authProgress = ref<GetStudentAuthProgressData>({});

// 使用 computed 确保响应式
const isAuthenticated = computed(() => userStore.isAuthenticated);
const hasAvatar = computed(() => userStore.hasAvatar);
const userInfoRef = computed(() => userStore.userInfo);

// 兴趣标签显示
const displayInterestTags = computed(() => {
  const tags = userInfoRef.value.interestTags || [];
  return tags;
});

// 获取标签颜色class（按索引循环）
const getTagColorClass = (index: number): string => {
  const colorClasses = ["orange", "green", "purple"];
  return colorClasses[index % colorClasses.length];
};

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

// 头像加载错误处理
const handleAvatarError = () => {
  avatarLoadError.value = true;
};

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

onShow(() => {
  if (isAuthenticated.value) {
    loading.value = true;
    // 重置头像加载错误状态
    avatarLoadError.value = false;
    try {
      getProfile()
        .then((res) => {
          const data = res.data;
          userStore.updateUserInfo(data);
        })
        .catch((err) => {
          console.error("获取个人资料失败:", err);
          // 如果获取失败且是401错误，清除用户状态
          if (err?.message?.includes("未授权")) {
            userStore.logout();
          }
        });
    } finally {
      loading.value = false;
    }
  } else {
    // 未登录时尝试从本地存储恢复
    userStore.restoreFromStorage();
  }
});

const handleVerifyProgress = async (data: GetStudentAuthProgressData) => {
  console.log("收到认证进度更新:", data);
  if (data.refresh) {
    getAuthProgress()
      .then((res) => {
        const data = res.data;
        authProgress.value = {
          ...data,
          need_action: mapNeedAction(data.need_action) as any,
        };
        console.log("更新认证进度:", authProgress.value);
      })
      .catch((err) => {
        console.error("获取认证进度失败:", err);
      });
  }
};

onMounted(async () => {
  // 页面初次加载时的逻辑（如果需要）
  getAuthProgress()
    .then((res) => {
      const data = res.data;
      authProgress.value = {
        ...data,
        need_action: mapNeedAction(data.need_action) as any,
      };
    })
    .catch((err) => {
      console.error("获取认证进度失败:", err);
    });
  // 注册 WebSocket 监听器，实时接收认证状态更新
  const ws = getWebSocket();
  if (ws) {
    ws.on("verifyProgress", handleVerifyProgress);
    console.log("[VerifyPage] 已注册学生认证状态更新监听器");
  }
});

onUnmounted(async () => {
  // 页面卸载时清理 WebSocket 监听器
  const ws = getWebSocket();
  if (ws) {
    ws.off("verifyProgress", handleVerifyProgress);
    console.log("[VerifyPage] 已移除学生认证状态更新监听器");
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

const handleToCredit = () => {
  uni.navigateTo({ url: "/pages/profile/credit" });
};

const handleToVerify = () => {
  uni.navigateTo({ url: "/pages/profile/verify" });
};

const handleToAddInterests = () => {
  // 跳转到兴趣标签选择页（如果有的话）或者设置页面
  uni.navigateTo({ url: "/pages/selectTags/index" });
};

// 扫描核销码
const handleScanQRCode = () => {
  // #ifdef MP-WEIXIN
  uni.scanCode({
    success: (res: any) => {
      console.log("扫码结果:", res);
      // 跳转到核销页面，传递扫码结果
      uni.navigateTo({
        url: `/pages/activity/verify?code=${encodeURIComponent(res.result)}`,
      });
    },
    fail: (err: any) => {
      console.error("扫码失败:", err);
      if (err.errMsg !== "scanCode:fail cancel") {
        uni.showToast({
          title: "扫码失败",
          icon: "none",
        });
      }
    },
  });
  // #endif

  // #ifdef H5
  // H5 环境下跳转到核销页面（搜索活动 -> 输入核销码）
  uni.navigateTo({ url: "/pages/activity/verify" });
  // #endif
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.profile-container {
  @include flex(column, flex-start, stretch);
  height: 100%;
  width: 100%;
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
  padding: $spacing-sm;
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

      // 头像加载失败时的兜底样式
      .avatar-fallback {
        width: 180rpx;
        height: 180rpx;
        border-radius: 50%;
        border: 8rpx solid $surface-color;
        box-shadow: $shadow-lg;
        background: #f1f5f9;
        @include flex(row, center, center);
      }

      // 使用深度选择器自定义 wd-avatar 样式
      :deep(.wd-avatar) {
        width: 180rpx !important;
        height: 180rpx !important;
        border: 8rpx solid $surface-color;
        box-shadow: $shadow-lg;
      }

      .avatar-badges {
        position: absolute;
        bottom: 0;
        right: -50%;
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
          @include flex(row, center, center);

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
    flex-wrap: wrap;
    padding: 0 $spacing-lg;
    gap: $spacing-sm;
    margin-bottom: 40rpx;

    .tag-item {
      font-size: $font-size-sm;
      font-weight: $font-weight-bold;
      padding: 8rpx 20rpx;
      border-radius: $border-radius-full;
      @include flex(row, center, center);
      flex-wrap: nowrap;

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
      // 兜底样式：添加兴趣按钮
      &.placeholder {
        background: #f1f5f9;
        color: $text-tertiary;
        border: 1rpx dashed $border-color;
        cursor: pointer;

        &:active {
          opacity: 0.7;
        }
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
        font-size: $font-size-sm;
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
