<template>
  <CommonLayout headerType="transparent" padding="0 0">
    <!-- 骨架屏 -->
    <ActivityDetailSkeleton v-if="loading" />

    <!-- 实际内容 -->
    <template v-else>
      <!-- 活动图片 - 固定背景 -->
      <view class="activity-image-container">
        <wd-img
          class="activity-image"
          :src="activityDetail?.coverUrl || '默认图'"
          mode="aspectFill"
        >
          <template #error>
            <wd-icon
              class-prefix="iconfont"
              name="morentupian"
              size="600rpx"
              color="#e9e9e9"
            >
            </wd-icon>
          </template>
          <template #loading>
            <AsyncLoading text="加载中..." />
          </template>
        </wd-img>
      </view>

      <!-- 活动内容 -->
      <view class="activity-content">
        <!-- 报名状态标签 - 相对于活动内容定位 -->
        <view
          class="status-tag"
          :style="{
            backgroundColor:
              activityDetail.registrationStatus === 1
                ? '#4ade80'
                : activityDetail.registrationStatus === 2
                  ? '#f97316'
                  : activityDetail.registrationStatus === 3
                    ? '#666666'
                    : '#000000',
          }"
        >
          <text class="status-text">
            {{ activityDetail?.registrationStatusText || "报名中" }}
          </text>
        </view>
        <!-- 活动标题 - 相对于活动内容定位 -->
        <view class="activity-title">
          {{ activityDetail?.title || "默认标题" }}
          <!-- 这是一段测试标题，用于展示活动标题的样式。 -->
        </view>

        <!-- 发起人信息 -->
        <view
          class="organizer-info"
          @click="viewPubilcProfil(activityDetail.organizerId)"
        >
          <wd-img
            class="organizer-avatar"
            :src="activityDetail?.organizerAvatar || '默认图'"
            mode="aspectFill"
          >
            <template #error>
              <wd-icon
                class-prefix="iconfont"
                name="morentouxiang"
                size="70rpx"
                color="#999999"
              >
              </wd-icon>
            </template>
          </wd-img>
          <view class="organizer-text">
            <text class="organizer-name">
              {{ activityDetail?.organizerName || "默认昵称" }}
            </text>
            <text class="organizer-detail">点击查看发起人详情</text>
          </view>
          <wd-icon name="arrow-right" size="35rpx" color="#999" />
        </view>

        <!-- 活动开始、截止时间和地点信息 -->
        <view class="info-cards">
          <view class="info-card time-card">
            <view class="info-label">
              <wd-icon name="time" size="28rpx" color="#999" /> ACTIVITY-TIME
            </view>
            <view class="info-time">
              <text class="info-value">
                {{ formatDate(activityDetail?.activityStartTime) }}
              </text>
              至
              <text class="info-value">
                {{ formatDate(activityDetail?.activityEndTime) }}
              </text>
            </view>
          </view>
          <view class="info-card location-card">
            <view class="info-label">
              <wd-icon name="location" size="28rpx" color="#999" /> LOCATION
            </view>
            <text class="info-value">{{ activityDetail?.addressDetail || "加载失败" }}</text>
          </view>
        </view>

        <!-- 活动详情 -->
        <view class="activity-details">
          <view class="details-header">
            <text class="details-title">活动详情</text>
          </view>
          <view class="details-content">
            <text v-if="activityDetail?.content" class="details-text">
              {{ activityDetail?.content }}
            </text>
            <view v-else class="empty-content">
              <wd-img
                class="empty-img"
                src="/static/empty-content.png"
                mode="aspectFill"
              />
              <text class="empty-text">暂无内容</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部报名按钮 -->
      <view class="bottom-button">
        <!-- 1 报名按钮 -->
        <view v-if="!isSigned" class="button-row">
          <button v-if="isUser" class="register-button" @click="sign">
            <text class="register-text">活动发起者无法报名</text>
          </button>
          <button
            v-else-if="activityDetail?.registrationStatus === 2"
            class="register-button primary"
            @click="sign"
          >
            <text class="register-text"> 立即报名 </text>
          </button>
          <button v-else class="register-button" @click="sign">
            <text class="register-text">
              {{ activityDetail?.registrationStatusText || "加载失败"}}
            </text>
          </button>
        </view>
        <!-- 2 取消按钮 -->
        <view v-else class="button-row">
          <!-- 取消按钮 -->
          <button class="register-button cancel" @click="unSign">
            <text class="register-text">取消报名</text>
          </button>
          <!-- 群聊按钮 -->
          <button class="chat-button" @click="enterChat">
            <wd-icon name="chat" size="40rpx" color="#fff"></wd-icon>
            <text class="chat-text">群聊</text>
          </button>
        </view>
      </view>
    </template>
  </CommonLayout>
