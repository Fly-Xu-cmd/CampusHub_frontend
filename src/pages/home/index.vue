<template>
  <CommonLayout
    headerType="home"
    contentBg="$background-color"
    :showTabBar="true"
    padding="0 8rpx"
    :enableScroll="false"
  >
    <scroll-view class="content" :scroll-top="scrollTop" @scrolltolower="handleScrollToLower" scroll-y
      :scroll-with-animation="true"
      refresher-enabled="true"
      :refresher-threshold="50"
      refresher-default-style="none"
      refresher-background="#f8f8f8" 
      :refresher-triggered="Refresher === 'isRefreshing'"
      @refresherpulling="Refresher = 'isPulling'"
      @refresherrefresh="onRefresh"
      @scroll="handleScroll">
      <!-- 自定义下拉刷新插槽 -->
      <template #refresher>
        <view class="custom-refresher">
          <view v-if="Refresher === 'isPulling'" class="refresher-content" >
            <view class="refresher-icon">
              <wd-icon name="refresh" size="40rpx" color="#666666" />
            </view>
            <text class="refresher-text">
              {{ '下拉刷新' }}
            </text>
          </view>
          <view v-else class="refresher-content" >
            <view class="refresher-icon">
              <wd-icon 
              :name="Refresher === 'isRefreshing' ? 'refresh' : 'check-bold'" size="40rpx" 
              :color="Refresher === 'isRefreshing' ? '#f97316' : '#4ade80'" 
              :class="{ 'spin': Refresher === 'isRefreshing' }" />
            </view>
            <text class="refresher-text">
              {{ Refresher === 'isRefreshing' ? '刷新中...' : '刷新完成' }}
            </text>
          </view>
        </view>
      </template>
      <view class="search-section">
        <view class="search-container">
          <wd-icon
            name="search"
            size="32rpx"
            color="#999999"
            class="search-icon"
          />
          <wd-search
            v-model="searchQuery"
            hide-cancel
            placeholder="搜索活动..."
            placeholder-left
            custom-class="custom-search"
            :class="{ 'search-focused': isSearchFocused }"
            @focus="isSearchFocused = true"
            @blur="isSearchFocused = false"
            @search="search"
          />
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
            key="0"
            class="tag-item"
            :class="{ active: activeTag === 0 }"
            @click="selectTag(0)"
          >
            <wd-icon
              class-prefix="iconfont"
              name="quanbu"
              size="30rpx"
            />
            <text>全部类型</text>
          </view>
          <view
            v-for="tag in tags"
            :key="tag.id"
            class="tag-item"
            :class="{ active: activeTag === tag.id }"
            @click="selectTag(tag.id)"
          >
            <wd-icon
              v-if="tag.icon"
              class-prefix="iconfont"
              :name="tag.icon"
              size="30rpx"
            />
            <text>{{ tag.name }}</text>
          </view>
        </scroll-view>
      </view>
      <!-- 活动列表 -->
      <view class="activity-list">
        <view v-if="loading" class="loading">
          <AsyncLoading text="加载中..." />
        </view>
        <view v-else-if="!activities?.length" class="empty">
          <text>暂无活动</text>
        </view>
        <view v-else>
          <view
            v-for="activity in activities"
            :key="activity.id"
            class="activity-card"
            @click="viewDetail(activity.id)"
          >
            <!-- 活动图片 -->
            <view class="card-image-container">
              <wd-img 
                :src="activity.coverUrl || '默认图'"
                class="card-image" 
                mode="aspectFill" 
              >
                <template #error>
                  <wd-icon 
                    class-prefix="iconfont" 
                    name="morentupian" 
                    size="460rpx"
                    color="#e9e9e9"
                  >
                  </wd-icon>
                </template>
                <template #loading>
                  <AsyncLoading text="加载中..." />
                </template>

              </wd-img>
              <!-- 报名状态 未开始报名，报名中，报名已截止-->
              <view class="registration-status"
                :style="{
                  color: activity.registrationStatus === 1 ? '#4ade80' : 
                         activity.registrationStatus === 2 ? '$primary-color' : 
                         activity.registrationStatus === 3 ? '#666666' : 
                         '#000000'
                }"
              >
                <view 
                  class="iconfont" style="font-size: 25rpx;" 
                  :class="{'iconfont-people': activity.registrationStatus === 1, 'iconfont-remen': activity.registrationStatus === 2}"
                  v-if="!(activity.registrationStatus === 3)"
                />
                <text>{{ activity.registrationStatusText }}</text>
              </view>
              <!-- 人数信息 -->
              <view class="participant-count">
                <text>
                  {{ activity.currentParticipants }}/{{
                    activity.maxParticipants
                  }}人
                </text>
              </view>
            </view>

            <!-- 活动标题 -->
            <text class="activity-title">{{ activity.title }}</text>

            <!-- 活动标签 -->
            <view class="activity-tags">
              <view
                v-for="tag in activity.tags"
                :key="tag.id"
                class="activity-tag"
                :style="{
                  backgroundColor: tag.color  
                }"

              >
                <wd-icon
                  class-prefix="iconfont"
                  :name="tag.icon"
                  size="25rpx"
                />
                <text>{{ tag.name }}</text>
              </view>
            </view>

            <!-- 活动信息 -->
            <view class="activity-info">
              <view class="info-item">
                <wd-icon name="time" size="28rpx" color="#999" />
                <text>{{ formatTime(activity.activityStartTime) }}</text>
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
                <wd-img 
                  :src="activity.organizerAvatar || '默认图'"
                  class="organizer-avatar" 
                  mode="aspectFill" 
                >
                  <template #error>
                    <wd-icon 
                    class-prefix="iconfont" 
                    name="morentouxiang" 
                    size="48rpx"
                    color="#999999"
                    >
                    </wd-icon>
                  </template>

                </wd-img>
                <text>{{ activity.organizerName || '默认昵称' }}</text>
              </view>
              <view class="action-button">
                <text>查看详情</text>
                <wd-icon
                  name="arrow-right1"
                  size="28rpx"
                  style="font-weight: 600"
                />
              </view>
            </view>
          </view>
          <wd-loadmore :state="state" @reload="loadMore" 
          finished-text="暂无更多活动" />
        </view>
      </view>
    </scroll-view>
    
    <!-- 回到顶部按钮 -->
    <view v-if="showBackTop" class="back-to-top" @click="scrollToTop">
      <wd-icon name="arrow-up" size="40rpx" color="#fff" />
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getActivityCategoryList, getActivityList, searchActivity } from '@/api/home/router';

