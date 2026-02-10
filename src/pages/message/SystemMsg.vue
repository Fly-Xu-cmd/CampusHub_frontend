<template>
  <CommonLayout headerType="standard" title="系统消息" padding="0 0">
    <!-- 系统通知列表 -->
    <view class="message-list">
      <view
        class="message-item"
        :key="notification.id"
        v-for="notification in notifications"
      >
        <view class="message-header">
          <view class="message-title">{{ notification.title }}</view>
          <view class="message-time">{{
            formatTime(notification.created_at)
          }}</view>
        </view>
        <view class="message-text">
          {{ notification.content }}
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { getNotifications } from "@/api/message/router";
import { onMounted, ref } from "vue";
import { useUserStore } from "@/store/user";
const userStore = useUserStore(); // 个人信息

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

onMounted(() => {
  getNotifications(userStore.userId).then((res) => {
    notifications.value = res.data.notifications;
  });
});
</script>

<style scoped lang="scss">
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
