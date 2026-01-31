<template>
  <CommonLayout headerType="transparent">
    
    <!-- 活动图片 -->
    <view class="activity-image-container">
      <image class="activity-image" src="https://picsum.photos/800/600?random=1" mode="aspectFill" />
      <!-- 报名状态标签 -->
      <view class="status-tag">
        <text class="status-text">报名中</text>
      </view>
      <!-- 活动标题 -->
      <view class="activity-title">
        <text>奥森公园 5km 荧光夜跑</text>
      </view>
    </view>
    
    <!-- 活动内容 -->
    <view class="activity-content">
      
      <!-- 发起人信息 -->
      <view class="organizer-info" @click="viewPubilcProfil">
        <image class="organizer-avatar" src="https://picsum.photos/50?random=100" />
        <view class="organizer-text">
          <text class="organizer-name">极客跑团</text>
          <text class="organizer-detail">点击查看发起人详情</text>
        </view>
        <wd-icon name="arrow-right" size="35rpx" color="#999" />
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
          <text class="details-text">欢迎参加我们的周五夜跑活动！我们将提供荧光手环和饮用水。跑完后会有30分钟的新手飞盘教学。这是一个非常适合初学者的活动，无论你是跑步新手还是有经验的跑者，都可以参加我们的活动。我们会在活动开始前进行简单的热身运动，确保大家的身体状态良好。活动中会有专业的教练指导，帮助大家掌握正确的跑步姿势和呼吸方法。活动结束后，我们还会组织大家一起聚餐，增进彼此的了解和友谊。</text>
        </view>
      </view>
    </view>
    
    <!-- 底部报名按钮 -->
    <view class="bottom-button">
      <button class="register-button">
        <text class="register-text">立即报名</text>
      </button>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
const viewPubilcProfil = () => {
  uni.navigateTo({
    url: `/pages/home/publicProfil`
  });
}
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;


/* 活动图片 */
.activity-image-container {
  position: relative;
  width: 100%;
  height: 600rpx;
  margin-top: -100rpx;
  .activity-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .status-tag {
    position: absolute;
    bottom: 160rpx;
    left: $spacing-md;
    background-color: $primary-color;
    padding: 2rpx 20rpx;
    border-radius: $border-radius-md;
    .status-text {
      color: $text-light;
      line-height: 40rpx;
      font-size: 20rpx;
      font-weight: $font-weight-semibold;
    }
  }
  /* 活动标题 */
  .activity-title {
    position: absolute;
    left: $spacing-md;
    bottom: 80rpx;
    text {
      font-size: 48rpx;
      font-weight: $font-weight-bold;
      color: $text-light;
      line-height: 1.4;
    }
  }  
}

/* 活动内容 */
.activity-content {
  position: relative;
  top: -55rpx;
  z-index: 666;
  padding: $spacing-md;
  padding-bottom: 150rpx;
  background-color: $surface-color;
  border-top-left-radius: 50rpx;
  border-top-right-radius: 50rpx;
}

/* 发起人信息 */
.organizer-info {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-lg;
  padding: $spacing-md;
  background-color: $background-color;
  border-radius: $border-radius-xl;
  .organizer-avatar {
    width: 70rpx;
    height: 70rpx;
    border-radius: 50%;
    margin-right: $spacing-sm;
  }
  .organizer-text{
    flex: 1;
    @include flex(column, center, flex-start);
    margin-left: 10rpx;
    .organizer-name {
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
    
    .organizer-detail {
      font-size: 22rpx;
      color: $text-tertiary;
    }
  }
}

/* 时间和地点信息 */
.info-cards {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-xl;
  .info-card {
    flex: 1;
    padding: $spacing-md;
    border-radius: $border-radius-xl;
    .info-label {
      display: block;
      font-size: 20rpx;
      font-weight: $font-weight-semibold;
      color: $text-tertiary;
      margin-bottom: 10rpx;
    }
    .info-value {
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      color: $text-primary;
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
    .details-title {
      font-size: 38rpx;
      font-weight: $font-weight-bold;
      color: $text-primary;
    }
  }
  .details-content {
    margin-bottom: $spacing-sm;
    .details-text {
      font-size: 25rpx;
      color: $text-secondary;
      line-height: 1.4;
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

  .register-button {
    width: 100%;
    height: 100rpx;
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