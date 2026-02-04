<template>
  <view class="loading-container">
    <view class="css-loader"></view>
    <view v-if="text" class="loading-text">{{ text }}</view>
  </view>
</template>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: ''
  }
});
</script>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
}

.css-loader {
  width: 60rpx;  /* 对应 wd-loading 的 size */
  height: 60rpx;
  border: 6rpx solid #e5e5e5; /* 灰色底环 */
  border-top-color: #f97316; /* 你的主题橙色 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #999;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>