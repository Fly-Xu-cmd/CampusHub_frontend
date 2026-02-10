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
          <text class="info-value">{{ formatDate(activityDetail.activityStartTime) }}</text>
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
      <view class="button-row">
        <button
          v-if="!isSigned"
          class="register-button primary"
          @click="sign"
        >
          <text class="register-text">立即报名</text>
        </button>
        <button
          v-else
          class="register-button cancel"
          @click="unSign"
        >
          <text class="register-text">取消报名</text>
        </button>
        <!-- 群聊按钮 -->
        <button
          v-if="isSigned && groupId"
          class="chat-button"
          @click="enterChat"
        >
          <wd-icon name="chat" size="40rpx" color="#fff"></wd-icon>
          <text class="chat-text">群聊</text>
        </button>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { getActivityDetail, signActivity, cancelSign, getWaitList } from "@/api/home/router";
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

// 时间格式化函数：将10位时间戳转换为"10.24 19:00"格式
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000); // 转换为毫秒
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${month}.${day} ${hours}:${minutes}`;
};

// 获取传入的活动ID参数
let activityId = "";
let groupId = ""; // 群聊ID

// 活动详情数据
const activityDetail = ref<any>({});

// 记录是否报名
const isSigned = ref(false);

onLoad((options: any) => {
  activityId = options.id;
  if (activityId) {
    fetchActivityDetail();
    checkSignStatus();
  }
});

// 获取活动详情
const fetchActivityDetail = () => {
  getActivityDetail(String(activityId)).then((res) => {
    activityDetail.value = res.data.activity;
    // 假设活动详情中包含群组ID，或者通过活动ID获取
    // groupId = res.data.group_id;
  });
};

// 检查报名状态
const checkSignStatus = async () => {
  const {
    data: { items },
  } = await getWaitList({
    type: "待参加",
  });
  // 检查是否报名
  isSigned.value = items?.some((item: any) => item.id == Number(activityId));
};

// 报名活动
const sign = () => {
  signActivity(Number(activityId)).then((res) => {
    if (res.data.result == "success") {
      uni.showToast({
        title: "报名成功",
        icon: "success",
      });
      isSigned.value = true;

      // TODO: 报名成功后获取群组ID
      // 如果后端在报名响应中返回了群组ID
      // groupId = res.data.group_id;

      // 延迟后提示进入群聊
      setTimeout(() => {
        if (groupId) {
          enterChat();
        } else {
          uni.showModal({
            title: "提示",
            content: "是否进入活动群聊？",
            success: (modalRes) => {
              if (modalRes.confirm) {
                // TODO: 通过活动ID获取群组ID
                // getGroupByActivityId(activityId).then(res => {
                //   groupId = res.data.group_id;
                //   enterChat();
                // });
              }
            },
          });
        }
      }, 500);
    } else {
      uni.showToast({
        title: res.data.reason,
        icon: "error",
      });
    }
  });
};

// 取消报名
const unSign = () => {
  cancelSign(Number(activityId)).then((res) => {
    if (res.data.result == "success") {
      uni.showToast({
        title: "取消报名成功",
        icon: "success",
      });
      isSigned.value = false;
      groupId = ""; // 取消报名后清空群组ID
    } else {
      uni.showToast({
        title: "取消报名失败",
        icon: "error",
      });
    }
  });
};

// 进入群聊
const enterChat = () => {
  if (!groupId) {
    uni.showToast({
      title: "群聊尚未开通",
      icon: "none",
    });
    return;
  }
  uni.navigateTo({
    url: `/pages/message/chat?group_id=${groupId}`,
  });
};

// 查看发起人详情
const viewPubilcProfil = (id: number) => {
  uni.navigateTo({
    url: `/pages/home/PublicProfile?id=${id}`,
  });
};
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

  .button-row {
    @include flex(row, flex-start, center);
    gap: $spacing-md;

    .register-button {
      flex: 1;
      height: 100rpx;
      background-color: #111;
      color: $text-light;
      border-radius: 45rpx;
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      @include flex(row, center, center);
      justify-content: center;

      &.cancel {
        background-color: #e74c3c;
      }

      &.primary {
        background-color: $primary-color;
      }
    }

    .chat-button {
      width: 200rpx;
      height: 100rpx;
      background-color: $primary-color;
      color: $text-light;
      border-radius: 45rpx;
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      @include flex(row, center, center);
      gap: $spacing-xs;

      .chat-text {
        font-size: 26rpx;
      }
    }
  }
}
</style>