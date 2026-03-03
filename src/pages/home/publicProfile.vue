<template>
  <CommonLayout headerType="standard" title="用户详情" padding="0 8rpx">
    <!-- 骨架屏 -->
    <PublicProfileSkeleton v-if="loading" />

    <!-- 实际内容 -->
    <view v-else class="profile-container">
      <!-- 用户信息部分 -->
      <view class="user-info-section">
        <view class="avatar-wrapper">
          <wd-img
            :src="userInfo?.avatarUrl || '默认图'"
            class="avatar"
            mode="aspectFill"
          >
            <template #error>
              <wd-icon
                class-prefix="iconfont"
                name="morentouxiang"
                size="200rpx"
                color="#999999"
              >
              </wd-icon>
            </template>
          </wd-img>
        </view>
        <text class="username">{{ userInfo?.nickname || "默认昵称" }}</text>
        <text class="bio">{{ userInfo?.introduction || "默认介绍" }}</text>
        <view class="tags-row">
          <view
            v-for="tag in tags"
            :key="tag.id"
            class="tag-item"
            :style="{ backgroundColor: tag.tagColor }"
          >
            <wd-icon class-prefix="iconfont" :name="tag.tagIcon" size="25rpx" />
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
            <wd-img
              :src="activity.imageUrl || '默认图'"
              class="activity-image"
              mode="aspectFill"
            >
              <template #error>
                <wd-icon
                  class-prefix="iconfont"
                  name="morentupian"
                  size="120rpx"
                  color="#e9e9e9"
                >
                </wd-icon>
              </template>
            </wd-img>
            <view class="activity-info">
              <text class="activity-title">
                {{ activity.name || "默认标题" }}
                {{ "(" + activity.status + ")" }}
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
            <wd-img
              :src="activity.imageUrl || '默认图'"
              class="activity-image"
              mode="aspectFill"
            >
              <template #error>
                <wd-icon
                  class-prefix="iconfont"
                  name="morentupian"
                  size="120rpx"
                  color="#e9e9e9"
                  custom-style="margin-top: 20rpx;"
                ></wd-icon>
              </template>
            </wd-img>
            <view class="activity-info">
              <text class="activity-title">
                {{ activity.name || "默认标题" }}
                {{ "(" + activity.status + ")" }}
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
import { getUserHome } from "@/api/home/router";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const userId = route.query.id;

// 加载状态
const loading = ref(true);

onMounted(() => {
  getUserHome(userId as string)
    .then((res) => {
      userInfo.value = res.data.userInfo;
      tags.value = res.data.tags;
      publishedActivities.value = res.data.publishedActivities.list;
      joinedActivities.value = res.data.joinedActivities.list;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
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
    flex-wrap: wrap;
    padding: 0 $spacing-lg;
    .tag-item {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      padding: 8rpx 20rpx;
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
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;

      &:active {
        transform: translateY(2rpx);
        box-shadow: $shadow-sm;
      }

      .activity-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: $border-radius-md;
        border: 2rpx solid $border-color;
        background-color: $background-color;
        overflow: hidden;
      }

      .activity-info {
        width: 60%;
        @include flex(column, flex-start, flex-start);
        gap: $spacing-xs;

        .activity-title {
          font-size: $font-size-base;
          font-weight: $font-weight-semibold;
          color: $text-primary;
          width: 100%;
          @include truncate(1);
          white-space: nowrap;
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
