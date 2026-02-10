<template>
  <CommonLayout headerType="standard" title="我发布的" showBack bgWhite>
    <!-- 加载中 -->
    <view v-if="loading" class="loading-container">
      <AsyncLoading text="加载中..." />
    </view>

    <!-- 空状态 -->
    <view v-else-if="activities.length === 0" class="empty-container">
      <wd-icon name="folder" size="64px" color="#cbd5e1"></wd-icon>
      <text class="empty-text">暂无发布活动</text>
    </view>

    <!-- 活动列表 -->
    <view v-else class="list-container">
      <view
        class="activity-card"
        v-for="activity in activities"
        :key="activity.id"
        @click="handleToDetail(activity.id)"
      >
        <image
          :src="activity.imageUrl || defaultImage"
          class="cover-img"
          mode="aspectFill"
        />
        <view class="info-col">
          <text class="title">{{ activity.categoryName }}</text>
          <view class="meta-row">
            <wd-icon
              name="time"
              size="12px"
              color="#94a3b8"
              custom-style="margin-right:8rpx"
            ></wd-icon>
            <text class="time">{{
              formatTime(activity.activityStartTime)
            }}</text>
          </view>
          <view class="status-row">
            <view
              class="status-tag"
              :class="getStatusClass(activity.statusText)"
            >
              {{ activity.statusText }}
            </view>
            <text
              class="countdown-text"
              :class="getCountdownClass(activity.activityStartTime)"
            >
              {{ getCountdownText(activity.activityStartTime) }}
            </text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view
        v-if="hasMore"
        class="load-more"
        @click="loadMore"
        hover-class="btn-hover"
      >
        <text v-if="loadingMore">加载中...</text>
        <text v-else>加载更多</text>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getMyCreated } from "@/api/activity/router";
import type { MyCreatedActivity } from "@/types/modules/activity";

const defaultImage = "https://picsum.photos/200?random=1";
const loading = ref(true);
const loadingMore = ref(false);
const activities = ref<MyCreatedActivity["list"]>([]);
const currentPage = ref(1);
const total = ref(0);
const pageSize = 12;

const hasMore = computed(() => activities.value.length < total.value);

// 格式化时间显示 - 支持时间戳和字符串格式
const formatTime = (time: string | number) => {
  try {
    const date = typeof time === "number" ? new Date(time) : new Date(time);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${month}.${day} ${hour}:${minute}`;
  } catch {
    return typeof time === "string" ? time : "";
  }
};

// 计算倒计时文本 - 支持时间戳和字符串格式
const getCountdownText = (time: string | number) => {
  try {
    const activityTime =
      typeof time === "number" ? time : new Date(time).getTime();
    const now = Date.now();
    const diff = activityTime - now;

    if (diff <= 0) {
      return "已结束";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}天后`;
    } else if (hours > 0) {
      return `${hours}小时后`;
    } else {
      return "即将开始";
    }
  } catch {
    return "";
  }
};

// 获取倒计时样式类
const getCountdownClass = (time: string | number) => {
  try {
    const activityTime =
      typeof time === "number" ? time : new Date(time).getTime();
    const now = Date.now();
    return activityTime < now ? "ended" : "upcoming";
  } catch {
    return "";
  }
};

// 获取状态样式类
const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    已发布: "published",
    待审核: "pending",
    已拒绝: "rejected",
    草稿: "draft",
    已取消: "cancelled",
    已结束: "ended",
    报名中: "success",
  };
  return statusMap[status] || "default";
};

// 获取活动列表
const fetchActivities = async (page: number) => {
  try {
    const response = await getMyCreated(page, pageSize);
    if (response.data) {
      if (page === 1) {
        activities.value = response.data.list || [];
      } else {
        activities.value.push(...(response.data.list || []));
      }
      total.value = response.data.pagination.total || 0;
      currentPage.value = page;
    }
  } catch (error) {
    console.error("获取我发起的活动失败:", error);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// 加载更多
const loadMore = () => {
  if (loadingMore.value || !hasMore.value) return;
  loadingMore.value = true;
  fetchActivities(currentPage.value + 1);
};

// 跳转到活动详情
const handleToDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/activity/detail?id=${id}`,
  });
};

onMounted(() => {
  fetchActivities(1);
});
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.loading-container {
  height: 60vh;
  @include flex(column, center, center);
}

.empty-container {
  height: 60vh;
  @include flex(column, center, center);
  gap: $spacing-md;

  .empty-text {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }
}

.list-container {
  padding: $spacing-md;
}

.activity-card {
  @include card;
  border: 1rpx solid $border-light;
  padding: $spacing-sm;
  margin-bottom: $spacing-md;
  @include flex(row, flex-start, center);
  gap: $spacing-md;

  .cover-img {
    width: 160rpx;
    height: 160rpx;
    border-radius: $border-radius-md;
    background-color: $background-color;
    flex-shrink: 0;
  }

  .info-col {
    flex: 1;
    height: 160rpx;
    @include flex(column, space-between, flex-start);
    padding: 4rpx 0;

    .title {
      font-size: $font-size-base;
      font-weight: $font-weight-bold;
      color: $text-primary;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .meta-row {
      @include flex(row, flex-start, center);
      .time {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }

    .status-row {
      @include flex(row, space-between, center);
      gap: $spacing-xs;
    }

    .status-tag {
      font-size: $font-size-xs;
      padding: 4rpx 12rpx;
      border-radius: $border-radius-sm;
      font-weight: $font-weight-bold;
      font-size: $font-size-xs;
      padding: 4rpx 12rpx;
      border-radius: $border-radius-sm;
      font-weight: $font-weight-bold;

      &.published {
        background-color: #dcfce7;
        color: #166534;
      }

      &.pending {
        background-color: #fef3c7;
        color: #92400e;
      }

      &.rejected {
        background-color: #fee2e2;
        color: #991b1b;
      }

      &.draft {
        background-color: #f1f5f9;
        color: #475569;
      }

      &.cancelled {
        background-color: #f3f4f6;
        color: #6b7280;
      }

      &.ended {
        background-color: #e5e7eb;
        color: #374151;
      }

      &.default {
        background-color: #f3f4f6;
        color: #6b7280;
      }

      &.success {
        background-color: $primary-color;
        color: #fff;
      }
    }

    .countdown-text {
      font-size: $font-size-xs;
      font-weight: $font-weight-bold;

      &.upcoming {
        color: $primary-color;
      }
      &.ended {
        color: $text-tertiary;
      }
    }
  }
}

.load-more {
  text-align: center;
  padding: $spacing-lg;
  font-size: $font-size-sm;
  color: $text-secondary;

  &.btn-hover {
    opacity: 0.7;
  }
}
</style>
