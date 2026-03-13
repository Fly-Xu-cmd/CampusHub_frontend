<template>
  <view class="public-profile-skeleton">
    <!-- 用户信息部分 -->
    <view class="user-info-section">
      <view class="skeleton-avatar"></view>
      <view class="skeleton-username"></view>
      <view class="skeleton-bio"></view>
      <view class="tags-row">
        <view class="skeleton-tag"></view>
        <view class="skeleton-tag"></view>
        <view class="skeleton-tag"></view>
      </view>
    </view>

    <!-- 发布的活动 -->
    <view class="activity-section">
      <view class="skeleton-section-title"></view>
      <view class="activity-list">
        <view class="activity-item">
          <view class="skeleton-activity-image"></view>
          <view class="activity-info">
            <view class="skeleton-activity-title"></view>
            <view class="skeleton-activity-time"></view>
          </view>
        </view>
        <view class="activity-item">
          <view class="skeleton-activity-image"></view>
          <view class="activity-info">
            <view class="skeleton-activity-title"></view>
            <view class="skeleton-activity-time"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 参加的活动 -->
    <view class="activity-section">
      <view class="skeleton-section-title"></view>
      <view class="activity-list">
        <view class="activity-item">
          <view class="skeleton-activity-image"></view>
          <view class="activity-info">
            <view class="skeleton-activity-title"></view>
            <view class="skeleton-activity-time"></view>
          </view>
        </view>
        <view class="activity-item">
          <view class="skeleton-activity-image"></view>
          <view class="activity-info">
            <view class="skeleton-activity-title"></view>
            <view class="skeleton-activity-time"></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 公共个人主页骨架屏组件
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.public-profile-skeleton {
  padding: $spacing-md;
  background-color: $background-color;
}

/* 用户信息部分 */
.user-info-section {
  @include flex(column, center, center);
  padding: $spacing-xl 0;
  margin-bottom: $spacing-xl;
  background-color: $surface-color;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-sm;

  .skeleton-avatar {
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    background: #e5e7eb;
    margin-bottom: $spacing-md;
    animation: pulse 1.5s infinite;
  }

  .skeleton-username {
    width: 200rpx;
    height: 40rpx;
    background: #e5e7eb;
    border-radius: 8rpx;
    margin-bottom: $spacing-sm;
    animation: pulse 1.5s infinite;
  }

  .skeleton-bio {
    width: 400rpx;
    height: 28rpx;
    background: #e5e7eb;
    border-radius: 8rpx;
    margin-bottom: $spacing-md;
    animation: pulse 1.5s infinite;
  }

  .tags-row {
    @include flex(row, center, center);
    gap: $spacing-sm;

    .skeleton-tag {
      width: 100rpx;
      height: 40rpx;
      background: #e5e7eb;
      border-radius: $border-radius-full;
      animation: pulse 1.5s infinite;
    }
  }
}

/* 活动部分 */
.activity-section {
  margin-bottom: $spacing-xl;

  .skeleton-section-title {
    width: 200rpx;
    height: 36rpx;
    background: #e5e7eb;
    border-radius: 8rpx;
    margin-bottom: $spacing-md;
    animation: pulse 1.5s infinite;
  }

  .activity-list {
    gap: $spacing-md;

    .activity-item {
      @include flex(row, flex-start, center);
      gap: $spacing-md;
      padding: $spacing-md;
      margin-bottom: $spacing-sm;
      background-color: $surface-color;
      border-radius: $border-radius-xl;
      box-shadow: $shadow-sm;

      .skeleton-activity-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: $border-radius-md;
        background: #e5e7eb;
        animation: pulse 1.5s infinite;
      }

      .activity-info {
        flex: 1;
        @include flex(column, flex-start, flex-start);
        gap: $spacing-xs;

        .skeleton-activity-title {
          width: 100%;
          height: 32rpx;
          background: #e5e7eb;
          border-radius: 8rpx;
          animation: pulse 1.5s infinite;
        }

        .skeleton-activity-time {
          width: 150rpx;
          height: 24rpx;
          background: #e5e7eb;
          border-radius: 8rpx;
          animation: pulse 1.5s infinite;
        }
      }
    }
  }
}

/* 动画效果 */
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