<template>
  <CommonLayout headerType="home" contentBg="$background-color" :showTabBar="true">
    <view class="content">
      <view class="search-section">
        <view class="search-container">
          <wd-icon name="search" size="32rpx" color="#999999" class="search-icon" />
          <wd-search hide-cancel placeholder="搜索活动..." placeholder-left custom-class="custom-search" />
        </view>
      </view>

      <!-- 推荐活动标题 -->
      <view class="recommend-header">
        <text class="recommend-title">推荐活动</text>
        <view class="recommend-line"></view>
      </view>
      
      
      <!-- 标签行 -->
      <view class="tag-row">
        <scroll-view scroll-x class="tag-scroll" show-scrollbar="false">
          <view 
            v-for="tag in tags" 
            :key="tag.id" 
            class="tag-item"
            :class="{ active: activeTag === tag.id }"
            @click="selectTag(tag.id)"
          >
            <view v-if="tag.icon" class="iconfont" :class="tag.icon" style="font-size: 30rpx;" />
            <text>{{ tag.name }}</text>
          </view>
        </scroll-view>
      </view>
      
      <!-- 活动列表 -->
      <view class="activity-list">
        <view v-if="loading" class="loading">
          <wd-loading size="100rpx" color="#f97316"/>
        </view>
        <!-- <view v-else-if="activities.length === 0" class="empty">
          <text>暂无活动</text>
        </view> -->
        <view v-else>
          <view 
            v-for="activity in activities" 
            :key="activity.id" 
            class="activity-card"
            @click="viewDetail(activity.id)"
          >
            <!-- 活动图片 -->
            <view class="card-image-container">
              <image :src="activity.image" class="card-image" mode="aspectFill" />
              <!-- 报名状态 -->
              <view class="registration-status">
                <view class="iconfont iconfont-remen" style="font-size: 25rpx;" />
                <text>{{ activity.status_text }}</text>
              </view>
              <!-- 人数信息 -->
              <view class="participant-count">
                <text>{{ activity.participants }}/{{ activity.maxParticipants }}人</text>
              </view>
            </view>
            
            <!-- 活动标题 -->
            <text class="activity-title">{{ activity.title }}</text>
            
            <!-- 活动标签 -->
            <view class="activity-tags">
              <view 
                v-for="(tag, index) in activity.tags" 
                :key="index" 
                class="activity-tag"
                :class="tag.type"
              >
                <view class="iconfont" :class="tag.icon" style="font-size: 25rpx;" />
                <text>{{ tag.name }}</text>
              </view>
            </view>
            
            <!-- 活动信息 -->
            <view class="activity-info">
              <view class="info-item">
                <wd-icon name="time" size="28rpx" color="#999" />
                <text>{{ activity.time }}</text>
              </view>
              <view class="log"></view>
              <view class="info-item">
                <wd-icon name="location" size="28rpx" color="#999" />
                <text>{{ activity.location }}</text>
              </view>
            </view>
            
            <!-- 底部信息 -->
            <view class="card-footer">
              <view class="organizer">
                <image :src="activity.organizer_avatar" class="organizer-avatar" />
                <text>{{ activity.organizer_name }}</text>
              </view>
              <view class="action-button">
                <text>查看详情</text>
                <wd-icon name="arrow-right1" size="28rpx" style="font-weight: 600;"/>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getActivityCategoryList, getActivityList } from '@/api/home/router';

onMounted(async () => {
  // 获取活动分类列表
  await getCategories();

  // 获取活动列表
  await getActivities();
});

const tags = ref(); // 活动分类列表
// 获取活动分类列表
const getCategories = async () => {
  const { data: { list: Categories } } = await getActivityCategoryList();
  tags.value = Categories.map(item => ({
    id: item.id,
    name: item.name,
    icon: item.icon
  }));
}

const activeTag = ref<number>(0); // 当前选中的标签
// 选择标签
const selectTag = (tagId: number) => {
  activeTag.value = tagId;
};

const activities = ref(); // 活动列表
// 获取活动列表
const getActivities = async () => {
  const { data: { list: Activities } } = await getActivityList();
  activities.value = Activities.map(item => ({
    id: item.id,
    title: item.title,
    image: item.cover_url,
    type: item.cover_type,
    name: item.category_name,
    organizer_name: item.organizer_name,
    organizer_avatar: item.organizer_avatar,
    time: item.activity_start_time,
    location: item.location,
    participants: item.current_participants,
    maxParticipants: item.max_participants,
    status: item.status,
    status_text: item.status_text,
    tags: item.tags,
    
  }));
}

interface ActivityTag {
  name: string;
  type: string;
  icon: string;
}

interface Organizer {
  name: string;
  avatar: string;
}


const loading = ref<boolean>(false);




