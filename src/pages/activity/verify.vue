<template>
  <CommonLayout
    headerType="standard"
    title="活动核销"
    contentBg="#f6faff"
    padding="0 0"
  >
    <view class="verify-container">
      <!-- 步骤1：搜索活动 -->
      <view v-if="currentStep === 1" class="step-container">
        <view class="search-section">
          <view class="search-box">
            <input
              type="text"
              placeholder="搜索活动名称"
              v-model="searchKeyword"
              class="search-input"
              @confirm="handleSearch"
            />
            <view class="search-btn" @click="handleSearch">
              <wd-icon name="search" size="20px" color="#fff"></wd-icon>
            </view>
          </view>
        </view>

        <!-- 骨架屏 - 搜索时显示 -->
        <view v-if="loading && hasSearched" class="loading-state">
          <ActivityCardSkeleton :count="4" />
        </view>

        <!-- 活动列表 -->
        <view
          v-else-if="searchResults.length > 0 || hasSearched"
          class="activity-list"
        >
          <view
            class="activity-item"
            v-for="activity in searchResults"
            :key="activity.id"
            @click="selectActivity(activity)"
          >
            <image
              :src="activity.coverUrl"
              class="activity-cover"
              mode="aspectFill"
            ></image>
            <view class="activity-info">
              <text class="activity-title">{{ activity.title }}</text>
              <text class="activity-meta">{{
                formatTime(activity.activityStartTime)
              }}</text>
              <text class="activity-location">{{ activity.location }}</text>
            </view>
          </view>

          <!-- 加载更多 -->
          <view class="load-more" v-if="hasMore && !loading" @click="loadMore">
            <text>加载更多</text>
          </view>
          <view class="no-more" v-if="!hasMore && searchResults.length > 0">
            <text>没有更多了</text>
          </view>
        </view>

        <!-- 空状态 -->
        <view
          class="empty-state"
          v-if="hasSearched && searchResults.length === 0 && !loading"
        >
          <wd-icon name="search" size="80rpx" color="#cbd5e1"></wd-icon>
          <text class="empty-text">未找到相关活动</text>
        </view>
      </view>

      <!-- 步骤2：输入核销码 -->
      <view v-if="currentStep === 2" class="step-container">
        <!-- 选中的活动信息 -->
        <view class="selected-activity">
          <view class="activity-header">
            <text class="activity-name">{{ selectedActivity?.title }}</text>
            <view class="change-btn" @click="backToSearch">
              <text>更换</text>
            </view>
          </view>
          <text class="activity-detail">{{
            formatTime(selectedActivity?.activityStartTime)
          }}</text>
          <text class="activity-detail">{{ selectedActivity?.location }}</text>
        </view>

        <!-- 核销表单 -->
        <view class="verify-form">
          <view class="form-item">
            <text class="form-label">核销码</text>
            <input
              type="text"
              placeholder="请输入核销码"
              v-model="verifyForm.ticketCode"
              class="form-input"
            />
          </view>

          <view class="form-item">
            <text class="form-label">TOTP 验证码</text>
            <input
              type="text"
              placeholder="请输入6位TOTP验证码"
              v-model="verifyForm.totpCode"
              class="form-input"
              maxlength="6"
            />
          </view>

          <view class="verify-actions">
            <button class="cancel-btn" @click="backToSearch">取消</button>
            <button
              class="confirm-btn"
              @click="handleVerify"
              :disabled="verifying"
            >
              {{ verifying ? "核销中..." : "确认核销" }}
            </button>
          </view>
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { postVerifyTicket } from "@/api/ticket/router";
import type { List } from "@/types/modules/activity";
import type { Request as VerifyRequest } from "@/types/modules/ticket/post-ticket";
import { getMyCreated } from "@/api/activity/router";

// 当前步骤：1-搜索活动，2-输入核销码
const currentStep = ref(1);
const searchKeyword = ref("");
const searchResults = ref<List[]>([]);
const allActivities = ref<List[]>([]); // 存储所有已加载的活动数据
const selectedActivity = ref<List | null>(null);
const hasSearched = ref(false);
const loading = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);

// 核销表单
const verifyForm = ref<VerifyRequest>({
  activityId: 0,
  ticketCode: "",
  totpCode: "",
});
const verifying = ref(false);

