<template>
  <CommonLayout headerType="none" padding="0 0" bgWhite>
    <view
      class="page-container"
      :style="{ paddingTop: `${systemStore.statusBarHeight}px` }"
    >
      <view class="header-section">
        <view class="nav-bar">
          <view class="back-btn" @click="handleBack">
            <wd-icon name="arrow-left" size="20px" color="#333333"></wd-icon>
          </view>
          <text class="step-indicator">2/2</text>
        </view>

        <view class="header-text">
          <text class="title">选择你的兴趣</text>
          <text class="subtitle">选择至少1个标签，我们将为你推荐相关活动</text>
        </view>
      </view>

      <scroll-view scroll-y class="scroll-area">
        <view class="content-padding">
          <view class="tags-wrapper" v-if="tagsList.length > 0">
            <view
              v-for="tag in tagsList"
              :key="tag.id"
              class="tag-item"
              :class="{ 'is-selected': selectedIds.includes(tag.id) }"
              @click="toggleTag(tag)"
            >
              <wd-icon
                v-if="!isImageUrl(tag.tagIcon)"
                :name="tag.tagIcon || 'star-on'"
                size="14px"
                class="tag-icon"
                custom-style="margin-right: 6px;"
              />

              <image
                v-else
                :src="tag.tagIcon"
                class="tag-img-icon"
                mode="aspectFit"
              />

              <text class="tag-text">{{ tag.tagName }}</text>
            </view>
          </view>

          <view
            v-if="tagsList.length === 0 && !isLoading"
            class="no-tag-wrapper"
          >
            <wd-icon name="info-circle" size="48px" color="#cbd5e1"></wd-icon>
            <text class="no-tag-text">暂无可选标签</text>
            <text class="no-tag-subtext">请联系管理员添加</text>
          </view>

          <view class="safe-spacer"></view>
        </view>
      </scroll-view>

      <view class="footer-bar">
        <view class="selection-info">
          已选择
          <text class="highlight-num">{{ selectedIds.length }}</text> 个标签
        </view>
        <button
          class="submit-btn"
          :disabled="selectedIds.length === 0"
          @click="handleSubmit"
        >
          完成注册
        </button>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useSystemStore } from "@/store/system";
import { getTags } from "@/api/tags/router";
import { updateInterests } from "@/api/profile/router";
import type { InterestTag } from "@/types/modules/profile";

const systemStore = useSystemStore();

// --- 状态管理 ---
const selectedIds = ref<number[]>([]);
const tagsList = ref<InterestTag[]>([]);
const isLoading = ref(false);

// --- 方法 ---

// 辅助函数：判断是否为图片URL
const isImageUrl = (str: string) => {
  if (!str) return false;
  return str.startsWith("http") || str.startsWith("/static");
};

const handleBack = () => {
  uni.navigateBack();
};

const toggleTag = (tag: InterestTag) => {
  const index = selectedIds.value.indexOf(tag.id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    // 限制最多选择 5 个（可选需求，这里假设不做强制限制，或者可以加上）
    if (selectedIds.value.length >= 10) {
      uni.showToast({ title: "最多选择10个标签", icon: "none" });
      return;
    }
    selectedIds.value.push(tag.id);
  }
};

