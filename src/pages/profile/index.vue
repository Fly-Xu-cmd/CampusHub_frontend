<template>
  <CommonLayout headerType="none" contentBg="#f6faff" :showTabBar="true">
    <view class="profile-container">
      <view class="header-section">
        <view class="top-bar">
          <view class="avatar-wrapper">
            <image 
              :src="hasAvatar ? userInfo.avatar_url : defaultAvatar" 
              class="avatar-img" 
              mode="aspectFill"
            />
            <view class="avatar-badges">
              <view class="badge-item orange">跑步</view>
              <view class="badge-item green">徒步</view>
            </view>
          </view>
          
          <view class="settings-btn" @click="handleToSettings">
            <wd-icon name="setting" size="20px" color="#64748b"></wd-icon>
          </view>
        </view>

        <view class="user-info">
          <text class="nickname">{{ isAuthenticated ? userInfo.nickname || '默认名' : '请登录' }}</text>
          <text class="bio">{{ isAuthenticated ? userInfo.bio || '' : '请登录查看简介' }}</text>
        </view>

        <view class="tags-row">
          <view class="tag-item orange">
            <wd-icon class-prefix="iconfont" name="running" size="12px" custom-style="margin-right:4rpx"></wd-icon>跑步
          </view>
          <view class="tag-item green">
            <wd-icon class-prefix="iconfont" name="mountain" size="12px" custom-style="margin-right:4rpx"></wd-icon>徒步
          </view>
          <view class="tag-item purple">
            <wd-icon class-prefix="iconfont" name="book" size="12px" custom-style="margin-right:4rpx"></wd-icon>读书
          </view>
        </view>

        <view class="stats-row">
          <view class="stat-item" @click="handleToMyPublished">
            <text class="num">{{ isAuthenticated ? userInfo.published_count || 0 : '?' }}</text>
            <text class="label">发布</text>
          </view>
          <view class="stat-item" @click="handleToJoined">
            <text class="num">{{ isAuthenticated ? userInfo.joined_count || 0 : '?' }}</text>
            <text class="label">参与</text>
          </view>
          <view class="stat-item">
            <text class="num green">{{ isAuthenticated ? userInfo.credit_score || 0 : '?' }}</text>
            <text class="label">信用分</text>
          </view>
        </view>
      </view>

      <view class="content-section">
        
        <view class="status-card">
          <view class="status-item" @click="handleToPending">
            <wd-icon class-prefix="iconfont" name="calendar-check" size="60rpx" color="#f97316" custom-style="margin-bottom:8rpx"></wd-icon>
            <text class="status-label">待参加</text>
          </view>
          <view class="divider-v"></view>
          <view class="status-item" @click="handleToJoined">
            <wd-icon class-prefix="iconfont" name="lishi" size="60rpx" color="#3b82f6" custom-style="margin-bottom:8rpx"></wd-icon>
            <text class="status-label">已参加</text>
          </view>
        </view>

        <view class="menu-list">
          
          <view class="menu-item border-bottom" @click="handleToMyPublished">
            <view class="menu-left">
              <view class="icon-box orange-bg">
                <wd-icon class-prefix="iconfont" name="qizhi-" size="42rpx" color="#f97316"></wd-icon>
              </view>
              <text class="menu-text">我发起的活动</text>
            </view>
            <wd-icon name="arrow-right" size="16px" color="#cbd5e1"></wd-icon>
          </view>

          <view class="menu-item" @click="handleToVerify">
            <view class="menu-left">
              <view class="icon-box blue-bg">
                <wd-icon class-prefix="iconfont" name="graduation-cap" size="36rpx" color="#3b82f6"></wd-icon>
              </view>
              <text class="menu-text">学生认证</text>
            </view>
            <view class="menu-right">
              <view class="status-tag success">已通过</view>
              </view>
          </view>

        </view>

      </view>

    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const {isAuthenticated, hasAvatar, userInfo} = userStore;
const defaultAvatar = '/static/default_avatar.png';

// --- 导航逻辑 ---
const handleToSettings = () => {
  uni.navigateTo({ url: '/pages/settings/index' });
};

const handleToMyPublished = () => {
  uni.navigateTo({ url: '/pages/profile/published' });
};

const handleToPending = () => {
  uni.navigateTo({ url: '/pages/profile/pending' });
};

const handleToJoined = () => {
  uni.navigateTo({ url: '/pages/profile/history' });
};

