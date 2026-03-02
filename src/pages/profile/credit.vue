<template>
  <CommonLayout headerType="standard" title="信用记录" contentBg="#f8fafc">
    <view class="credit-page">
      <!-- 当前信用分卡片骨架屏 -->
      <view v-if="initialLoading" class="current-credit-card skeleton">
        <view class="skeleton-label"></view>
        <view class="skeleton-score-row">
          <view class="skeleton-score"></view>
          <view class="skeleton-change"></view>
        </view>
      </view>

      <!-- 当前信用分卡片 -->
      <view v-else class="current-credit-card">
        <view class="credit-info">
          <text class="credit-label">当前信用分</text>
          <view class="credit-score-row">
            <text class="credit-score">{{ currentCredit }}</text>
            <view
              class="score-change"
              :class="{ positive: totalDelta > 0, negative: totalDelta < 0 }"
            >
              <wd-icon
                :name="totalDelta > 0 ? 'arrow-up' : 'arrow-down'"
                size="24rpx"
                :color="totalDelta > 0 ? '#10b981' : '#ef4444'"
              ></wd-icon>
              <text>{{ totalDelta > 0 ? "+" : "" }}{{ totalDelta }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 筛选器骨架屏 -->
      <view v-if="initialLoading" class="filter-section skeleton">
        <view class="filter-scroll">
          <view class="skeleton-filter-item" v-for="i in 4" :key="i"></view>
        </view>
      </view>

      <!-- 筛选器 -->
      <view v-else class="filter-section">
        <scroll-view class="filter-scroll" scroll-x :show-scrollbar="false">
          <view
            class="filter-item"
            :class="{ active: !selectedType }"
            @click="handleFilterChange(0)"
          >
            <text class="filter-text">全部</text>
          </view>
          <view
            v-for="type in filterTypes"
            :key="type.value"
            class="filter-item"
            :class="{ active: selectedType === type.value }"
            @click="handleFilterChange(type.value)"
          >
            <text class="filter-text">{{ type.label }}</text>
          </view>
        </scroll-view>
      </view>

      <!-- 记录列表 -->
      <view class="logs-section">
        <!-- 骨架屏 -->
        <view v-if="initialLoading" class="logs-list skeleton-list">
          <view class="log-item skeleton-item" v-for="i in 5" :key="i">
            <view class="skeleton-icon"></view>
            <view class="skeleton-content">
              <view class="skeleton-header">
                <view class="skeleton-type"></view>
                <view class="skeleton-delta"></view>
              </view>
              <view class="skeleton-reason"></view>
              <view class="skeleton-time"></view>
            </view>
          </view>
        </view>

        <!-- 加载状态（非首次加载） -->
        <view v-else-if="loading" class="loading-state">
          <wd-icon name="loading" size="48rpx" color="#cbd5e1"></wd-icon>
          <text class="loading-text">加载中...</text>
        </view>

        <!-- 空状态 -->
        <view v-else-if="creditLogs.length === 0" class="empty-state">
          <view class="empty-icon-wrapper">
            <wd-icon name="info-circle" size="120rpx" color="#cbd5e1"></wd-icon>
          </view>
          <text class="empty-title">暂无信用记录</text>
          <text class="empty-desc">参与活动并签到可以获得信用分</text>
        </view>

        <!-- 记录列表 -->
        <view v-else class="logs-list">
          <view
            v-for="(log, index) in creditLogs"
            :key="log.id"
            class="log-item"
            :class="{ first: index === 0 }"
          >
            <view class="log-icon" :class="getChangeTypeClass(log.changeType)">
              <wd-icon
                :name="getChangeTypeIcon(log.changeType)"
                size="36rpx"
                color="#fff"
              ></wd-icon>
            </view>
            <view class="log-content">
              <view class="log-header">
                <text class="log-type">{{ log.changeTypeName }}</text>
                <view class="log-delta" :class="getDeltaClass(log.delta)">
                  <text>{{ log.delta > 0 ? "+" : "" }}{{ log.delta }}</text>
                </view>
              </view>
              <text class="log-reason">{{ log.reason }}</text>
              <text class="log-time">{{ formatTime(log.createdAt) }}</text>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view
          v-if="hasMore && !loading && !initialLoading"
          class="load-more"
          @click="loadMore"
        >
          <text>加载更多</text>
        </view>
        <view
          v-if="!hasMore && creditLogs.length > 0 && !initialLoading"
          class="no-more"
        >
          <text>没有更多记录了</text>
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getCreditLogs } from "@/api/profile/router";
import { CreditChangeType } from "@/types/modules/credit";
import type { CreditLog } from "@/types/modules/credit";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const currentCredit = computed(() => userStore.userInfo.credit || 0);