const viewDetail = (activityId: number) => {
  uni.navigateTo({
    url: `/pages/home/detail`
  });
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

$tag-active-bg: #111;
$tag-active-color: #fff;
$tag-inactive-bg: #fff;
$tag-inactive-color: #111;

.content {
  display: flex;
  flex-direction: column;
  min-height: 80vh;
}

.search-section {
  margin-top: 20rpx;
  padding: 0 $spacing-md;
  .search-container {
    position: relative;
    width: 100%;
    .search-icon {
      position: absolute;
      left: 30rpx;
      top: 50%;
      transform: translateY(-50%);
      z-index: 9999 !important;
    }
    :deep(.custom-search) {
      background: transparent !important;
      padding: 0 !important;
      width: 100%;
      .wd-search__input {
        background: #ffffff !important;
        border: 1rpx solid $border-color;
        box-shadow: $shadow-sm; 
        border-radius: 32rpx;
        height: 100rpx;
        padding-left: 80rpx !important;
      }
    }
  }
}
/* 推荐活动标题 */
.recommend-header {
  padding: 32rpx $spacing-md 0rpx;
  margin-bottom: 50rpx;
  .recommend-title {
    font-size: 50rpx;
    font-weight: $font-weight-bold;
    color: #000;
    margin-bottom: 15rpx;
    padding: 0 $spacing-xs;
    display: block;
  }
  .recommend-line {
    width: 65rpx;
    height: 8rpx;
    background-color: $primary-color;
    border-radius: $border-radius-full;
  }
}

/* 标签行 */
.tag-row {
  padding: 0 $spacing-md 20rpx;
}

.tag-scroll {
  white-space: nowrap;
  height: 100rpx;
}

.tag-item {
  @include flex(row, center, center);
  gap: 16rpx;
  display: inline-flex;
  padding: 18rpx 35rpx;
  margin-right: 20rpx;
  border-radius: $border-radius-full;
  background-color: $tag-inactive-bg;
  font-size: 24rpx;
  color: $tag-inactive-color;
  font-weight: $font-weight-semibold;
  transition: all 0.3s ease;
  border: 1rpx solid transparent;
  box-shadow: $shadow-sm;
  
  &:last-child {
    margin-right: 0;
  }
  
  &.active {
    background-color: $tag-active-bg;
    color: $tag-active-color;
    box-shadow: $shadow-md;
  }
}

/* 活动列表 */
.activity-list {
  flex: 1;
  padding: 0 $spacing-md 20rpx;
}

.loading {
  padding: 100rpx 0;
  text-align: center;
  color: $text-tertiary;
}

.empty {
  padding: 100rpx 0;
  text-align: center;
  color: $text-tertiary;
  font-size: $font-size-sm;
}

/* 活动卡片 */
.activity-card {
  margin-bottom: 50rpx;
  border-radius: $border-radius-xl;
  overflow: hidden;
  box-shadow: 0 10rpx 10rpx 4rpx rgba(249, 115, 22, 0.05);
  background-color: $surface-color;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  padding: 25rpx;
  &:active {
    transform: translateY(2rpx);
    box-shadow: $shadow-sm;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
}

/* 卡片图片容器 */
.card-image-container {
  position: relative;
  height: 360rpx;
  
  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-color: $background-color;
    border-radius: $border-radius-xl;
  }
  
  /* 报名状态 */
  .registration-status {
    @include flex(row, center, center);
    gap: 6rpx;
    position: absolute;
    top: 16rpx;
    left: 16rpx;
    padding: 15rpx 20rpx;
    background-color: #fff;
    border-radius: $border-radius-full;
    font-size: 22rpx;
    color: $primary-color;
    font-weight: $font-weight-semibold;
  }
  
  /* 人数信息 */
  .participant-count {
    position: absolute;
    bottom: 16rpx;
    right: 16rpx;
    padding: 15rpx 20rpx;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: $border-radius-full;
    font-size: 20rpx;
    color: #fff;
  }
}

/* 活动标题 */
.activity-title {
  display: block;
  font-size: 35rpx;
  font-weight: $font-weight-bold;
  color: #000;
  margin: 20rpx;
  margin-top: 35rpx;
  line-height: 1.4;
  @include truncate(2);
}

/* 活动标签 */
.activity-tags {
  @include flex(row, flex-start, center);
  gap: 12rpx;
  padding: 0 20rpx 20rpx;
  
  .activity-tag {
    @include flex(row, center, center);
    gap: 6rpx;
    padding: 8rpx 16rpx;
    border-radius: $border-radius-full;
    font-size: 20rpx;
    font-weight: $font-weight-medium;
    
    &.running {
      background-color: #f8eaea;
      color: $accent-color;
    }
    
    &.hiking {
      background-color: #f0f9ff;
      color: #0ea5e9;
    }
    
    &.night {
      background-color: #f0fdf4;
      color: #22c55e;
    }
    
    &.outdoor {
      background-color: #fefce8;
      color: #eab308;
    }
    
    &.basketball {
      background-color: #fdf2f8;
      color: #ec4899;
    }
    
    &.friendly {
      background-color: #f8fafc;
      color: #64748b;
    }
  }
}

/* 活动信息 */
.activity-info {
  @include flex(row, flex-start, center);
  margin-left: 20rpx;
  margin-bottom: 20rpx;
  padding: 20rpx 20rpx;
  gap: $spacing-md;
  background-color: #f8fafc; 
  border-radius: $border-radius-md;

  .log {
    width: 4rpx;
    height: 22rpx;
    background-color: $text-tertiary;
  }
  .info-item {
    @include flex(row, center, center);
    gap: 10rpx;
    font-size: 22rpx;
    color: $text-secondary;
    
  }
  
}

/* 底部信息 */
.card-footer {
  @include flex(row, space-between, center);
  padding: 20rpx;
  
  .organizer {
    @include flex(row, center, center);
    gap: 12rpx;
    
    .organizer-avatar {
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      background-color: $background-color;
    }
    
    text {
      font-size: 24rpx;
      color: $text-secondary;
      font-weight: $font-weight-medium;
    }
  }
  
  .action-button {
    @include flex(row, center, center);
    gap: 12rpx;
    padding: 20rpx 50rpx;
    background-color: #111;
    color: #fff;
    border-radius: $border-radius-full;
    font-size: 24rpx;
    font-weight: $font-weight-bold;
    box-shadow: $shadow-md;
    
  }
}
</style>
