<template>
  <CommonLayout headerType="standard" title="用户详情">
    <view class="profile-container">
      <!-- 用户信息部分 -->
      <view class="user-info-section">
        <view class="avatar-wrapper">
          <image :src="userInfo.avatar" class="avatar" mode="aspectFill" />
        </view>
        <text class="username">{{ userInfo.username }}</text>
        <text class="bio">{{ userInfo.bio }}</text>
        <view class="tags-row">
          <view 
            v-for="(tag, index) in userInfo.tags" 
            :key="index" 
            class="tag-item"
            :class="tag.type"
          >
            <text>{{ tag.name }}</text>
          </view>
        </view>
      </view>

      <!-- 发布的活动 -->
      <view class="activity-section">
        <view class="section-header">
          <text class="section-title">Ta发布的活动</text>
        </view>
        <view class="activity-list">
          <view 
            v-for="(activity, index) in publishedActivities" 
            :key="index" 
            class="activity-item"
          >
            <image :src="activity.image" class="activity-image" mode="aspectFill" />
            <view class="activity-info">
              <text class="activity-title">{{ activity.title }}</text>
              <text class="activity-time">{{ activity.time }}</text>
            </view>
          </view>
          <view v-if="publishedActivities.length === 0" class="empty-state">
            <text>暂无发布活动</text>
          </view>
        </view>
      </view>

      <!-- 参加的活动 -->
      <view class="activity-section">
        <view class="section-header">
          <text class="section-title">Ta参加的活动</text>
        </view>
        <view class="activity-list">
          <view 
            v-for="(activity, index) in joinedActivities" 
            :key="index" 
            class="activity-item"
          >
            <image :src="activity.image" class="activity-image" mode="aspectFill" />
            <view class="activity-info">
              <text class="activity-title">{{ activity.title }}{{ activity.status ? ' (' + activity.status + ')' : '' }}</text>
              <text class="activity-time">{{ activity.time }}</text>
            </view>
          </view>
          <view v-if="joinedActivities.length === 0" class="empty-state">
            <text>暂无参加活动</text>
          </view>
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 模拟用户数据
const userInfo = ref({
  avatar: 'https://picsum.photos/200/200?random=1',
  username: '极客跑团',
  bio: '热爱运动，专注组织线下夜跑活动。',
  tags: [
    { name: '运动达人', type: 'orange' },
    { name: '组织者', type: 'blue' }
  ]
});

// 模拟发布的活动
const publishedActivities = ref([
  {
    id: 1,
    title: '奥森夜跑',
    time: '10.24 19:00',
    image: 'https://picsum.photos/400/300?random=2'
  }
]);

// 模拟参加的活动
const joinedActivities = ref([
  {
    id: 2,
    title: '读书会',
    time: '10.10',
    status: '已结束',
    image: 'https://picsum.photos/400/300?random=3'
  }
]);

</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.profile-container {
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

  .avatar-wrapper {
    margin-bottom: $spacing-md;
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: $shadow-md;

    .avatar {
      width: 100%;
      height: 100%;
      background-color: $background-color;
    }
  }

  .username {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  .bio {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: $spacing-md;
    text-align: center;
    padding: 0 $spacing-lg;
  }

  .tags-row {
    @include flex(row, center, center);
    gap: $spacing-sm;

    .tag-item {
      padding: 8rpx 24rpx;
      border-radius: $border-radius-full;
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;

      &.orange {
        background-color: #fff7ed;
        color: $primary-color;
      }

      &.blue {
        background-color: #f0f9ff;
        color: #0ea5e9;
      }
    }
  }
}

/* 活动部分 */
.activity-section {
  margin-bottom: $spacing-xl;

  .section-header {
    margin-bottom: $spacing-md;

    .section-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
      color: $text-primary;
    }
  }

  .activity-list {
    gap: $spacing-md;

    .activity-item {
      @include flex(row, flex-start, center);
      gap: $spacing-md;
      padding: $spacing-md;
      background-color: $surface-color;
      border-radius: $border-radius-xl;
      box-shadow: $shadow-sm;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:active {
        transform: translateY(2rpx);
        box-shadow: $shadow-sm;
      }

      .activity-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: $border-radius-md;
        background-color: $background-color;
      }

      .activity-info {
        flex: 1;
        @include flex(column, flex-start, flex-start);
        gap: $spacing-xs;

        .activity-title {
          font-size: $font-size-base;
          font-weight: $font-weight-semibold;
          color: $text-primary;
          @include truncate(1);
        }

        .activity-time {
          font-size: $font-size-xs;
          color: $text-tertiary;
        }
      }
    }

    .empty-state {
      padding: $spacing-xl;
      text-align: center;
      color: $text-tertiary;
      font-size: $font-size-sm;
      background-color: $surface-color;
      border-radius: $border-radius-xl;
    }
  }
}
</style>
