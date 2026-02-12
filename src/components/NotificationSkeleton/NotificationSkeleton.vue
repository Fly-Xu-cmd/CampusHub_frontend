<template>
  <view class="notification-list-skeleton">
    <view v-for="i in count" :key="i" class="skeleton-item">
      <view class="skeleton-header">
        <view class="skeleton-title" />
        <view class="skeleton-time" />
        <view class="skeleton-dot" />
      </view>
      <view class="skeleton-content" />
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  count?: number;
}

withDefaults(defineProps<Props>(), {
  count: 6,
});
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.notification-list-skeleton {
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
}

.skeleton-header {
  position: relative;
  @include flex(row, space-between, center);
  margin-bottom: 12rpx;
}

.skeleton-title {
  width: 200rpx;
  height: 32rpx;
  background: #e5e7eb;
  border-radius: 8rpx;
  animation: pulse 1.5s infinite;
}

.skeleton-time {
  width: 120rpx;
  height: 24rpx;
  background: #e5e7eb;
  border-radius: 8rpx;
  animation: pulse 1.5s infinite;
}

.skeleton-dot {
  position: absolute;
  right: -10rpx;
  top: -10rpx;
  width: 8px;
  height: 8px;
  background: #e5e7eb;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.skeleton-content {
  width: 100%;
  height: 32rpx;
  background: #e5e7eb;
  border-radius: 8rpx;
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
