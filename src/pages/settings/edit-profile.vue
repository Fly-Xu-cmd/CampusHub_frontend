<template>
  <CommonLayout headerType="none" title="编辑资料" showBack bgWhite rightText="保存" @rightClick="handleSave">
    <view class="header">
      <wd-icon name="arrow-left" size="48rpx" color="#000" @click="toBack"></wd-icon>
      <view class="title">编辑资料</view>
      <view class="right-text" @click="handleSave">保存</view>
    </view>
    <view class="page-padding">
      <view class="avatar-section">
        <view class="avatar-wrap">
          <image src="https://picsum.photos/200?random=50" class="avatar" />
          <view class="cam-badge"><wd-icon name="camera" size="12px" color="#fff"></wd-icon></view>
        </view>
      </view>

      <view class="form-section">
        <view class="form-item">
          <text class="label">昵称</text>
          <input class="input-box" v-model="formData.nickname" placeholder="请输入昵称" />
        </view>
        <view class="form-item">
          <text class="label">个性签名</text>
          <textarea class="input-box area" v-model="formData.signature" placeholder="请输入个性签名" />
        </view>
        
        <view class="form-item">
          <text class="label">兴趣标签</text>
          <view class="tags-row">
            <view class="tag orange">跑步 <wd-icon name="close" size="10px"></wd-icon></view>
            <view class="tag green">徒步 <wd-icon name="close" size="10px"></wd-icon></view>
            <view class="add-tag"><wd-icon name="add" size="12px"></wd-icon> 添加</view>
          </view>
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  nickname: '',
  signature: '',
  tags: ['跑步', '徒步']
});

const handleSave = () => {
  uni.showToast({ title: '保存成功' });
  setTimeout(() => uni.navigateBack(), 1000);
};

const toBack = () => {
  uni.navigateBack();
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
    font-size: $font-size-base; font-weight: bold;
    color: $text-primary;
  }
  .right-text {
    font-size: $font-size-base; font-weight: bold;
    color: $primary-color;
    padding: $spacing-sm $spacing-sm;
  }
}

.page-padding { padding: $spacing-lg; }

.avatar-section {
  @include flex(row, center, center);
  margin-bottom: $spacing-xl;
  .avatar-wrap {
    position: relative;
    .avatar {
      width: 180rpx; height: 180rpx;
      border-radius: 50%;
      border: 8rpx solid $surface-color;
      box-shadow: $shadow-md;
    }
    .cam-badge {
      position: absolute; bottom: 0; right: 0;
      width: 60rpx; height: 60rpx;
      background: #1e293b;
      border-radius: 50%;
      border: 4rpx solid #fff;
      @include flex(row, center, center);
    }
  }
}

.form-item {
  margin-bottom: $spacing-lg;
  .label {
    font-size: $font-size-base; font-weight: bold; color: $text-secondary;
    margin-bottom: $spacing-sm; display: block;
    text-transform: uppercase;
  }
  .input-box {
    width: 100%;
    background: $surface-color;
    border: 1rpx solid $border-color;
    border-radius: $border-radius-lg;
    padding: $spacing-sm;
    font-size: $font-size-base;
    box-sizing: border-box;
    height: 80rpx;
    &.area { height: 160rpx; }
  }
}

.tags-row {
  @include flex(row, flex-start, center);
  gap: $spacing-sm;
  flex-wrap: wrap;
  .tag {
    padding: 10rpx 24rpx;
    border-radius: $border-radius-full;
    font-size: $font-size-base; font-weight: bold;
    @include flex(row, center, center); gap: 8rpx;
    &.orange { background: #fff7ed; color: $primary-color; border: 1rpx solid #fed7aa; }
    &.green { background: #f0fdf4; color: $secondary-color; border: 1rpx solid #bbf7d0; }
  }
  .add-tag {
    padding: 10rpx 24rpx;
    border-radius: $border-radius-full;
    font-size: $font-size-base; font-weight: bold;
    background: #f1f5f9; color: $text-tertiary;
    border: 1rpx dashed $border-color;
  }
}
</style>