// 从 URL 参数获取扫码结果（微信小程序扫码后传递的核销码）
onLoad((options: any) => {
  if (options?.code) {
    // 有扫码结果，预填充核销码
    verifyForm.value.ticketCode = decodeURIComponent(options.code);
  }
});
// 获取活动列表
const fetchActivities = async (page: number) => {
  try {
    loading.value = true;
    const response = await getMyCreated(page);
    if (response.data) {
      const newList = response.data.list || [];
      if (page === 1) {
        allActivities.value = newList;
        searchResults.value = newList;
        hasSearched.value = true; // 标记已搜索，显示活动列表
      } else {
        allActivities.value.push(...newList);
        searchResults.value.push(...newList);
      }
      hasMore.value = newList.length >= 12;
    }
  } catch (error) {
    console.error("获取我发起的活动失败:", error);
  } finally {
    loading.value = false;
  }
};
// 格式化时间
const formatTime = (timestamp?: number) => {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// 搜索活动（在已加载的活动数据中进行客户端过滤）
const handleSearch = async () => {
  const keyword = searchKeyword.value.trim();
  if (!keyword) {
    uni.showToast({ title: "请输入活动名称", icon: "none" });
    return;
  }

  loading.value = true;

  try {
    // 在客户端进行过滤
    const filtered = allActivities.value.filter((activity) =>
      activity.title.toLowerCase().includes(keyword.toLowerCase()),
    );
    searchResults.value = filtered;
    hasSearched.value = true;

    if (filtered.length === 0) {
      uni.showToast({
        title: "未找到匹配的活动",
        icon: "none",
        duration: 2000,
      });
    }
  } catch (error) {
    console.error("搜索活动失败:", error);
    uni.showToast({ title: "搜索失败", icon: "none" });
    searchResults.value = [];
  } finally {
    loading.value = false;
  }
};

// 加载更多
const loadMore = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  const nextPage = currentPage.value + 1;

  try {
    const response = await getMyCreated(nextPage);
    if (response.data?.list) {
      const newList = response.data.list;
      allActivities.value.push(...newList);

      // 如果当前有搜索关键词，需要对新增数据进行过滤
      if (searchKeyword.value.trim()) {
        const filtered = newList.filter((activity) =>
          activity.title
            .toLowerCase()
            .includes(searchKeyword.value.trim().toLowerCase()),
        );
        searchResults.value.push(...filtered);
      } else {
        searchResults.value.push(...newList);
      }

      currentPage.value = nextPage;
      hasMore.value = newList.length >= 12;
    } else {
      hasMore.value = false;
    }
  } catch (error) {
    console.error("加载更多失败:", error);
  } finally {
    loading.value = false;
  }
};

// 选择活动
const selectActivity = (activity: List) => {
  selectedActivity.value = activity;
  currentStep.value = 2;
};

// 返回搜索
const backToSearch = () => {
  currentStep.value = 1;
  verifyForm.value = { ticketCode: "", totpCode: "", activityId: 0 };
};

// 执行核销
const handleVerify = async () => {
  const { ticketCode, totpCode } = verifyForm.value;

  if (!ticketCode.trim()) {
    uni.showToast({ title: "请输入核销码", icon: "none" });
    return;
  }

  if (!totpCode.trim()) {
    uni.showToast({ title: "请输入TOTP验证码", icon: "none" });
    return;
  }

  if (totpCode.length !== 6) {
    uni.showToast({ title: "TOTP验证码应为6位", icon: "none" });
    return;
  }

  verifying.value = true;

  try {
    const res = await postVerifyTicket({
      activityId: selectedActivity.value?.id || 0,
      ticketCode: ticketCode.trim(),
      totpCode: totpCode.trim(),
    });

    if (res.data?.result) {
      uni.showModal({
        title: "核销成功",
        content: res.data.result,
        showCancel: false,
        success: () => {
          // 重置表单，返回搜索
          backToSearch();
        },
      });
    }
  } catch (error: any) {
    console.error("核销失败:", error);
    uni.showToast({
      title: error?.message || "核销失败",
      icon: "none",
    });
  } finally {
    verifying.value = false;
  }
};

onMounted(() => {
  fetchActivities(1);
});

// 监听搜索关键词变化，当清空时显示所有活动
watch(searchKeyword, (newKeyword) => {
  if (!newKeyword.trim() && hasSearched.value) {
    // 用户清空了搜索框，显示所有已加载的活动
    searchResults.value = [...allActivities.value];
  }
});
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.verify-container {
  padding: $spacing-lg;
  min-height: 90vh;
}

