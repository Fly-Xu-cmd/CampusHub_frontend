<template>
  <CommonLayout headerType="title" title="消息" :showTabBar="true">
    <view class="content">

      <view class="nav-title">
        <!-- 系统通知卡片 -->
        <view class="system-notice" @click="viewSystemMsg">
          <view class="notice-icon">
            <wd-icon name="notification" size="45rpx" color="#f97316"></wd-icon>
          </view>
          <view class="notice-content">
            <view class="notice-title">系统通知</view>
            <view class="notice-desc">点击查看最新的活动状态变更</view>
          </view>
          <view class="notice-badge">
            <view class="badge-dot"></view>
          </view>
        </view>
      </view>

      <!-- 消息列表 -->
      <view class="message-list">
        <view class="message-item" v-for="value in 2" @click="viewChat">
          <view class="message-avatar">
            <image src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=100&h=100&fit=crop&crop=face" mode="aspectFill"></image>
            <view class="avatar-badge">9</view>
          </view>
          <view class="message-content">
            <view class="message-header">
              <view class="message-title">周五羽毛球核心群</view>
              <view class="message-time">14:20</view>
            </view>
            <view class="message-text">
              <view class="message-sender">Kevin:</view>
              <view class="message-artical"> 谁带了多余的球拍吗？</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
const viewChat = () => {
  uni.navigateTo({
    url: `/pages/message/chat`
  });
};
const viewSystemMsg = () => {
  uni.navigateTo({
    url: `/pages/message/SystemMsg`
  });
};
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.content {
  background-color: $background-color;
  min-height: calc(100vh - var(--header-height) - var(--tab-bar-height));

  .nav-title {
    padding: $spacing-md;
    background-color: $surface-color;
  }
  // 系统通知卡片
  .system-notice {
    display: flex;
    align-items: center;
    padding: $spacing-md;
    border-radius: $border-radius-lg;
    box-shadow: 0 5rpx 12rpx 3rpx rgba(0, 0, 0, 0.1);
    .notice-icon {
      margin-right: $spacing-md;
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $border-radius-full;
      background-color: rgba(255, 115, 22, 0.1);
    }

    .notice-content {
      flex: 1;

      .notice-title {
        font-size: $font-size-base;
        font-weight: $font-weight-semibold;
        color: $text-primary;
        margin-bottom: $spacing-xs;
      }

      .notice-desc {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }
    }

    .notice-badge {
      .badge-dot {
        width: 16rpx;
        height: 16rpx;
        background-color: $accent-color;
        border-radius: 50%;
      }
    }
  }

  // 消息列表
  .message-list {
    padding: $spacing-sm;
    .message-item {
      display: flex;
      padding: $spacing-sm $spacing-md;
      background-color: $surface-color;
      border-radius: $border-radius-xl;
      box-shadow: 0 5rpx 12rpx 3rpx rgba(0, 0, 0, 0.05);
      margin-bottom: $spacing-md;
      .message-avatar {
        position: relative;
        margin-right: $spacing-sm;

        image {
          width: 112rpx;
          height: 112rpx;
          border-radius: $border-radius-xl;
        }

        .avatar-badge {
          position: absolute;
          top: -8rpx;
          right: -8rpx;
          min-width: 40rpx;
          height: 40rpx;
          padding: 0 12rpx;
          background-color: $accent-color;
          color: $text-light;
          font-size: $font-size-xs;
          font-weight: $font-weight-semibold;
          border-radius: 20rpx;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .message-content {
        flex: 1;
        padding: $spacing-xs;
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
          line-height: 1.4;
          .message-sender {
            color: $text-tertiary;
            margin-right: $spacing-xs;
          }
          .message-artical {
            max-width: 400rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
}
</style>