const fetchTags = async () => {
  isLoading.value = true;
  try {
    const res = await getTags();
    // 适配 API 返回结构 { list: InterestTag[] }
    if (res.data && Array.isArray(res.data.list)) {
      tagsList.value = res.data.list;
    } else if (Array.isArray(res.data)) {
      // 兼容直接返回数组的情况
      tagsList.value = res.data as any;
    } else {
      console.warn("Tags API returned unexpected structure:", res.data);
      tagsList.value = [];
    }
  } catch (error) {
    console.error("获取标签失败:", error);
    uni.showToast({ title: "获取标签失败，请重试", icon: "none" });
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (selectedIds.value.length === 0) return;

  uni.showLoading({ title: "提交中..." });
  try {
    await updateInterests({
      interestTagIds: selectedIds.value,
    });

    uni.hideLoading();
    uni.showToast({ title: "设置成功", icon: "success" });

    setTimeout(() => {
      // 跳转到首页
      uni.reLaunch({ url: "/pages/index/index" });
    }, 1500);
  } catch (error) {
    uni.hideLoading();
    console.error("提交标签失败:", error);
    uni.showToast({ title: "提交失败，请重试", icon: "none" });
  }
};

onMounted(() => {
  fetchTags();
});
</script>

<style lang="scss" scoped>
// 引入全局变量和混合器
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

// 定义局部主题色 (还原 UI 图的橙色，如果全局变量已改为橙色可直接使用 $primary-color)
$theme-orange: #f97316;
$theme-orange-light: #fff7ed;

.page-container {
  @include flex(column, flex-start, stretch);
  height: 100vh;
  box-sizing: border-box;
  background-color: $surface-color; // #ffffff
}

/* --- 1. 头部区域 --- */
.header-section {
  padding: $spacing-md $spacing-xl; // 16px 32px (根据 rpx 换算建议调整)
  // 为了视觉还原，这里给具体的 padding
  padding: 30rpx 48rpx;
  border-bottom: 1px solid $border-light;

  .nav-bar {
    @include flex(row, space-between, center);
    margin-bottom: 40rpx;

    .back-btn {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background-color: $background-color; // #f8f8f8
      @include flex(row, center, center);
    }

    .step-indicator {
      font-size: $font-size-xs;
      color: $text-tertiary;
      font-weight: $font-weight-bold;
    }
  }

  .header-text {
    .title {
      font-size: 48rpx; // 大标题
      font-weight: $font-weight-bold;
      color: $text-primary;
      display: block;
      margin-bottom: 16rpx;
    }

    .subtitle {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }
}

/* --- 2. 滚动内容区域 --- */
.scroll-area {
  flex: 1;
  overflow: hidden;

  .content-padding {
    padding: 40rpx 48rpx;
  }

  .tags-wrapper {
    @include flex(row, flex-start, center);
    flex-wrap: wrap;
    gap: 24rpx; // 标签间距

    .tag-item {
      @include flex(row, center, center);
      padding: 20rpx 36rpx;
      background-color: $surface-color;
      border: 2rpx solid $border-color; // 默认灰边框
      border-radius: 999px; // 全圆角
      transition: all 0.2s ease;

      .tag-text {
        font-size: $font-size-sm;
        font-weight: $font-weight-bold;
        color: $text-secondary; // 默认灰字
      }

      // 图标默认颜色通过 wd-icon 的 color 属性控制，
      // 但这里通过 css 覆盖更方便统一管理状态
      :deep(.wd-icon) {
        color: $text-secondary;
      }

      // 图片图标样式
      .tag-img-icon {
        width: 32rpx;
        height: 32rpx;
        margin-right: 12rpx;
        opacity: 0.5; // 未选中时半透明
      }

      // --- 选中状态 ---
      &.is-selected {
        background-color: $theme-orange-light;
        border-color: rgba($theme-orange, 0.3);

        .tag-text {
          color: $theme-orange;
        }

        :deep(.wd-icon) {
          color: $theme-orange !important;
        }

        .tag-img-icon {
          opacity: 1;
        }
      }
    }
  }

  .no-tag-wrapper {
    @include flex(column, center, center);
    padding: 100rpx 0;

    .no-tag-text {
      font-size: $font-size-base;
      color: $text-secondary;
      font-weight: $font-weight-bold;
      margin-top: 30rpx;
    }

    .no-tag-subtext {
      font-size: $font-size-sm;
      color: $text-tertiary;
      margin-top: 10rpx;
    }
  }

  .safe-spacer {
    height: 200rpx; // 留出底部操作栏的高度
  }
}

/* --- 3. 底部固定栏 --- */
.footer-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: $surface-color;
  border-top: 1px solid $border-light;
  padding: 30rpx 48rpx;
  // 适配底部安全区
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  z-index: 10;

  .selection-info {
    text-align: center;
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-bottom: 30rpx;

    .highlight-num {
      color: $theme-orange;
      font-weight: $font-weight-bold;
      font-size: $font-size-base;
      margin: 0 8rpx;
    }
  }

  .submit-btn {
    width: 100%;
    height: 100rpx;
    line-height: 100rpx;
    background-color: #1e293b; // 深色背景 (UI图中的黑色)
    color: #ffffff;
    font-size: 32rpx;
    font-weight: $font-weight-bold;
    border-radius: 32rpx;
    box-shadow: $shadow-lg; // 引用变量中的阴影

    &[disabled] {
      opacity: 0.6;
      background-color: $text-tertiary;
    }

    &:active {
      transform: scale(0.99);
    }
  }
}
</style>