// 筛选类型
const filterTypes = [
  { label: "正常履约", value: CreditChangeType.NORMAL_PERFORMANCE },
  { label: "爽约", value: CreditChangeType.NO_SHOW },
  { label: "圆满举办", value: CreditChangeType.SUCCESSFUL_EVENT },
  { label: "提前取消", value: CreditChangeType.EARLY_CANCEL },
  { label: "临期取消", value: CreditChangeType.EXPIRED_CANCEL },
  { label: "删除活动", value: CreditChangeType.DELETE_ACTIVITY },
];

// 数据状态
const creditLogs = ref<CreditLog[]>([]);
const selectedType = ref<number | undefined>(undefined);
const loading = ref(false);
const initialLoading = ref(true);
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const hasMore = computed(() => creditLogs.value.length < total.value);

// 计算总变动分值
const totalDelta = computed(() => {
  return creditLogs.value.reduce((sum, log) => sum + log.delta, 0);
});

// 获取信用分记录
const fetchCreditLogs = async (isLoadMore = false) => {
  if (loading.value) return;

  loading.value = true;
  try {
    const currentPage = isLoadMore ? page.value + 1 : 1;

    const res = await getCreditLogs({
      changeType: selectedType.value,
      page: currentPage,
      pageSize: pageSize.value,
    });

    if (res.data) {
      const newLogs = res.data.list || [];

      if (isLoadMore) {
        creditLogs.value = [...creditLogs.value, ...newLogs];
        page.value = currentPage;
      } else {
        creditLogs.value = newLogs;
        page.value = 1;
      }

      total.value = res.data.total || 0;
    }
  } catch (error) {
    console.error("获取信用记录失败:", error);
    uni.showToast({
      title: "加载失败，请重试",
      icon: "none",
    });
  } finally {
    loading.value = false;
    initialLoading.value = false;
  }
};

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    fetchCreditLogs(true);
  }
};

// 筛选类型变更
const handleFilterChange = (type: number | undefined) => {
  if (selectedType.value === type) return;

  selectedType.value = type;
  page.value = 1;
  creditLogs.value = [];
  fetchCreditLogs();
};

// 获取变动类型样式类
const getChangeTypeClass = (changeType: CreditChangeType): string => {
  const classMap: Record<number, string> = {
    [CreditChangeType.REGISTER_INIT]: "init",
    [CreditChangeType.NORMAL_PERFORMANCE]: "positive",
    [CreditChangeType.EARLY_CANCEL]: "neutral",
    [CreditChangeType.EXPIRED_CANCEL]: "neutral",
    [CreditChangeType.NO_SHOW]: "negative",
    [CreditChangeType.SUCCESSFUL_EVENT]: "excellent",
    [CreditChangeType.DELETE_ACTIVITY]: "warning",
    [CreditChangeType.ADMIN_ADJUST]: "admin",
  };
  return classMap[changeType] || "default";
};

// 获取变动类型图标
const getChangeTypeIcon = (changeType: CreditChangeType): string => {
  const iconMap: Record<number, string> = {
    [CreditChangeType.REGISTER_INIT]: "user",
    [CreditChangeType.NORMAL_PERFORMANCE]: "check-outline",
    [CreditChangeType.EARLY_CANCEL]: "close-outline",
    [CreditChangeType.EXPIRED_CANCEL]: "time",
    [CreditChangeType.NO_SHOW]: "error-outline",
    [CreditChangeType.SUCCESSFUL_EVENT]: "star",
    [CreditChangeType.DELETE_ACTIVITY]: "delete-key",
    [CreditChangeType.ADMIN_ADJUST]: "edit",
  };
  return iconMap[changeType] || "info-circle";
};

// 获取分数变动样式类
const getDeltaClass = (delta: number): string => {
  if (delta > 0) return "positive";
  if (delta < 0) return "negative";
  return "neutral";
};

// 格式化时间
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟前`;
  }

  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}小时前`;
  }

  // 小于7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}天前`;
  }

  // 其他显示完整日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
};

