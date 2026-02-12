<template>
  <view class="activity-skeleton-list">
    <view v-for="i in count" :key="i" class="skeleton-item">
      <!-- 封面骨架 -->
      <view class="skeleton-cover" />

      <!-- 信息骨架 -->
      <view class="skeleton-info">
        <view class="skeleton-title" />
        <view class="skeleton-meta" />
        <view class="skeleton-location" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  count?: number;
}

withDefaults(defineProps<Props>(), {
  count: 4,
});
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.activity-skeleton-list {
  padding: 24rpx 0;
  width: 100%;
  height: auto;
}

.skeleton-item {
  background: $surface-color;
  border-radius: 24rpx;
  padding: 24rpx 32rpx;
  box-shadow: $shadow-sm;
  margin-bottom: 24rpx;
  @include flex(row, flex-start, flex-start);
}

.skeleton-cover {
  width: 160rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
  background: #e5e7eb;
  animation: pulse 1.5s infinite;
}

.skeleton-info {
  flex: 1;
  @include flex(column, flex-start, flex-start);
  gap: 12rpx;
}

.skeleton-title {
  width: 200rpx;
  height: 32rpx;
  background: #e5e7eb;
  border-radius: 8rpx;
  animation: pulse 1.5s infinite;
}

.skeleton-meta {
  width: 100%;
  height: 32rpx;
  background: #e5e7eb;
  border-radius: 8rpx;
  animation: pulse 1.5s infinite;
}

.skeleton-location {
  width: 120rpx;
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
