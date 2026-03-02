<template>
  <CommonLayout headerType="standard" title="已参加活动" showBack bgWhite>
    <ClientOnly>
      <template #default>
        <!-- 加载中 -->
        <view v-if="loading" class="loading-container">
          <AsyncLoading text="加载中..." />
        </view>

        <!-- 空状态 -->
        <view v-else-if="activities.length === 0" class="empty-container">
          <wd-icon name="time" size="64px" color="#cbd5e1"></wd-icon>
          <text class="empty-text">暂无已参加活动</text>
        </view>

        <!-- 活动列表 -->
        <view v-else class="list-container">
          <view
            class="activity-card ended"
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
              <text class="title">{{ activity.name }}</text>
              <view class="meta-row">
                <wd-icon
                  name="time"
                  size="12px"
                  color="#94a3b8"
                  custom-style="margin-right:8rpx"
                ></wd-icon>
                <text class="time">{{ formatTime(activity.time) }}</text>
              </view>
              <text class="status-tip" :class="getStatusClass(activity.time)">{{
                getTimeStatusText(activity.time)
              }}</text>
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
      </template>

      <template #placeholder>
        <!-- SSR 骨架屏 -->
        <view class="skeleton-container">
          <view v-for="i in 3" :key="i" class="skeleton-card">
            <view class="skeleton-img"></view>
            <view class="skeleton-info">
              <view class="skeleton-title"></view>
              <view class="skeleton-meta"></view>
              <view class="skeleton-status"></view>
            </view>
          </view>
        </view>
      </template>
    </ClientOnly>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getActivityList } from "@/api/activity/router";
import type { ActivityListItem } from "@/types/modules/activity";

const defaultImage = "https://picsum.photos/200?random=5";
const loading = ref(true);
const loadingMore = ref(false);
const activities = ref<ActivityListItem[]>([]);
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
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${month}.${day} ${hours}:${minutes}`;
  } catch {
    return typeof time === "string" ? time : "";
  }
};

// 获取时间状态文本 - 支持时间戳和字符串格式
const getTimeStatusText = (time: string | number) => {
  try {
    const activityTime =
      typeof time === "number" ? time : new Date(time).getTime();
    const now = Date.now();
    const diff = activityTime - now;

    // 活动已结束
    if (diff < 0) {
      return "已结束";
    }
  } catch {
    return "";
  }
};

// 获取状态样式类
const getStatusClass = (time: string | number) => {
  try {
    const activityTime =
      typeof time === "number" ? time : new Date(time).getTime();
    const now = Date.now();
    return activityTime < now ? "ended" : "upcoming";
  } catch {
    return "";
  }
};

// 获取活动列表
const fetchActivities = async (page: number) => {
  try {
    const response = await getActivityList("已参加", page, pageSize);
    if (response.data) {
      if (page === 1) {
        activities.value = response.data.items || [];
      } else {
        activities.value.push(...(response.data.items || []));
      }
      total.value = response.data.total || 0;
      currentPage.value = page;
    }
  } catch (error) {
    console.error("获取已参加活动失败:", error);
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
    url: `/pages/home/detail?id=${id}`,
  });
};

onMounted(() => {
  fetchActivities(1);
});
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.loading-container,
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
  width: 100%;
  height: 100%;
  padding: $spacing-md;
}

.activity-card {
  @include card;
  border: 1rpx solid $border-light;
  padding: $spacing-sm;
  margin-bottom: $spacing-md;
  @include flex(row, flex-start, center);
  gap: $spacing-md;

  // --- 历史记录特有样式 ---
  &.ended {
    opacity: 0.6;
    .cover-img {
      filter: grayscale(100%);
    }
  }

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
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .meta-row {
      @include flex(row, flex-start, center);
      .time {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }

    .status-tip {
      font-size: $font-size-sm;
      font-weight: $font-weight-bold;

      &.ended {
        color: $text-tertiary;
      }
      &.upcoming {
        color: $primary-color;
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

// 骨架屏样式
.skeleton-container {
  padding: $spacing-md;
}

.skeleton-card {
  @include card;
  border: 1rpx solid $border-light;
  padding: $spacing-sm;
  margin-bottom: $spacing-md;
  @include flex(row, flex-start, center);
  gap: $spacing-md;

  .skeleton-img {
    width: 160rpx;
    height: 160rpx;
    border-radius: $border-radius-md;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    flex-shrink: 0;
  }

  .skeleton-info {
    flex: 1;
    height: 160rpx;
    @include flex(column, space-between, flex-start);
    padding: 4rpx 0;

    .skeleton-title {
      width: 80%;
      height: 40rpx;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      border-radius: 4rpx;
    }

    .skeleton-meta {
      width: 60%;
      height: 28rpx;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      border-radius: 4rpx;
    }

    .skeleton-status {
      width: 40%;
      height: 28rpx;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      border-radius: 4rpx;
    }
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
