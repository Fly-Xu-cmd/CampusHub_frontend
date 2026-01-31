<template>
  <view class="layout-wrapper" :style="{ '--theme-color': '#f97316' }">
    <view class="header-bg">
      <view 
        v-if="headerType === 'home'" 
        class="nav-bar home-header"
        :style="{ paddingTop: `${systemStore.statusBarHeight}px` }"
      >
        <view class="header-top-row" :style="{ height: `${systemStore.navBarHeight+mpCapsuleSpace}px`, paddingRight: mpCapsuleSpace }">
          <view class="brand-info">
            <text class="sub-text">Welcome Back</text>
            <view class="main-title">
              <text class="title-text">Activity Pro</text>
              <view class="bell-btn">
                <wd-badge is-dot top="2px" right="2px">
                  <wd-icon name="notification" size="20px" color="#1e293b"></wd-icon>
                </wd-badge>
              </view>
              </view>
          </view>
        </view>

        <!-- <view class="search-section">
          <wd-search 
            hide-cancel 
            disabled 
            placeholder="搜索活动..." 
            placeholder-left
            custom-class="custom-search"
          />
        </view> -->
      </view>

      <view 
        v-else-if="headerType === 'standard'" 
        class="nav-bar standard-header"
        :class="{ 'border-b': showBorder }"
        :style="{ 
          paddingTop: `${systemStore.statusBarHeight}px`, 
          height: `${systemStore.navBarHeight+systemStore.statusBarHeight}px`
        }"
      >
        <view class="nav-left" @click="handleBack" v-if="showBack">
          <wd-icon name="arrow-left1" size="24px" color="#1e293b"></wd-icon>
        </view>

        <view class="nav-title" :style="{ maxWidth: titleMaxWidth }">
          {{ title }}
        </view>

        <view class="nav-right" :style="{ paddingRight: mpCapsuleSpace }">
          <slot name="right-action">
            <text v-if="rightText" class="right-text-btn" @click="$emit('rightClick')">
              {{ rightText }}
            </text>
          </slot>
        </view>
      </view>

      <view 
        v-else-if="headerType === 'transparent'" 
        class="nav-bar transparent-header"
        :style="{ paddingTop: `${systemStore.statusBarHeight}px`, height: `${systemStore.navBarHeight+systemStore.statusBarHeight}px` }"
      >
        <view class="glass-btn" @click="handleBack">
          <wd-icon name="arrow-left1" size="20px" color="#ffffff"></wd-icon>
        </view>
      </view>

      <view 
        v-else-if="headerType === 'none'" 
        class="nav-bar none-header"
        :style="{ paddingTop: `${systemStore.statusBarHeight}px`, height: `${systemStore.navBarHeight+systemStore.statusBarHeight}px` }"
      />
      <view
        v-else-if="headerType === 'title'" 
        class="nav-bar title-header"
        :style="{ paddingTop: `${systemStore.statusBarHeight}px`, height: `${systemStore.navBarHeight+systemStore.statusBarHeight}px` }"
      >
        <view class="big-title">
          {{ title }}
        </view>
      </view>
    </view>
   


    <scroll-view 
      scroll-y 
      class="main-content" 
      :style="contentStyle"
      :enable-back-to-top="true"
    >
      <slot></slot>
      <view class="safe-area-spacer" :style="{ height: footerSpacerHeight }"></view>
    </scroll-view>


    <view v-if="showTabBar" class="tab-bar-wrapper">
       <TabBar />
    </view>
    
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSystemStore } from '@/store/system';
import TabBar from '@/components/TabBar/TabBar.vue';

interface Props {
  headerType?: 'home' | 'standard' | 'transparent' | 'none';
  title?: string;
  showBack?: boolean;
  showTabBar?: boolean;
  showBorder?: boolean;
  rightText?: string;
  contentBg?: string;
}

const props = withDefaults(defineProps<Props>(), {
  headerType: 'standard',
  title: '',
  showBack: true,
  showTabBar: false,
  showBorder: false,
  rightText: ''
});

const emit = defineEmits(['rightClick']);
const systemStore = useSystemStore();

// --- 核心计算逻辑 (保持不变) ---
const mpCapsuleSpace = computed(() => {
  // #ifdef MP-WEIXIN
  return `${systemStore.capsuleWidth + systemStore.capsuleRight + 10}px`;
  // #endif
  return '0px';
});

const titleMaxWidth = computed(() => {
  // #ifdef MP-WEIXIN
  return `calc(100vw - 220rpx)`; 
  // #endif
  return '60%';
});

