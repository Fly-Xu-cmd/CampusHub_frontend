<template>
  <view class="tab-bar-container">
    <view class="tab-bar-content safe-area-bottom">
      <view class="nav-item " :class="{ active: currentPath === 'pages/home/index' }" @tap="switchTab('/pages/home/index')">
        <view class="icon">
          <wd-icon class-prefix="iconfont" name="faxian1"  size="40rpx" />
        </view>
      </view>
      <view class="nav-item" :class="{ active: currentPath === 'pages/message/index' }" @tap="switchTab('/pages/message/index')">
        <view class="icon">
          <wd-icon  class-prefix="iconfont" name="message" size="40rpx" />
        </view>
      </view>

      <view class="nav-item center-item" @tap="handlePublish">
        <view class="plus-btn">
          <text class="plus-icon">＋</text>
        </view>
      </view>

      <view class="nav-item" :class="{ active: currentPath === 'pages/ticket/index' }" @tap="switchTab('/pages/ticket/index')">
        <view class="icon">
          <wd-icon class-prefix="iconfont" name="ticket" size="40rpx" />
        </view>
      </view>

      <view class="nav-item" :class="{ active: currentPath === 'pages/profile/index' }" @tap="switchTab('/pages/profile/index')">
        <view class="icon">
          <wd-icon class-prefix="iconfont" name="geren" size="40rpx" /> 
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 获取当前页面路径，用于高亮状态
const pages = getCurrentPages();
const currentPath = computed(() => {
  return pages[pages.length - 1]?.route || '';
});
console.log(currentPath.value);
const switchTab = (url: string) => {
  uni.navigateTo({ 
    url,
    animationType: 'none',
	  animationDuration: 200
  });
};

const handlePublish = () => {
  uni.navigateTo({ url: '/pages/publish/index' });
};
</script>

<style lang="scss" scoped>
.tab-bar-container {
  position: fixed;
  bottom: 40rpx; /* 距离底部悬浮 */
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 80rpx); /* 两侧留白 */
  z-index: 999;
}

.tab-bar-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px); /* 毛玻璃效果 */
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.1);
  border-radius: 56rpx;
  height: 120rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 20rpx;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex: 1;
  
  .icon {
    font-size: 40rpx;
    color: #8ea6c4;
    transition: color 0.3s;
  }
  
  &.active .icon {
    color: $accent-color; /* 橙色高亮 */
  }
}

/* 中间凸起按钮样式 */
.center-item {
  margin-top: -60rpx; /* 向上凸起 */
  
  .plus-btn {
    width: 96rpx;
    height: 96rpx;
    background: #1e293b; /* 深色背景 */
    border-radius: 36rpx;
    transform: rotate(45deg); /* 菱形外观 */
    display: flex;
    align-items: center;
    justify-content: center;
    border: 8rpx solid #F8FAFC; /* 模拟外部遮罩 */
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    
    .plus-icon {
      font-size: 44rpx;
      color: white;
      transform: rotate(-45deg); /* 图标转回来 */
      font-weight: bold;
    }
  }
}
</style>