onMounted(() => {
  fetchCreditLogs();
});
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.credit-page {
  padding: $spacing-md;

  /* 当前信用分卡片 */
  .current-credit-card {
    background: linear-gradient(135deg, $primary-color 0%, #fb923c 100%);
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    margin-bottom: $spacing-md;
    box-shadow: $shadow-md;

    &.skeleton {
      background: $surface-color;

      .skeleton-label {
        width: 140rpx;
        height: 28rpx;
        background: linear-gradient(
          90deg,
          #e2e8f0 25%,
          #f1f5f9 50%,
          #e2e8f0 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: $border-radius-sm;
        margin-bottom: $spacing-sm;
      }

      .skeleton-score-row {
        @include flex(row, flex-start, center);
        gap: $spacing-md;

        .skeleton-score {
          width: 180rpx;
          height: 64rpx;
          background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f1f5f9 50%,
            #e2e8f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: $border-radius-md;
        }

        .skeleton-change {
          width: 100rpx;
          height: 48rpx;
          background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f1f5f9 50%,
            #e2e8f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: $border-radius-full;
        }
      }
    }

    .credit-info {
      @include flex(column, flex-start, flex-start);

      .credit-label {
        font-size: $font-size-sm;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: $spacing-xs;
      }

      .credit-score-row {
        @include flex(row, flex-start, center);
        gap: $spacing-md;

        .credit-score {
          font-size: 64rpx;
          font-weight: $font-weight-bold;
          color: #fff;
          line-height: 1;
        }

        .score-change {
          @include flex(row, center, center);
          gap: $spacing-xs;
          padding: $spacing-xs $spacing-sm;
          background: rgba(255, 255, 255, 0.2);
          border-radius: $border-radius-full;
          backdrop-filter: blur(10rpx);
          height: 48rpx;

          &.positive {
            background: rgba(16, 185, 129, 0.2);
          }

          &.negative {
            background: rgba(239, 68, 68, 0.2);
          }

          text {
            font-size: $font-size-base;
            font-weight: $font-weight-semibold;
            color: #fff;
          }
        }
      }
    }
  }

  /* 筛选区域 */
  .filter-section {
    background: $surface-color;
    border-radius: $border-radius-lg;
    padding: $spacing-md;
    margin-bottom: $spacing-md;
    box-shadow: $shadow-sm;

    &.skeleton {
      .filter-scroll {
        white-space: nowrap;

        .skeleton-filter-item {
          display: inline-block;
          width: 120rpx;
          height: 56rpx;
          margin-right: $spacing-sm;
          background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f1f5f9 50%,
            #e2e8f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: $border-radius-full;

          &:last-child {
            margin-right: 0;
          }
        }
      }
    }

    .filter-scroll {
      white-space: nowrap;

      .filter-item {
        display: inline-block;
        margin-right: $spacing-sm;
        padding: $spacing-xs $spacing-md;
        background: $background-color;
        border-radius: $border-radius-full;
        border: 1rpx solid $border-color;
        transition: all 0.3s ease;

        &.active {
          background: $primary-color;
          border-color: $primary-color;

          .filter-text {
            color: #fff;
          }
        }

        .filter-text {
          font-size: $font-size-sm;
          color: $text-secondary;
        }

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  /* 记录区域 */
  .logs-section {
    .loading-state,
    .empty-state {
      @include flex(column, center, center);
      padding: $spacing-xl 0;
      gap: $spacing-md;

      .loading-text,
      .empty-text {
        font-size: $font-size-sm;
        color: $text-tertiary;
      }
    }

    .logs-list {
      .log-item {
        @include flex(row, flex-start, flex-start);
        padding: $spacing-md 0;
        border-bottom: 1rpx solid $border-light;

        &:first-child {
          padding-top: 0;
        }

        &:last-child {
          border-bottom: none;
        }

        .log-icon {
          @include flex(row, center, center);
          width: 64rpx;
          height: 64rpx;
          border-radius: $border-radius-full;
          margin-right: $spacing-sm;
          flex-shrink: 0;

          &.positive {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          }

          &.negative {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          }

          &.excellent {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          }

          &.neutral {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          }

          &.warning {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          }

          &.admin {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          }

          &.init {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          }

          &.default {
            background: $background-color;
          }
        }

        .log-content {
          flex: 1;
          @include flex(column, flex-start, flex-start);
          gap: 8rpx;

          .log-header {
            @include flex(row, space-between, center);
            width: 100%;

            .log-type {
              font-size: $font-size-base;
              font-weight: $font-weight-medium;
              color: $text-primary;
            }

            .log-delta {
              padding: 4rpx $spacing-sm;
              border-radius: $border-radius-full;
              font-size: $font-size-sm;
              font-weight: $font-weight-semibold;

              &.positive {
                background: rgba(16, 185, 129, 0.1);
                color: #10b981;
              }

              &.negative {
                background: rgba(239, 68, 68, 0.1);
                color: #ef4444;
              }

              &.neutral {
                background: $background-color;
                color: $text-tertiary;
              }
            }
          }

          .log-reason {
            font-size: $font-size-sm;
            line-height: 1.5;
            color: $text-secondary;
          }

          .log-time {
            font-size: $font-size-xs;
            color: $text-tertiary;
          }
        }
      }
    }

    .load-more,
    .no-more {
      @include flex(row, center, center);
      padding: $spacing-md 0;
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }
}
</style>