const contentStyle = computed(() => {
  const style = {
    backgroundColor: props.contentBg || 'transparent'
  }
  if (props.headerType === 'transparent') {
    return {height: '100vh',...style};
  }
  
  if (props.headerType === 'home') {
    const headerH = systemStore.statusBarHeight + systemStore.navBarHeight + 60; 
    return { height: `calc(100vh - ${headerH}px)`, ...style };
  }

  if (props.headerType === 'standard') {
    const totalHeader = systemStore.statusBarHeight + systemStore.navBarHeight;
    return { height: `calc(100vh - ${totalHeader}px)`, ...style };
  }

  return { height: '100vh', ...style }; 
});

const footerSpacerHeight = computed(() => {
  let h = systemStore.safeAreaInsetsBottom;
  if (props.showTabBar) {
    h += 80; 
  }
  return `${h}px`;
});

const handleBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: '/pages/home/index' });
  }
};
</script>

<style lang="scss" scoped>
// 导入全局变量和混合器
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

// 本地覆盖或新增变量
$theme-color: #f97316; // 橙色主题

.layout-wrapper {
  // 使用混合器定义 Flex 列布局
  @include flex(column, flex-start, stretch);
  height: 100vh;
  width: 100vw;
  background-color: $background-color; // 使用 variables.scss 变量
  position: relative;
  overflow: hidden;
}

.header-bg {
  background: $surface-color;
  backdrop-filter: blur(10px);
}

.nav-bar {
  width: 100%;
  position: relative;
  padding-left: $spacing-md; // 16px
  z-index: $z-index-fixed; // 使用 variables.scss 变量
  box-sizing: border-box;
}

/* --- Home Header --- */
.home-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding-right: $spacing-xl;
  padding-bottom: 20rpx;
  
  .header-top-row {
    @include flex(row, space-between, center); // 使用 mixin
    
    .brand-info {
      @include flex(column, center, flex-start);
      
      .sub-text { 
        font-size: $font-size-xs; 
        color: $text-tertiary; 
        font-weight: $font-weight-medium; 
        margin-bottom: 4rpx;
      }
      .main-title { 
        @include flex(row, flex-start, center);
        gap: $spacing-md;

        .bell-btn {
          width: 72rpx;
          height: 72rpx;
          @include flex(row, center, center);
          border: 1px solid $border-color;
          border-radius: $border-radius-full;
        }
        
        .title-text { 
          font-size: 36rpx; 
          color: $text-primary; 
          font-weight: 800; 
          letter-spacing: -0.5px;
        }
      }
    }
  }

  .search-section {
    margin-top: 10rpx;
    
    :deep(.custom-search) {
      background: transparent !important;
      padding: 0 !important;
      
      .wd-search__input {
        background: #ffffff !important;
        border: 1px solid $border-color;
        box-shadow: $shadow-sm; // 使用 variables.scss 变量
        border-radius: 32rpx;
        height: 80rpx;
      }
    }
  }
}

/* --- Standard Header --- */
.standard-header {
  background: $surface-color;
  @include flex(row, center, center);
  
  &.border-b {
    border-bottom: 1px solid $border-light;
  }
  
  .nav-left {
    position: absolute;
    left: $spacing-lg; // 24px
    height: 100%;
    @include flex(row, center, center);
    padding: 0 10rpx;
  }
  
  .nav-title {
    font-size: 34rpx;
    font-weight: $font-weight-bold;
    color: $text-primary;
    text-align: center;
    @include truncate(1); // 使用截断混合器
  }
  
  .nav-right {
    position: absolute;
    right: $spacing-xl; // 32px
    height: 100%;
    @include flex(row, center, center);
    
    .right-text-btn {
      font-size: 26rpx;
      color: $theme-color;
      font-weight: $font-weight-bold;
      background: #fff7ed;
      padding: 10rpx 24rpx;
      border-radius: $border-radius-full;
    }
  }
}

/* --- Transparent Header (玻璃拟态优化) --- */
.transparent-header {
  background-color: $surface-color;
  @include flex(row, flex-start, center);
  
  .glass-btn {
    width: 72rpx;
    height: 72rpx;
    
    // --- 核心优化：确保任何背景下可见 ---
    background: rgba(0, 0, 0, 0.15); // 深色半透明背景，适配浅色图
    backdrop-filter: blur(8px);       // 模糊背景，适配杂乱图
    border: 1px solid rgba(255, 255, 255, 0.2); // 微弱白边框，增加质感
    border-radius: 50%;
    
    @include flex(row, center, center);
    box-shadow: $shadow-sm;
    transition: background 0.2s;

    &:active {
       background: rgba(0, 0, 0, 0.3); // 点击反馈加深
    }
  }
}

/* --- None Header --- */
.none-header {
  background-color: $surface-color;
}

/* --- Title Header --- */
.title-header {
  @include flex(row, flex-start, center);
  .big-title{
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    text-align: center;
    @include truncate(1); // 使用截断混合器
  }
}

.main-content {
  flex: 1;
  width: 100%;
}
</style>