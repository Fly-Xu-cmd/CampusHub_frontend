<template>
  <CommonLayout headerType="standard" title="设置" showBack>
    <view class="settings-list">
      <view class="menu-group">
        <view class="menu-item border-b" @click="toPage('/pages/settings/edit-profile')">
          <text class="label">编辑资料</text>
          <wd-icon name="arrow-right" size="14px" color="#cbd5e1"></wd-icon>
        </view>
        <view class="menu-item" @click="toPage('/pages/settings/security')">
          <text class="label">账号安全</text>
          <wd-icon name="arrow-right" size="14px" color="#cbd5e1"></wd-icon>
        </view>
      </view>

      <button class="logout-btn" hover-class="btn-hover">退出登录</button>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
const toPage = (url: string) => uni.navigateTo({ url });
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.settings-list {
  padding: $spacing-md;
}

.menu-group {
  background-color: $surface-color;
  border-radius: $border-radius-lg;
  border: 1rpx solid $border-light;
  overflow: hidden;
  margin-bottom: 60rpx;

  .menu-item {
    padding: 32rpx;
    background: #fff;
    @include flex(row, space-between, center);

    .label {
      font-size: $font-size-sm;
      font-weight: $font-weight-bold;
      color: $text-primary;
    }

    &.border-b { border-bottom: 1rpx solid $border-light; }
  }
}

.logout-btn {
  background-color: $surface-color;
  padding: $spacing-sm;
  color: $accent-color; // 红色
  border: 1rpx solid $border-light;
  border-radius: $border-radius-lg;
  font-weight: $font-weight-bold;
  font-size: $font-size-sm;
}
</style>