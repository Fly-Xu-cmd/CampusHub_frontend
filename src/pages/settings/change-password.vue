<template>
  <CommonLayout headerType="none">
    <view class="header">
      <wd-icon name="arrow-left" size="48rpx" color="#000" @click="toBack"></wd-icon>
      <view class="title">修改密码</view>
      <view class="right-text" @click="handleSave">完成</view>
    </view>
    <view class="page-padding">
      <view class="notice-bar">
        <wd-icon class-prefix="iconfont" name="shield-alt" size="32rpx" color="#f97316"></wd-icon>
        <text class="text">为保障账号安全，请设置包含字母和数字的8位以上密码。</text>
      </view>

      <view class="form-section">
        <view class="input-wrap" v-for="(holder, i) in ['请输入当前密码', '请输入新密码（至少8位）', '请再次输入新密码']" :key="i">
          <text class="label">{{ ['当前密码', '新密码', '确认新密码'][i] }}</text>
          <view class="input-inner">
            <input class="real-input" :placeholder="holder" password />
            <wd-icon name="view" size="36rpx" color="#cbd5e1"></wd-icon>
          </view>
        </view>
      </view>

      <view class="forget-tip">忘记当前密码？</view>
      <button class="submit-btn" @click="handleSave">确认修改</button>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
const toBack = () => {
  uni.navigateBack();
}

const handleSave = () => {
  uni.showToast({ title: '保存成功' });
  setTimeout(() => uni.navigateBack(), 1000);
}
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

.notice-bar {
  background: #fff7ed; border: 1rpx solid #ffedd5;
  border-radius: $border-radius-lg; padding: $spacing-md;
  @include flex(row, flex-start, flex-start); gap: $spacing-sm;
  margin-bottom: $spacing-xl;
  .text { font-size: $font-size-sm; color: #c2410c; flex: 1; }
}

.form-section {
  margin-bottom: 40rpx;
  .input-wrap {
    margin-bottom: $spacing-md;
    .label { 
      font-size: $font-size-sm; 
      font-weight: bold; 
      color: $text-secondary; 
      margin-bottom: 10rpx; 
      display: block;
       text-transform: uppercase;
      }
    .input-inner {
      background: #fff; 
      border: 1rpx solid $border-color;
      border-radius: $border-radius-lg;
       padding: $spacing-md;
      @include flex(row, space-between, center);
      .real-input { flex: 1; font-size: $font-size-sm; }
    }
  }
}

.forget-tip { 
  text-align: right;
   font-size: $font-size-sm;
    color: $primary-color;
     font-weight: bold;
      margin-bottom: 40rpx; 
    }

.submit-btn {
  background: #1e293b;
  color: #fff; 
  border-radius: $border-radius-full;
  font-weight: bold;
  font-size: $font-size-sm;
  padding: $spacing-sm 0;
}
</style>