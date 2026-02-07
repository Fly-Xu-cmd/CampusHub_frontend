<template>
  <CommonLayout headerType="transparent" padding="0 0">
    
    <!-- 活动图片 -->
    <view class="activity-image-container">
      <image class="activity-image" 
        :src="activityDetail.coverUrl" 
        mode="aspectFill" />
      <!-- 报名状态标签 -->
      <view class="status-tag">
        <text class="status-text">{{ activityDetail.statusText }}</text>
      </view>
      <!-- 活动标题 -->
      <view class="activity-title">
        <text>{{ activityDetail.title }}</text>
      </view>
    </view>
    
    <!-- 活动内容 -->
    <view class="activity-content">
      
      <!-- 发起人信息 -->
      <view class="organizer-info" @click="viewPubilcProfil(activityDetail.organizerId)">
        <image class="organizer-avatar" 
          :src="activityDetail.organizerAvatar" />
        <view class="organizer-text">
          <text class="organizer-name">{{ activityDetail.organizerName }}</text>
          <text class="organizer-detail">点击查看发起人详情</text>
        </view>
        <wd-icon name="arrow-right" size="35rpx" color="#999" />
      </view>
      
      <!-- 时间和地点信息 -->
      <view class="info-cards">
        <view class="info-card time-card">
          <text class="info-label">TIME</text>
          <text class="info-value">{{ activityDetail.activityStartTime }}</text>
        </view>
        <view class="info-card location-card">
          <text class="info-label">LOCATION</text>
          <text class="info-value">{{ activityDetail.addressDetail }}</text>
        </view>
      </view>
      
      <!-- 活动详情 -->
      <view class="activity-details">
        <view class="details-header">
          <text class="details-title">活动详情</text>
        </view>
        <view class="details-content">
          <text class="details-text">{{ activityDetail.content }}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部报名按钮 -->
    <view class="bottom-button">
      <button v-if="!isSigned" class="register-button" @click="sign">
        <text class="register-text">立即报名</text>
      </button>
      <button v-else class="register-button cancel" @click="unSign">
        <text class="register-text">取消报名</text>
      </button>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { getActivityDetail, signActivity, cancelSign, getWaitList } from "@/api/home/router";
import { onMounted, ref } from "vue";
import { useRoute } from 'vue-router'
// 获取传入的活动ID参数
const route = useRoute()
const activityId = route.query.id
console.log(activityId)
// 活动详情数据
const activityDetail = ref()

onMounted(() => {
  getActivityDetail(String(activityId)).then(res => {
    activityDetail.value = res.data.activity
  })

  WaitList()
})

// 记录是否报名
const isSigned = ref(false)
const WaitList = async() => {
  const { data: { items } } = await getWaitList({
    type: "待参加",
  })
  // 检查是否报名
  isSigned.value = items?.some(item => item.id == Number(activityId))
}

// 报名活动
const sign = () => {
  signActivity(Number(activityId)).then(res => {
    if (res.data.result == "success") {
      uni.showToast({
        title: "报名成功",
        icon: "success",
      })
      isSigned.value = true
    }else {
      uni.showToast({
        title: res.data.reason,
        icon: "error",
      })
    }
  })
}

// 取消报名
const unSign = () => {
  cancelSign(Number(activityId)).then(res => {
    if (res.data.result == "success") {
      uni.showToast({
        title: "取消报名成功",
        icon: "success",
      })
      isSigned.value = false
    }else {
      uni.showToast({
        title: "取消报名失败",
        icon: "error",
      })
    }
  })
}

const viewPubilcProfil = (id: number) => {
  uni.navigateTo({
    url: `/pages/home/PublicProfile?id=${id}`
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
    &.cancel {
      background-color: #e74c3c;
    }
  }
}
</style>