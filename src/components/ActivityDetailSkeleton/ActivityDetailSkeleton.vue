<template>
  <view class="activity-detail-skeleton">
    <!-- 活动图片 - 固定背景 -->
    <view class="activity-image-container">
      <view class="skeleton-image"></view>
    </view>
    
    <!-- 活动内容 -->
    <view class="activity-content">
      <!-- 报名状态标签 - 相对于活动内容定位 -->
      <view class="skeleton-status-tag"></view>
      <!-- 活动标题 - 相对于活动内容定位 -->
      <view class="skeleton-title"></view>
      
      <!-- 发起人信息 -->
      <view class="organizer-info">
        <view class="skeleton-avatar"></view>
        <view class="organizer-text">
          <view class="skeleton-organizer-name"></view>
          <view class="skeleton-organizer-detail"></view>
        </view>
        <view class="skeleton-arrow"></view>
      </view>
      
      <!-- 活动开始、截止时间和地点信息 -->
      <view class="info-cards">
        <view class="info-card time-card">
          <view class="skeleton-info-label"></view>
          <view class="skeleton-info-time">
            <view class="skeleton-info-value"></view>
            <view class="skeleton-info-to"></view>
            <view class="skeleton-info-value"></view>
          </view>
        </view>
        <view class="info-card location-card">
          <view class="skeleton-info-label"></view>
          <view class="skeleton-info-value"></view>
        </view>
      </view>
      
      <!-- 活动详情 -->
      <view class="activity-details">
        <view class="details-header">
          <view class="skeleton-details-title"></view>
        </view>
        <view class="details-content">
          <view class="skeleton-details-text"></view>
          <view class="skeleton-details-text"></view>
          <view class="skeleton-details-text"></view>
        </view>
      </view>
    </view>
    
    <!-- 底部报名按钮 -->
    <view class="bottom-button">
      <!-- 1 报名按钮 -->
      <view class="button-row">
        <view class="skeleton-register-button"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 活动详情页骨架屏组件
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.activity-detail-skeleton {
  width: 100%;
  min-height: 100vh;
}

/* 活动图片 - 固定背景 */
.activity-image-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 600rpx;
  z-index: 1;
  
  .skeleton-image {
    width: 100%;
    height: 100%;
    background: #e5e7eb;
    animation: pulse 1.5s infinite;
  }
}

/* 活动内容 */
.activity-content {
  position: relative;
  top: 550rpx;
  z-index: 2;
  padding: $spacing-md;
  background-color: $surface-color;
  border-top-left-radius: 50rpx;
  border-top-right-radius: 50rpx;
  box-shadow: 0 -6rpx 18rpx rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 550rpx);
  
  /* 报名状态标签 - 相对于活动内容定位 */
  .skeleton-status-tag {
    position: absolute;
    top: -160rpx;
    left: $spacing-md;
    width: 120rpx;
    height: 44rpx;
    background: #e5e7eb;
    border-radius: $border-radius-md;
    animation: pulse 1.5s infinite;
    z-index: 3;
  }
  
  /* 活动标题 - 相对于活动内容定位 */
  .skeleton-title {
    position: absolute;
    top: -100rpx;
    left: $spacing-md;
    right: $spacing-md;
    width: 80%;
    height: 56rpx;
    background: #e5e7eb;
    border-radius: 8rpx;
    animation: pulse 1.5s infinite;
    z-index: 3;
  }
}

/* 发起人信息 */
.organizer-info {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-lg;
  padding: $spacing-md;
  background-color: $background-color;
  border-radius: $border-radius-xl;
  
  .skeleton-avatar {
    width: 70rpx;
    height: 70rpx;
    border-radius: 50%;
    margin-right: $spacing-sm;
    background: #e5e7eb;
    animation: pulse 1.5s infinite;
  }
  
  .organizer-text {
    flex: 1;
    @include flex(column, center, flex-start);
    margin-left: 10rpx;
    gap: 10rpx;
    
    .skeleton-organizer-name {
      width: 150rpx;
      height: 32rpx;
      background: #e5e7eb;
      border-radius: 8rpx;
      animation: pulse 1.5s infinite;
    }
    
    .skeleton-organizer-detail {
      width: 200rpx;
      height: 24rpx;
      background: #e5e7eb;
      border-radius: 8rpx;
      animation: pulse 1.5s infinite;
    }
  }
  
  .skeleton-arrow {
    width: 35rpx;
    height: 35rpx;
    background: #e5e7eb;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  }
}

/* 时间和地点信息 */
.info-cards {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;
  
  .info-card {
    flex: 1;
    padding: $spacing-md;
    border-radius: $border-radius-xl;
    
    .skeleton-info-label {
      width: 100rpx;
      height: 24rpx;
      background: #e5e7eb;
      border-radius: 8rpx;
      margin-bottom: 10rpx;
      animation: pulse 1.5s infinite;
    }
    
    .skeleton-info-time {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      
      .skeleton-info-value {
        width: 100%;
        height: 32rpx;
        background: #e5e7eb;
        border-radius: 8rpx;
        animation: pulse 1.5s infinite;
      }
      
      .skeleton-info-to {
        width: 30rpx;
        height: 24rpx;
        background: #e5e7eb;
        border-radius: 8rpx;
        animation: pulse 1.5s infinite;
      }
    }
    
    .skeleton-info-value {
      width: 100%;
      height: 32rpx;
      background: #e5e7eb;
      border-radius: 8rpx;
      animation: pulse 1.5s infinite;
    }
  }
  
  .time-card {
    background-color: #fffbf6;
    border: 1rpx solid #fff4e5;
  }
  
  .location-card {
    background-color: #f7faff;
    border: 1rpx solid #e9f1fe;
  }
}

/* 活动详情 */
.activity-details {
  padding-bottom: 150rpx;
  
  .details-header {
    margin-bottom: $spacing-md;
    
    .skeleton-details-title {
      width: 200rpx;
      height: 44rpx;
      background: #e5e7eb;
      border-radius: 8rpx;
      animation: pulse 1.5s infinite;
    }
  }
  
  .details-content {
    margin-bottom: $spacing-sm;
    padding: 0 $spacing-sm;
    gap: 15rpx;
    @include flex(column, flex-start, flex-start);
    
    .skeleton-details-text {
      width: 100%;
      height: 28rpx;
      background: #e5e7eb;
      border-radius: 8rpx;
      animation: pulse 1.5s infinite;
    }
    
    .skeleton-details-text:nth-child(2) {
      width: 80%;
    }
    
    .skeleton-details-text:nth-child(3) {
      width: 90%;
    }
  }
}

/* 底部报名按钮 */
.bottom-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $z-index-fixed;
  padding: 0 $spacing-md $spacing-xl;
  box-shadow: $shadow-md;

  .button-row {
    @include flex(row, flex-start, center);
    gap: $spacing-md;

    .skeleton-register-button {
      flex: 1;
      height: 100rpx;
      background: #e5e7eb;
      border-radius: 45rpx;
      animation: pulse 1.5s infinite;
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