</template>

<script setup lang="ts">
import {
  getActivityDetail,
  signActivity,
  cancelSign,
  getWaitList,
} from "@/api/home/router";
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useUserStore } from "@/store/user";

// 时间格式化函数：将10位时间戳转换为"2026.02.23 19:00"格式
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000); // 转换为毫秒
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 获取传入的活动ID参数
let activityId = "";

// 活动详情数据
const activityDetail = ref<any>({});

// 校验是否为活动发起人
const userStore = useUserStore();
const isUser = ref<boolean>(false);

// 记录是否报名
const isSigned = ref(false);

// 加载状态
const loading = ref(true);

onLoad((options: any) => {
  activityId = options.id;
  if (activityId) {
    fetchActivityDetail();
    checkSignStatus();
  }
});

// 获取活动详情
const fetchActivityDetail = () => {
  getActivityDetail(String(activityId))
    .then((res) => {
      activityDetail.value = res.data.activity;
      isUser.value = userStore.userId == activityDetail.value.organizerId;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};

// 检查报名状态
const checkSignStatus = async () => {
  try {
    const {
      data: { items },
    } = await getWaitList({
      type: "待参加",
    });
    // 检查是否报名
    isSigned.value = items?.some((item: any) => item.id == Number(activityId));
  } catch (error) {
    console.error("检查报名状态失败:", error);
  } finally {
    // 确保即使报名状态检查失败也关闭加载
    if (!loading.value) {
      loading.value = false;
    }
  }
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

      uni.showModal({
        title: "提示",
        content: "是否进入活动群聊？",
        success: (modalRes) => {
          if (modalRes.confirm) {
            enterChat();
          }
        },
      });
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
  uni.navigateTo({
    url: `/pages/message/index`,
  });
};

// 查看发起人详情
const viewPubilcProfil = (id: number) => {
  uni.navigateTo({
    url: `/pages/home/publicProfile?id=${id}`,
  });
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

/* 活动图片 - 固定背景 */
.activity-image-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 600rpx;
  z-index: 1;
  .activity-image {
    width: 100%;
    height: 100%;
    text-align: center;
    object-fit: cover;
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
  .status-tag {
    position: absolute;
    top: -160rpx;
    left: $spacing-md;
    background-color: $primary-color;
    padding: 2rpx 20rpx;
    border-radius: $border-radius-md;
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.3);
    z-index: 3;
    .status-text {
      color: $text-light;
      line-height: 40rpx;
      font-size: 20rpx;
      font-weight: $font-weight-semibold;
    }
  }

  /* 活动标题 - 相对于活动内容定位 */
  .activity-title {
    position: absolute;
    top: -100rpx;
    left: $spacing-md;
    right: $spacing-md;
    z-index: 3;
    
    font-size: 48rpx;
    font-weight: $font-weight-bold;
    color: $text-light;
    line-height: 1.4;
    text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.5);
    max-width: 70%;
    @include truncate(1);
    white-space: nowrap;
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
  .organizer-avatar {
    width: 70rpx;
    height: 70rpx;
    overflow: hidden;
    border-radius: 50%;
    margin-right: $spacing-sm;
  }
  .organizer-text {
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
  margin-bottom: $spacing-sm;
  &:last-child {
    margin-bottom: $spacing-xl;
  }
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
    .info-time {
      display: flex;
      flex-direction: column;
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
    padding: 0 $spacing-sm;
    .details-text {
      font-size: 25rpx;
      color: $text-secondary;
      line-height: 1.4;
    }
    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 300rpx;
      .empty-img {
        width: 100%;
        flex: 1;
        margin: $spacing-md 0;
      }
      .empty-text {
        font-size: 26rpx;
        color: $text-tertiary;
      }
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
      background-color: #666666;
      color: $text-light;
      border-radius: 45rpx;
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      @include flex(row, center, center);
      justify-content: center;

      &.cancel {
        background-color: black;
      }

      &.primary {
        background: linear-gradient(
          135deg,
          $primary-color 0%,
          lighten($primary-color, 10%) 100%
        );
        box-shadow: 0 4rpx 16rpx rgba($primary-color, 0.4);
        transition:
          transform 0.15s ease,
          box-shadow 0.15s ease;

        &:active {
          box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.3);
        }
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