const handleToVerify = () => {
  uni.navigateTo({ url: '/pages/profile/verify' });
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.profile-container {
  @include flex(column, flex-start, stretch);
  min-height: 100%;
}

/* --- 头部区域 --- */
.header-section {
  background-color: $surface-color; // #ffffff
  padding-bottom: $spacing-xl; // 32rpx
  border-bottom: 1rpx solid $border-light;
  position: relative;
  z-index: 1;

  .top-bar {
    @include flex(row, space-between, flex-start);
    padding: 0 $spacing-lg; // 24px -> 48rpx
    margin-bottom: $spacing-lg;

    .avatar-wrapper {
      position: relative;
      
      .avatar-img {
        width: 180rpx;
        height: 180rpx;
        border-radius: 50%;
        border: 8rpx solid $surface-color; // 白色边框
        box-shadow: $shadow-lg;
      }
      
      .avatar-badges {
        position: absolute;
        bottom: 10rpx;
        right: -$spacing-md;
        @include flex(row, flex-start, center);
        background: $surface-color;
        padding: 4rpx;
        border-radius: $border-radius-full;
        box-shadow: $shadow-sm;
        
        .badge-item {
          font-size: $font-size-xs;
          font-weight: $font-weight-bold;
          padding: 4rpx 10rpx;
          border-radius: 8rpx;
          margin-left: 4rpx;
          
          &:first-child { margin-left: 0; }
          &.orange { background: #fff7ed; color: $primary-color; }
          &.green { background: #f0fdf4; color: $secondary-color; }
        }
      }
    }

    .settings-btn {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      border: 1rpx solid $border-color;
      @include flex(row, center, center);
      margin-top: 20rpx;
    }
  }

  .user-info {
    padding: 0 $spacing-lg;
    margin-bottom: $spacing-md;

    .nickname {
      font-size: 48rpx;
      font-weight: $font-weight-bold;
      color: $text-primary;
      display: block;
      margin-bottom: 8rpx;
    }

    .bio {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }

  .tags-row {
    @include flex(row, flex-start, center);
    padding: 0 $spacing-lg;
    gap: $spacing-sm;
    margin-bottom: 40rpx;

    .tag-item {
      font-size: $font-size-sm;
      font-weight: $font-weight-bold;
      padding: 8rpx 20rpx;
      border-radius: $border-radius-full;
      @include flex(row, center, center);

      &.orange { background: #fff7ed; color: $primary-color; }
      &.green { background: #f0fdf4; color: $secondary-color; }
      &.purple { background: #f5f3ff; color: #7c3aed; }
    }
  }

  .stats-row {
    @include flex(row, flex-start, center);
    padding-top: $spacing-md;
    border-top: 1rpx solid $border-light;
    margin: 0 $spacing-lg;

    .stat-item {
      @include flex(column, center, center);
      margin-right: $spacing-xl;
      .num {
        font-size: $font-size-xl;
        font-weight: $font-weight-bold;
        color: $text-primary;
        line-height: 1.2;
        
        &.green { color: $secondary-color; }
      }
      
      .label {
        font-size: $font-size-sm;
        font-weight: $font-weight-bold;
        color: $text-tertiary;
        margin-top: 4rpx;
      }
    }
  }
}

/* --- 内容区域 --- */
.content-section {
  flex: 1;
  padding: 40rpx $spacing-lg;
  margin-top: -40rpx; // 向上一点，视觉连贯

  .status-card {
    background: $surface-color;
    border-radius: 48rpx;
    padding: $spacing-xl;
    box-shadow: $shadow-md; // 中等阴影
    @include flex(row, space-between, center);
    margin-bottom: $spacing-md;

    .status-item {
      flex: 1;
      @include flex(column, center, center);
      
      .status-label {
        font-size: $font-size-base;
        font-weight: $font-weight-bold;
        color: $text-secondary;
      }
    }

    .divider-v {
      width: 2rpx;
      height: 80rpx;
      background-color: $border-light;
    }
  }

  .menu-list {
    background: $surface-color;
    border-radius: 48rpx;
    padding: 0 $spacing-md;
    border: 1rpx solid $border-light;
    box-shadow: $shadow-sm;

    .menu-item {
      padding: 32rpx 0;
      @include flex(row, space-between, center);
      
      &.border-bottom {
        border-bottom: 1rpx solid $border-light;
      }

      .menu-left {
        @include flex(row, flex-start, center);
        gap: $spacing-md;

        .icon-box {
          width: 72rpx;
          height: 72rpx;
          border-radius: 50%;
          @include flex(row, center, center);
          
          &.orange-bg { background-color: #fff7ed; }
          &.blue-bg { background-color: #eff6ff; }
        }

        .menu-text {
          font-size: $font-size-base;
          font-weight: $font-weight-bold;
          color: $text-secondary;
        }
      }

      .menu-right {
        .status-tag {
          font-size: $font-size-sm;
          font-weight: $font-weight-bold;
          padding: 4rpx 16rpx;
          border-radius: 8rpx;
          
          &.success {
            background-color: #f0fdf4;
            color: $secondary-color;
          }
        }
      }
    }
  }
}
</style>