<template>
  <CommonLayout headerType="standard" title="系统消息" padding="0 0">
    <!-- 系统通知列表 -->
    <view class="message-list">
      <view class="message-item" v-for="notification in notifications">   
          <view class="message-header">
            <view class="message-title">{{ notification.title }}</view>
            <view class="message-time">{{ notification.created_at }}</view>
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

// 系统通知列表
const notifications = ref()

onMounted(() => {
  getNotifications().then(res => {
    notifications.value = res.data.notifications
  })
})
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