/* 搜索区域 */
.search-section {
  margin-bottom: $spacing-lg;

  .search-box {
    @include flex(row, flex-start, center);
    background-color: $surface-color;
    border-radius: $border-radius-xl;
    padding: $spacing-sm;
    box-shadow: $shadow-sm;
    border: 1rpx solid $border-color;

    .search-input {
      flex: 1;
      padding: 0 $spacing-md;
      font-size: $font-size-base;
      color: $text-primary;
      height: 72rpx;
    }

    .search-btn {
      width: 72rpx;
      height: 72rpx;
      background-color: $primary-color;
      border-radius: $border-radius-lg;
      @include flex(row, center, center);

      &:active {
        opacity: 0.8;
      }
    }
  }
}

/* 骨架屏 */
.loading-state {
  @include flex(row, center, center);
  widows: 100%;
}

/* 活动列表 */
.activity-list {
  .activity-item {
    background-color: $surface-color;
    border-radius: $border-radius-xl;
    padding: $spacing-md;
    margin-bottom: $spacing-md;
    @include flex(row, flex-start, flex-start);
    box-shadow: $shadow-sm;
    border: 1rpx solid $border-color;

    &:active {
      opacity: 0.9;
    }

    .activity-cover {
      width: 160rpx;
      height: 120rpx;
      border-radius: $border-radius-md;
      margin-right: $spacing-md;
      flex-shrink: 0;
    }

    .activity-info {
      width: 70%;
      @include flex(column, flex-start, flex-start);

      .activity-title {
        font-size: $font-size-base;
        font-weight: $font-weight-bold;
        color: $text-primary;
        margin-bottom: 8rpx;
        max-width: 90%;
        @include truncate(1);
        white-space: nowrap;
      }

      .activity-meta {
        font-size: $font-size-sm;
        color: $text-tertiary;
        margin-bottom: 4rpx;
      }

      .activity-location {
        font-size: $font-size-sm;
        color: $text-tertiary;
      }
    }
  }

  .load-more {
    @include flex(row, center, center);
    padding: $spacing-lg;
    font-size: $font-size-sm;
    color: $primary-color;

    &:active {
      opacity: 0.7;
    }
  }

  .no-more {
    @include flex(row, center, center);
    padding: $spacing-lg;
    font-size: $font-size-xs;
    color: $text-tertiary;
  }
}

/* 空状态 */
.empty-state {
  @include flex(column, center, center);
  padding: 120rpx 0;

  .empty-text {
    font-size: $font-size-base;
    color: $text-tertiary;
    margin-top: $spacing-lg;
  }
}

/* 提示文字 */
.tip-text {
  @include flex(row, center, center);
  padding: 80rpx 0;
  font-size: $font-size-base;
  color: $text-tertiary;
}

/* 选中的活动信息 */
.selected-activity {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  border-radius: $border-radius-xl;
  padding: $spacing-lg;
  margin-bottom: $spacing-xl;
  color: #fff;

  .activity-header {
    @include flex(row, space-between, center);
    margin-bottom: $spacing-sm;

    .activity-name {
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
      max-width: 70%;
      @include truncate(1);
      white-space: nowrap;
    }

    .change-btn {
      padding: 8rpx 20rpx;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: $border-radius-full;

      &:active {
        opacity: 0.8;
      }
    }
  }

  .activity-detail {
    font-size: $font-size-sm;
    opacity: 0.9;
    display: block;
    margin-bottom: 4rpx;
  }
}

/* 核销表单 */
.verify-form {
  .form-item {
    background-color: $surface-color;
    border-radius: $border-radius-xl;
    padding: $spacing-lg;
    margin-bottom: $spacing-md;
    border: 1rpx solid $border-color;

    .form-label {
      font-size: $font-size-sm;
      font-weight: $font-weight-bold;
      color: $text-secondary;
      display: block;
      margin-bottom: $spacing-sm;
    }

    .form-input {
      width: 100%;
      height: 88rpx;
      padding: $spacing-sm;
      font-size: $font-size-base;
      color: $text-primary;
      border: 1rpx solid $border-color;
      border-radius: $border-radius-md;
      background-color: $background-color;
    }
  }

  .verify-actions {
    @include flex(row, space-between, center);
    gap: $spacing-md;
    margin-top: $spacing-xl;

    button {
      flex: 1;
      height: 88rpx;
      border-radius: $border-radius-xl;
      font-size: $font-size-base;
      font-weight: $font-weight-bold;
      border: none;

      &::after {
        border: none;
      }
    }

    .cancel-btn {
      background-color: $background-color;
      color: $text-secondary;
      border: 1rpx solid $border-color;

      &:active {
        opacity: 0.8;
      }
    }

    .confirm-btn {
      background-color: $primary-color;
      color: #fff;

      &:active {
        opacity: 0.9;
      }

      &[disabled] {
        opacity: 0.5;
      }
    }
  }
}
</style>
