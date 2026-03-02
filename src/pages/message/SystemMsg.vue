<template>
  <CommonLayout headerType="none" title="系统消息" padding="0 0">
    <!-- 头部导航 -->
    <view class="header">
      <view class="header-left">
        <wd-icon
          class="wd-icon"
          name="arrow-left"
          size="24"
          @click="goBack"
        ></wd-icon>
        <view class="header-title">系统消息</view>
      </view>

      <view v-if="notifications.length > 0" class="header-actions">
        <view
          class="mark-all"
          @click="readAll"
          v-if="userStore.hasUnReadSystemMessage"
        >
          全部已读
        </view>
      </view>
    </view>

    <!-- 系统通知列表 -->
    <scroll-view
      class="message-list"
      scroll-y
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 加载状态 -->
      <view v-if="loading && !notifications.length" class="loading-state">
        <NotificationSkeleton :count="6" />
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading && !notifications.length" class="empty-state">
        <wd-icon name="chat" size="120rpx" color="#ccc" />
        <text class="empty-text">暂无系统消息</text>
      </view>

      <!-- 通知列表 -->
      <view v-else>
        <view
          class="message-item"
          :key="notification.notification_id"
          v-for="notification in notifications"
          @click="read([notification.notification_id])"
        >
          <view class="message-header">
            <view class="message-title">{{ notification.title }}</view>
            <view class="message-time">{{
              formatTime(notification.created_at)
            }}</view>
            <!-- 小红点未读提示 -->
            <view v-if="!notification.is_read" class="unread-dot"></view>
          </view>
          <view class="message-text">
            {{ notification.content }}
          </view>
        </view>
        <wd-loadmore :state="loadState" @reload="loadMore" />
      </view>
    </scroll-view>
  </CommonLayout>
</template>

<script setup lang="ts">
import {
  getNotifications,
  markNotificationsRead,
  markNotificationsReadAll,
} from "@/api/message/router";
import { onMounted, ref } from "vue";
import { useUserStore } from "@/store/user";
const userStore = useUserStore(); // 个人信息

// 系统通知列表
const notifications = ref<any[]>([]);

// 分页状态
const page = ref(1);
const pageSize = 10;
const hasMore = ref(true);
const loading = ref(false);
const isRefreshing = ref(false);
const loadState = ref<"loading" | "finished" | "error">("loading");

const formatTime = (time: string | number) => {
  try {
    let timestamp = time;

    if (typeof time === "number") {
      // 核心逻辑：判断是否为秒级时间戳
      // 10位数字的数量级在 10^9 到 10^10 之间（对应 1970年到 2286年）
      if (time < 1e12) {
        timestamp = time * 1000;
      }
    } else {
      // 如果输入是字符串类型的数字，先尝试转成数字处理
      const numTime = Number(time);
      if (!isNaN(numTime)) {
        timestamp = numTime < 1e12 ? numTime * 1000 : numTime;
      } else {
        timestamp = time;
      }
    }

    const date = new Date(timestamp);

    // 检查 Date 对象是否合法（防止类似 "abc" 导致的 Invalid Date）
    if (isNaN(date.getTime())) return typeof time === "string" ? time : "";

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}-${month}-${day}`;
  } catch {
    return typeof time === "string" ? time : "";
  }
};

// 加载通知列表
const loadNotifications = async (isRefresh = false) => {
  if (loading.value) return;

  if (isRefresh) {
    page.value = 1;
    hasMore.value = true;
  }

  loading.value = true;
  loadState.value = "loading";

  try {
    const res = await getNotifications(userStore.userId, page.value, pageSize);

    if (isRefresh) {
      notifications.value = res.data.notifications || [];
    } else {
      notifications.value = [
        ...notifications.value,
        ...(res.data.notifications || []),
      ];
    }

    const newItems = res.data.notifications?.length || 0;
    hasMore.value = newItems >= pageSize;
    loadState.value = hasMore.value ? "loading" : "finished";
  } catch (error) {
    loadState.value = "error";
    console.error("加载通知失败:", error);
  } finally {
    loading.value = false;
  }
};

// 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true;
  await loadNotifications(true);
  isRefreshing.value = false;
};

// 上拉加载更多
const loadMore = async () => {
  if (!hasMore.value || loading.value) return;
  page.value++;
  await loadNotifications(false);
};

const read = (ids: string[]) => {
  // 标记消息为已读的逻辑
  markNotificationsRead(userStore.userId, ids).then(() => {
    uni.showToast({
      title: " 已读成功",
      icon: "success",
    });
    // 刷新通知列表
    loadNotifications(true);
  });
};

const readAll = () => {
  // 标记所有消息为已读的逻辑
  markNotificationsReadAll(userStore.userId).then(() => {
    uni.showToast({
      title: " 已读成功",
      icon: "success",
    });
    // 刷新通知列表
    loadNotifications(true);
  });
};

import { safeNavigateBack } from "@/utils/navigation";

const goBack = () => {
  safeNavigateBack("/pages/message/index");
};

onMounted(() => {
  loadNotifications(true);
});
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;
// 头部导航
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
  padding: $spacing-lg $spacing-md 0;
  .header-left {
    display: flex;
    align-items: center;
    .wd-icon {
      margin-right: $spacing-sm;
    }
  }
  .header-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }
  .header-actions {
    display: flex;
    align-items: center;
    .mark-all {
      font-size: $font-size-sm;
      color: $accent-color;
    }
  }
}

// 消息列表
.message-list {
  height: calc(100vh - 200rpx);
  padding: $spacing-md;

  .message-item {
    padding: $spacing-md;
    background-color: $surface-color;
    border-radius: $border-radius-xl;
    box-shadow: $shadow-sm;
    margin-bottom: $spacing-md;

    .message-header {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-sm;
      .message-title {
        font-size: $font-size-base;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }
      .message-time {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }
      .unread-dot {
        position: absolute;
        right: -10rpx;
        top: -10rpx;
        width: 8px;
        height: 8px;
        background-color: $accent-color;
        border-radius: 50%;
        margin-left: 8px;
      }
    }
    .message-text {
      display: flex;
      align-items: center;
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }
}

// 加载状态
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 150rpx 0;

  .empty-text {
    margin-top: $spacing-md;
    font-size: $font-size-sm;
    color: $text-tertiary;
  }
}
</style>
