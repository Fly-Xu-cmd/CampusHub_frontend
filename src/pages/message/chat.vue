<template>
  <CommonLayout headerType="none" padding="0 0">
    <!-- 顶部导航栏 -->
    <view class="chat-header">
      <view class="header-left" @click="goBack">
        <wd-icon name="arrow-left1" size="48rpx" color="#1e293b"></wd-icon>
      </view>
      <view class="header-center">
        <view class="group-name">周五羽毛球核心群(14)</view>
      </view>
      <view class="header-right" @click="viewChatDetail">
        <view class="more-icon">⋯</view>
      </view>
    </view>

    <!-- 聊天消息区域 -->
    <scroll-view class="chat-content" scroll-y>
      <!-- 消息时间 -->
      <view class="message-time">
        <view class="time-text">14:20</view>
      </view>

      <!-- 他人消息 -->
      <view class="message-item others">
        <view class="message-avatar">
          <image src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=100&h=100&fit=crop&crop=face" mode="aspectFill"></image>
        </view>
        <view class="message-bubble others">
          <view class="message-text">大家到了吗？</view>
        </view>
      </view>

      <!-- 自己消息 -->
      <view class="message-item mine">
        <view class="message-avatar">
          <image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face" mode="aspectFill"></image>
        </view>
        <view class="message-bubble mine">
          <view class="message-text">马上到！</view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入区域 -->
    <view class="chat-input">
      <view class="input-container">
        <input type="text" placeholder="发送消息..." class="message-input" />
      </view>
      <view class="send-button" @click="sendMessage">
        <view class="send-text">发送</view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 模拟消息数据
const messages = ref([
  {
    id: 1,
    sender: 'other',
    content: '大家到了吗？',
    time: '14:20',
    avatar: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 2,
    sender: 'me',
    content: '马上到！',
    time: '14:20',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
  }
]);

// 查看群聊详情
const viewChatDetail = () => {
  uni.navigateTo({
    url: '/pages/message/ChatDetail'
  });
};

// 发送消息
const sendMessage = () => {
  // 后续实现WebSocket发送逻辑
  console.log('发送消息');
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

/* 顶部导航栏 */
.chat-header {
  @include flex(row, space-between, center);
  padding: $spacing-lg;
  background-color: $surface-color;
  border-bottom: 1rpx solid $border-color;
  height: 120rpx;
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;

  .header-left {
    width: 80rpx;
  }

  .header-center {
    flex: 1;
    text-align: center;

    .group-name {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  .header-right {
    width: 80rpx;
    display: flex;
    justify-content: flex-end;

    .more-icon {
      font-size: $font-size-xl;
      color: $text-primary;
    }
  }
}

/* 聊天消息区域 */
.chat-content {
  flex: 1;
  padding: $spacing-md;
  background-color: $background-color;
  min-height: calc(100vh - 120rpx - 240rpx);

  /* 消息时间 */
  .message-time {
    @include flex(row, center, flex-start);
    margin-bottom: $spacing-md;

    .time-text {
      font-size: $font-size-xs;
      color: $text-tertiary;
      background-color: rgba(0, 0, 0, 0.05);
      padding: $spacing-xs $spacing-sm;
      border-radius: $border-radius-full;
    }
  }

  /* 消息项 */
  .message-item {
    @include flex(row, flex-start, flex-start);
    margin-bottom: $spacing-md;

    /* 他人消息 */
    &.others {
      align-items: flex-start;

      .message-avatar {
        margin-right: $spacing-sm;

        image {
          width: 64rpx;
          height: 64rpx;
          border-radius: $border-radius-full;
        }
      }

      .message-bubble {
        background-color: $surface-color;
        border-radius: $border-radius-lg;
        border-top-left-radius: 0;
        padding: $spacing-sm;
        box-shadow: $shadow-sm;
        max-width: 70%;

        .message-text {
          font-size: $font-size-sm;
          color: $text-primary;
          line-height: 1.4;
        }
      }
    }

    /* 自己消息 */
    &.mine {
      @include flex(row-reverse, flex-start, flex-start);

      .message-avatar {
        margin-left: $spacing-sm;

        image {
          width: 64rpx;
          height: 64rpx;
          border-radius: $border-radius-full;
        }
      }

      .message-bubble {
        background-color: $primary-color;
        border-radius: $border-radius-lg;
        border-top-right-radius: 0;
        padding: $spacing-sm;
        box-shadow: $shadow-sm;
        max-width: 70%;

        .message-text {
          font-size: $font-size-sm;
          color: $text-light;
          line-height: 1.4;
        }
      }
    }
  }
}

/* 底部输入区域 */
.chat-input {
  @include flex(row, flex-start, center);
  padding: $spacing-md;
  background-color: $surface-color;
  border-top: 1rpx solid $border-light;
  height: 150rpx;

  .input-container {
    flex: 1;
    margin-right: $spacing-sm;

    .message-input {
      width: 100%;
      height: 80rpx;
      padding: 0 $spacing-sm;
      background-color: $background-color;
      border: 1rpx solid $border-color;
      border-radius: $border-radius-full;
      font-size: $font-size-sm;
      color: $text-primary;
    }
  }

  .send-button {
    @include flex(row, center, center);
    background-color: $primary-color;
    border-radius: $border-radius-full;
    padding: $spacing-xs $spacing-lg;
    height: 80rpx;

    .send-text {
      font-size: $font-size-xs;
      font-weight: $font-weight-semibold;
      color: $text-light;
    }
  }
}
</style>