// 回到顶部相关
const scrollTop = ref(0);
const showBackTop = ref(false);

// 时间格式化函数：将10位时间戳转换为"周五 19:00"格式
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000); // 转换为毫秒
  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const weekDay = weekDays[date.getDay()];
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${weekDay} ${hours}:${minutes}`;
};

onMounted(async () => {
  // 获取活动分类列表
  await getCategories();

  // 获取活动列表
  getActivities();
});

const tags = ref(); // 活动分类列表
// 获取活动分类列表
const getCategories = async () => {
  const {
    data: { list: Categories },
  } = await getActivityCategoryList();
  tags.value = Categories;
};

const activeTag = ref<number>(0); // 当前选中的标签
// 选择标签
const selectTag = (tagId: number) => {
  activeTag.value = tagId;
  getActivities();
};

const loading = ref<boolean>(false);
const activities = ref(); // 活动列表
const pagination = ref(); // 分页信息

// 获取活动列表
const getActivities = async () => {
  loading.value = true;
  const { data } = await getActivityList({
    page: 1,
    pageSize: 10,
    categoryId: activeTag.value,
    status: -1,
  });
  loading.value = false;
  activities.value = data.list;
  pagination.value = data.pagination;
  state.value = 'loading';
  isSearch.value = false;
};
const isSearch = ref(false); // 是否搜索
const searchQuery = ref(''); // 搜索框的值
const isSearchFocused = ref(false); // 搜索框是否聚焦
// 搜索活动
const search = async () => {
  const keyword = searchQuery.value.trim()
  if (!keyword) {
    // 非空判断
    return
  }
  loading.value = true;
  const { data } = await searchActivity({
    keyword: keyword,
    page: 1,
    pageSize: 50,
  });
  loading.value = false;
  activities.value = data.list;
  isSearch.value = true;
};

const Refresher = ref<string>("isEnd")
// 下拉刷新
const onRefresh = async () => {
  Refresher.value = "isRefreshing";
  await getActivities();
  Refresher.value = "isEnd";
}

// 上拉加载更多
const handleScrollToLower = () => {
  if (isSearch.value) {
    state.value = 'finished';
    return;
  }
  if (state.value === 'finished') {
    return;
  }
  loadMore();
}

const state = ref('loading'); // 加载状态
// 加载更多数据
const loadMore = async () => {
  try {
    const { data } = await getActivityList({
      page: pagination.value.page + 1,
      pageSize: 10,
      categoryId: activeTag.value,
      status: -1,
    });
    const list = data.list;
    pagination.value = data.pagination;
    const total = pagination.value.total
    if (activities.value.length < total) {
      activities.value = [...activities.value, ...list];
    } else {
      state.value = 'finished';
    }
  } catch (error) {
    state.value = 'error';
  }
}

const viewDetail = (activityId: number) => {
  uni.navigateTo({
    url: `/pages/home/detail?id=${activityId}`,
  });
};

// 滚动事件处理
const handleScroll = (event: any) => {
  // 当滚动距离超过300rpx时显示回到顶部按钮
  showBackTop.value = event.detail.scrollTop > 300;
};

// 回到顶部
const scrollToTop = () => {
  // 重置scrollTop值为0，触发滚动到顶部
  scrollTop.value = 0;
  // 延迟重置scrollTop，以便下次滚动时能正常工作
  setTimeout(() => {
    scrollTop.value = -1;
  }, 100);
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
  height: 82vh;

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
        border: 2rpx solid $border-color;
        border-radius: 32rpx;
        height: 100rpx;
        padding-left: 80rpx !important;
        transition: all 0.2s ease;
        box-shadow: $shadow-sm;
      }
    }
    .search-focused {
      :deep(.wd-search__input) {
        border-color: $primary-color !important;
        box-shadow: 0 4rpx 16rpx rgba(249, 115, 22, 0.3) !important;
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
  ::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
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
  box-shadow: 0 8rpx 10rpx 10rpx rgba(249, 115, 22, 0.05);
  background-color: $surface-color;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
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
  height: 400rpx;

  .card-image {
    width: 100%;
    height: 100%;
    text-align: center;
    overflow: hidden;
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
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
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
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
  }
}

/* 活动标题 */
.activity-title {
  display: block;
  font-size: 40rpx;
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
    color: #fff;
    
  }
}

/* 活动信息 */
.activity-info {
  @include flex(row, flex-start, center);
  margin-left: 20rpx;
  margin-right: 20rpx;
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
    min-width: 30%;
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
      overflow: hidden;
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

/* 自定义下拉刷新样式 */
.custom-refresher {
  width: 100%;
  height: 120rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f8f8;
}

.refresher-content {
  @include flex(row, center, center);
  gap: 16rpx;
  padding: 20rpx;
  border-radius: $border-radius-full;
  background-color: rgba(255, 255, 255, 1);
  box-shadow: $shadow-md;
  transition: all 0.3s ease;

}


.refresher-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.refresher-icon .spin {
  animation: spin 0.5s linear infinite;
}

.refresher-text {
  font-size: 28rpx;
  font-weight: $font-weight-medium;
  color: $text-primary;
  transition: all 0.3s ease;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 回到顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 180rpx;
  right: 30rpx;
  width: 90rpx;
  height: 90rpx;
  background-color: rgba(249, 115, 22,0.9);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: $shadow-md;
  z-index: 999;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.9);
    box-shadow: $shadow-sm;
  }
}
</style>
