<template>
  <view class="layout-wrapper" :style="{ '--theme-color': '#f97316' }">
    <view class="header-bg">
      
      <view v-if="headerType === 'home'" class="nav-bar home-header"
        :style="{ paddingTop: `${systemStore.statusBarHeight}px` }">
        <view class="header-top-row"
          :style="{ height: `${systemStore.navBarHeight + mpCapsuleSpace}px`, paddingRight: mpCapsuleSpace }">
          <view class="brand-info">
            <text class="sub-text">Welcome Back</text>
            <view class="main-title">
              <text class="title-text">Activity Pro</text>
              <view class="bell-btn">
                <wd-badge is-dot top="4rpx" right="4rpx">
                  <wd-icon name="notification" size="40rpx" color="#333333"></wd-icon>
                </wd-badge>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="headerType === 'standard'" class="nav-bar standard-header"
        :class="{ 'border-b': showBorder }" :style="{ 
          paddingTop: `${systemStore.statusBarHeight}px`, 
          height: `${systemStore.navBarHeight + systemStore.statusBarHeight}px`
        }"
      >
        <view class="nav-left" @click="handleBack" v-if="showBack">
          <wd-icon name="arrow-left" size="48rpx" color="#333333"></wd-icon>
        </view>

        <view class="nav-title" :style="{ maxWidth: titleMaxWidth }">
          {{ title }}
        </view>
      </view>

      <view v-else-if="headerType === 'transparent'" class="nav-bar transparent-header"
        :style="{ paddingTop: `${systemStore.statusBarHeight}px`, height: `${systemStore.navBarHeight + systemStore.statusBarHeight}px` }">
        <view class="glass-btn" @click="handleBack">
          <wd-icon name="arrow-left" size="40rpx" color="#ffffff"></wd-icon>
        </view>
      </view>

      <view v-else-if="headerType === 'none'" class="nav-bar none-header"
        :style="noneHeaderStyle" />
      
      <view v-else-if="headerType === 'title'" class="nav-bar title-header"
        :style="{ paddingTop: `${systemStore.statusBarHeight}px`, height: `${systemStore.navBarHeight + systemStore.statusBarHeight}px` }">
        <view class="big-title">
          {{ title }}
        </view>
      </view>
    </view>


    <scroll-view scroll-y class="main-content" :style="contentStyle" :enable-back-to-top="true">
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
	import { onLoad } from '@dcloudio/uni-app';
  import { useSystemStore } from '@/store/system';
  import TabBar from '@/components/TabBar/TabBar.vue';

  // Props 定义保持不变...
  interface Props {
    headerType ?: 'home' | 'standard' | 'transparent' | 'none' | 'title'; // 补充 title 类型
    title ?: string;
    showBack ?: boolean;
    showTabBar ?: boolean;
    showBorder ?: boolean;
    rightText ?: string;
    contentBg ?: string;
    padding ?: string; 
  }

  const props = withDefaults(defineProps<Props>(), {
    headerType: 'standard',
    title: '',
    showBack: true,
    showTabBar: false,
    showBorder: false,
    rightText: '提交',
  });

  const emit = defineEmits(['rightClick']);
  const systemStore = useSystemStore();

	onLoad(() => {
    // 1. 初始化系统布局信息
    systemStore.initSystemInfo();
  });
  
  // --- 核心计算逻辑 ---
  
  // 1. 胶囊避让 (涉及系统API，必须用 px)
  const mpCapsuleSpace = computed(() => {
    // #ifdef MP-WEIXIN
    return `${systemStore.capsuleWidth + systemStore.capsuleRight + 10}px`;
    // #endif
    return '0px';
  });

  // 2. 标题最大宽度
  const titleMaxWidth = computed(() => {
    // #ifdef MP-WEIXIN
    return `calc(100vw - 220rpx)`;
    // #endif
    return '60%';
  });

  // 3. 内容区域样式
  const contentStyle = computed(() => {
    const style = {
      backgroundColor: props.contentBg || 'transparent',
      // 优化：默认 padding 改为 rpx 字符串，注意这里不用变量是因为 style 对象需要字符串
      padding: props.padding || '0 32rpx', 
    }
    
    // 动态计算高度，涉及系统变量，保留 px 混合计算
    if (props.headerType === 'transparent') {
      return { height: '100vh', ...style };
    }

    if (props.headerType === 'home') {
      // 60 是搜索框大概高度(px)，这里粗略估算
      const headerH = systemStore.statusBarHeight + systemStore.navBarHeight + 60;
      return { height: `calc(100vh - ${headerH}px)`, ...style };
    }

    if (props.headerType === 'standard' || props.headerType === 'none' || props.headerType === 'title') {
      const totalHeader = systemStore.statusBarHeight + systemStore.navBarHeight;
      return { height: `calc(100vh - ${totalHeader}px)`, ...style };
    }

    return { height: '100vh', ...style };
  });

  // 4. 底部垫片高度
  const footerSpacerHeight = computed(() => {
    const safeArea = systemStore.safeAreaInsetsBottom; // 单位 px
    
    if (props.showTabBar) {
      // 混合计算：rpx + px
      return `calc(180rpx + ${safeArea}px)`;
    }
    return `${safeArea}px`;
  });

	// 5. none样式
  const noneHeaderStyle = computed(() => {
		let style = {
 			paddingTop: `${systemStore.statusBarHeight}px`,
      height: `${systemStore.navBarHeight + systemStore.statusBarHeight}px`
		}
		// #ifdef MP-WEIXIN
		style = {
 			paddingTop: `${systemStore.statusBarHeight}px`,
      height: `${systemStore.navBarHeight + systemStore.statusBarHeight}px`

		}
		// #endif
		// #ifdef H5
		style = {
 			paddingTop: `${systemStore.statusBarHeight}px`,
      height: `0px`
		}
		// #endif
		// #ifdef APP-PLUS
		style = {
 			paddingTop: `${systemStore.statusBarHeight}px`,
      height: `0px`
		}
		// #endif
		// #ifdef APP-HARMONY
		style = {
		 			paddingTop: `${systemStore.statusBarHeight}px`,
		height: `0px`
				}
		// #endif
    return style
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
  @use "@/styles/variables.scss" as *;
  @use "@/styles/mixins.scss" as *;

  .layout-wrapper {
    @include flex(column, flex-start, stretch);
    height: 100vh;
    width: 100vw;
    background-color: $background-color;
    position: relative;
    overflow: hidden;
  }

  .header-bg {
    background: $surface-color;
    // backdrop-filter 在非 H5 端支持度有限，但在 H5/App-Vue3 中通常可用
    // #ifdef H5
    backdrop-filter: blur(10px);
    // #endif
  }

  .nav-bar {
    width: 100%;
    position: relative;
    padding-left: $spacing-md; // 使用变量
    z-index: $z-index-fixed;
    box-sizing: border-box;
  }

  /* --- Home Header --- */
  .home-header {
    background: rgba(255, 255, 255, 0.95);
    // #ifdef H5
    backdrop-filter: blur(10px);
    // #endif
    padding-right: $spacing-xl;
    padding-bottom: 20rpx; // 保持 rpx

    .header-top-row {
      @include flex(row, space-between, center);

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
            width: 72rpx; // 改为 rpx
            height: 72rpx;
            @include flex(row, center, center);
            border: 2rpx solid $border-color; // 1px -> 2rpx
            border-radius: $border-radius-full;
          }

          .title-text {
            font-size: 36rpx;
            color: $text-primary;
            font-weight: $font-weight-bold;
            letter-spacing: -1rpx; // 0.5px -> 1rpx
          }
        }
      }
    }
  }

  /* --- Standard Header --- */
  .standard-header {
    background: $surface-color;
    @include flex(row, flex-start, center);
    
    &.border-b {
      border-bottom: 2rpx solid $border-light; // 1px -> 2rpx
    }
    
    .nav-left {
      height: 100%;
      @include flex(row, center, center);
      padding: 0 10rpx;
      margin-right: $spacing-xs;
    }
    
    .nav-title {
      font-size: 34rpx;
      font-weight: $font-weight-bold;
      color: $text-primary;
      text-align: center;
      @include truncate(1);
    }
  }

  /* --- Transparent Header --- */
  .transparent-header {
    background-color: transparent; // 透明模式背景应该是透明的
    @include flex(row, flex-start, center);

    .glass-btn {
      width: 72rpx;
      height: 72rpx;
      background: rgba(0, 0, 0, 0.15);
      // #ifdef H5
      backdrop-filter: blur(8rpx);
      // #endif
      border: 2rpx solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      @include flex(row, center, center);
      box-shadow: $shadow-sm;

      &:active {
        background: rgba(0, 0, 0, 0.3);
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

    .big-title {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      color: $text-primary;
      text-align: center; // 标题可以居中或左对齐，看需求
      padding-left: $spacing-xs;
      @include truncate(1);
    }
  }

  .main-content {
    flex: 1;
    width: 100%;
    // padding 移到 :style 计算里了，这里不需要写默认 padding
  }
</style>