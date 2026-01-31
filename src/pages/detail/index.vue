<template>
  <view class="detail-page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-button" @click="goBack">
        <wd-icon name="arrow-left" size="28rpx" color="#fff" />
      </view>
    </view>
    
    <!-- 活动图片 -->
    <view class="activity-image-container">
      <image class="activity-image" src="https://picsum.photos/800/600?random=1" mode="aspectFill" />
      <!-- 报名状态标签 -->
      <view class="status-tag">
        <text class="status-text">报名中</text>
      </view>
    </view>
    
    <!-- 活动内容 -->
    <view class="activity-content">
      <!-- 活动标题 -->
      <view class="activity-title">
        <text>奥森公园 5km 荧光夜跑</text>
      </view>
      
      <!-- 发起人信息 -->
      <view class="organizer-info">
        <image class="organizer-avatar" src="https://picsum.photos/50?random=100" />
        <text class="organizer-name">极客跑团</text>
        <text class="organizer-detail">点击查看发起人详情</text>
        <wd-icon name="arrow-right" size="20rpx" color="#999" />
      </view>
      
      <!-- 时间和地点信息 -->
      <view class="info-cards">
        <view class="info-card time-card">
          <text class="info-label">TIME</text>
          <text class="info-value">10.24 19:00</text>
        </view>
        <view class="info-card location-card">
          <text class="info-label">LOCATION</text>
          <text class="info-value">奥森南门</text>
        </view>
      </view>
      
      <!-- 活动详情 -->
      <view class="activity-details">
        <view class="details-header">
          <text class="details-title">活动详情</text>
        </view>
        <view class="details-content">
          <text class="details-text">欢迎参加我们的周五夜跑活动！我们将提供荧光手环和饮用水。跑完后会有30分钟的新手飞盘教学。</text>
        </view>
      </view>
    </view>
    
    <!-- 底部报名按钮 -->
    <view class="bottom-button">
      <button class="register-button">
        <text class="register-text">立即报名</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const goBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.detail-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $surface-color;
}

/* 顶部导航栏 */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  padding-top: 40rpx;
  padding-left: $spacing-md;
  z-index: $z-index-fixed;
  .back-button {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
  }
}

/* 活动图片 */
.activity-image-container {
  position: relative;
  width: 100%;
  height: 500rpx;
  margin-top: -100rpx;
  padding-top: 100rpx;
  .activity-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .status-tag {
    position: absolute;
    bottom: 40rpx;
    left: $spacing-md;
    background-color: $accent-color;
    padding: 12rpx 24rpx;
    border-radius: $border-radius-full;
    .status-text {
      color: $text-light;
      font-size: 24rpx;
      font-weight: $font-weight-semibold;
    }
  }
}

/* 活动内容 */
.activity-content {
  flex: 1;
  padding: $spacing-md;
  padding-bottom: 150rpx;
}

/* 活动标题 */
.activity-title {
  margin-bottom: $spacing-md;
  text {
    font-size: 36rpx;
    font-weight: $font-weight-bold;
    color: $text-primary;
    line-height: 1.4;
  }
}

/* 发起人信息 */
.organizer-info {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-lg;
  padding-bottom: $spacing-md;
  border-bottom: 1rpx solid $border-light;
  .organizer-avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    margin-right: $spacing-sm;
  }
  .organizer-name {
    font-size: 26rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-right: 10rpx;
  }
  .organizer-detail {
    font-size: 22rpx;
    color: $text-tertiary;
    flex: 1;
  }
}

/* 时间和地点信息 */
.info-cards {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-lg;
  .info-card {
    flex: 1;
    padding: $spacing-md;
    border-radius: $border-radius-xl;
    background-color: $background-color;
    .info-label {
      display: block;
      font-size: 20rpx;
      color: $text-tertiary;
      margin-bottom: 10rpx;
    }
    .info-value {
      font-size: 26rpx;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }
}

/* 活动详情 */
.activity-details {
  .details-header {
    margin-bottom: $spacing-sm;
    .details-title {
      font-size: 30rpx;
      font-weight: $font-weight-bold;
      color: $text-primary;
    }
  }
  .details-content {
    .details-text {
      font-size: 24rpx;
      color: $text-secondary;
      line-height: 1.6;
    }
  }
}

/* 底部报名按钮 */
.bottom-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-md;
  background-color: $surface-color;
  box-shadow: $shadow-md;
  .register-button {
    width: 100%;
    height: 90rpx;
    background-color: #111;
    color: $text-light;
    border-radius: 45rpx;
    font-size: 28rpx;
    font-weight: $font-weight-semibold;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>