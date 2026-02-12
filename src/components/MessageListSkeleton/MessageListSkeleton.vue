<template>
  <view class="message-list-skeleton">
    <view v-for="i in count" :key="i" class="skeleton-item">
      <!-- 头像骨架 -->
      <view class="skeleton-avatar" />

      <!-- 内容骨架 -->
      <view class="skeleton-content">
        <view class="skeleton-title" />
        <view class="skeleton-text" />
        <view class="skeleton-time" />
      </view>

      <!-- 徽章骨架 -->
      <view class="skeleton-badge" />
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  count?: number;
}

withDefaults(defineProps<Props>(), {
  count: 5,
});
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.message-list-skeleton {
  padding: 24rpx 0;
  width: 100%;
  height: auto;
}

.skeleton-item {
  padding: 24rpx 32rpx;
  background: $surface-color;
  border-radius: 24rpx;
  box-shadow: $shadow-sm;
  margin-bottom: 24rpx;
  @include flex(row, flex-start, center);
}

.skeleton-avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: #e5e7eb;
  animation: pulse 1.5s infinite;
}

.skeleton-content {
  flex: 1;
  margin-left: 24rpx;
}

.skeleton-title {
  width: 200rpx;
  height: 32rpx;
  background: #e5e7eb;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
  animation: pulse 1.5s infinite;
}

.skeleton-text {
  width: 100%;
  height: 32rpx;
  background: #e5e7eb;
  border-radius: 8rpx;
  margin-bottom: 8rpx;
  animation: pulse 1.5s infinite;
}

.skeleton-time {
  width: 120rpx;
  height: 24rpx;
  background: #e5e7eb;
  border-radius: 8rpx;
  animation: pulse 1.5s infinite;
}

.skeleton-badge {
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  background: #e5e7eb;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
