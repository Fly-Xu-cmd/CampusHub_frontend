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

      <view class="header-actions">
        <view class="mark-all" @click="readAll"> 全部已读 </view>
      </view>
    </view>
    <!-- 系统通知列表 -->
    <view class="message-list">
      <view
        class="message-item"
        :key="notification.id"
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
    </view>
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

console.log("用户ID:", userStore.userId);

// 系统通知列表
const notifications = ref();

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

const read = (ids: string[]) => {
  // 标记消息为已读的逻辑
  markNotificationsRead(userStore.userId, ids).then(() => {
    uni.showToast({
      title: " 已读成功",
      icon: "success",
    });
    // 刷新通知列表
    getNotifications(userStore.userId).then((res) => {
      notifications.value = res.data.notifications;
    });
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
    getNotifications(userStore.userId).then((res) => {
      notifications.value = res.data.notifications;
    });
  });
};

const goBack = () => {
  // 返回上一页的逻辑
  uni.navigateBack();
};

onMounted(() => {
  getNotifications(userStore.userId).then((res) => {
    notifications.value = res.data.notifications;
  });
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
</style>
