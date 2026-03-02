<template>
  <CommonLayout headerType="none" padding="0 0">
    <view class="header">
      <wd-icon name="arrow-left" size="48rpx" color="#000" @click="toBack"></wd-icon>
      <view class="title">修改QQ邮箱</view>
      <view class="right-text"></view>
    </view>
    <view class="page-padding">
      <view class="disabled-container">
        <view class="icon-wrapper">
          <wd-icon name="error-warning" size="120rpx" color="#94a3b8"></wd-icon>
        </view>
        <text class="title-text">功能开发中</text>
        <text class="desc-text">修改QQ邮箱功能正在开发中，敬请期待</text>
        <button class="back-btn" @click="toBack">返回</button>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { safeNavigateBack } from "@/utils/navigation";

const toBack = () => {
  safeNavigateBack("/pages/settings/index");
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.header {
  @include flex(row, space-between, center);
  padding: $spacing-sm $spacing-md;
  background: $surface-color;
  border-bottom: 1rpx solid $border-light;

  .title {
    font-size: $font-size-base;
    font-weight: bold;
    color: $text-primary;
  }

  .right-text {
    font-size: $font-size-base;
    font-weight: bold;
    color: $primary-color;
    padding: $spacing-sm $spacing-sm;
  }
}

.page-padding {
  padding: $spacing-lg;
}

.disabled-container {
  @include flex(column, center, center);
  padding: 120rpx 0;
  gap: 32rpx;

  .icon-wrapper {
    margin-bottom: 24rpx;
  }

  .title-text {
    font-size: 40rpx;
    font-weight: 700;
    color: $text-primary;
  }

  .desc-text {
    font-size: $font-size-base;
    color: $text-secondary;
    text-align: center;
    line-height: 1.6;
    margin-bottom: 24rpx;
  }

  .back-btn {
    width: 400rpx;
    height: 88rpx;
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    color: #fff;
    border-radius: $border-radius-full;
    font-size: $font-size-base;
    font-weight: 600;
    border: none;
    margin-top: 32rpx;
  }
}
</style>