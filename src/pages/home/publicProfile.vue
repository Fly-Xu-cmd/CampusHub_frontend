<template>
  <CommonLayout headerType="standard" title="用户详情" padding="0 8rpx">
    <view class="profile-container">  
      <!-- 用户信息部分 -->
      <view class="user-info-section">
        <view class="avatar-wrapper">
          <image :src="userInfo?.avatarUrl" class="avatar" mode="aspectFill" />
        </view>
        <text class="username">{{ userInfo?.nickname }}</text>
        <text class="bio">{{ userInfo?.introduction }}</text>
        <view class="tags-row">
          <view 
            v-for="tag in tags" 
            :key="tag.id" 
            class="tag-item"
            :style="{ backgroundColor: tag.tagColor }"
          >
            <text>{{ tag.tagName }}</text>
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
            v-for="activity in publishedActivities" 
            :key="activity.id" 
            class="activity-item"
          >
            <image :src="activity.imageUrl" class="activity-image" mode="aspectFill" />
            <view class="activity-info">
             <text class="activity-title">
                {{ activity.name }}
                {{ '(' + activity.status + ')' }}
              </text>
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
            v-for="activity in joinedActivities" 
            :key="activity.id" 
            class="activity-item"
          >
            <image :src="activity.imageUrl" class="activity-image" mode="aspectFill" />
            <view class="activity-info">
              <text class="activity-title">
                {{ activity.name }}
                {{ '(' + activity.status + ')' }}
              </text>
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
import { getUserHome } from '@/api/home/router'
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'
const route = useRoute()
const userId = route.query.id

onMounted(() => {
  getUserHome(userId as string).then((res) => {
    userInfo.value = res.data.userInfo
    tags.value = res.data.tags
    publishedActivities.value = res.data.publishedActivities.list
    joinedActivities.value = res.data.joinedActivities.list
  })
});
// 用户数据
const userInfo = ref();
// 兴趣标签
const tags = ref();

// 我发布的活动
const publishedActivities = ref();

// 已参加的活动
const joinedActivities = ref();

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
      color: $text-light;
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
      margin-bottom: $spacing-sm;
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
