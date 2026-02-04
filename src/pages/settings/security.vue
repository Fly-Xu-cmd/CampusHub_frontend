<template>
  <CommonLayout headerType="standard" title="账号安全" showBack>
    <view class="page-padding">
      <view class="menu-group">
        <view class="menu-item border-b" @click="toEmail">
          <text class="label">QQ邮箱</text>
          <view class="right-val">
            <text class="val">{{ userInfo.QQemail || '未绑定' }}</text>
            <wd-icon name="arrow-right" size="14px" color="#cbd5e1"></wd-icon>
          </view>
        </view>
        <view class="menu-item" @click="toPassword">
          <text class="label">修改密码</text>
          <wd-icon name="arrow-right" size="14px" color="#cbd5e1"></wd-icon>
        </view>
      </view>

      <view class="menu-group red-border">
        <view class="menu-item center">
          <text class="label red">注销账号</text>
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const userInfo = ref(userStore.userInfo);

const toPassword = () => uni.navigateTo({ url: '/pages/settings/change-password' });
const toEmail = () => uni.navigateTo({ url: '/pages/settings/change-qqEmail' });
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.page-padding { padding: $spacing-md; }

.menu-group {
  background: $surface-color;
  border-radius: $border-radius-lg;
  border: 1rpx solid $border-light;
  overflow: hidden;
  margin-bottom: 40rpx;
  &.red-border { border-color: #fee2e2; }

  .menu-item {
    padding: 32rpx;
    background: #fff;
    @include flex(row, space-between, center);
    &.border-b { border-bottom: 1rpx solid $border-light; }
    &.center { justify-content: center; }

    .label { font-size: $font-size-sm; font-weight: bold; color: $text-primary; }
    .label.red { color: $accent-color; }
    
    .right-val {
      @include flex(row, flex-end, center); gap: 10rpx;
      .val { font-size: $font-size-sm; color: $text-tertiary; }
    }
  }
}
</style>