<template>
  <CommonLayout headerType="none" padding="0 0">
    <view class="header">
      <wd-icon name="arrow-left" size="48rpx" color="#000" @click="toBack"></wd-icon>
      <view class="title">修改QQ邮箱</view>
      <view class="right-text" @click="handleSave">完成</view>
    </view>
    <view class="page-padding">

       <view class="form-section">
          <view class="input-wrapper">
            <input 
              class="custom-input" 
              placeholder="QQ邮箱" 
              placeholder-class="placeholder-style"
              v-model="formData.QQemail" 
              type="number"
              maxlength="11"
            />
          </view>

          <view class="input-wrapper verify-wrapper">
            <input 
              class="custom-input" 
              placeholder="验证码" 
              placeholder-class="placeholder-style"
              v-model="formData.code" 
              type="number"
              maxlength="6"
            />
            <view class="verify-btn" :class="{ disabled: timer > 0 }" @click="getVerifyCode">
              {{ timer > 0 ? `${timer}s后重试` : '获取验证码' }}
            </view>
          </view>
        </view>
        
      <button class="submit-btn" @click="handleSave">确认修改</button>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const formData = ref({
  QQemail: '',
  code: '',
});

const getVerifyCode = () => {
  if (timer.value > 0) return;
  if (!formData.value.QQemail || !/^[a-zA-Z0-9_]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(formData.value.QQemail)) { 
    uni.showToast({ title: '请输入正确的QQ邮箱', icon: 'none' });
    return;
  }
  
  // 模拟发送验证码
  uni.showToast({ title: '验证码已发送', icon: 'success' });
  timer.value = 60;
  const interval = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) clearInterval(interval);
  }, 1000);
};

const timer = ref(0);

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

.page-padding { 
  padding: $spacing-lg;
}

.notice-bar {
  background: #fff7ed; border: 1rpx solid #ffedd5;
  border-radius: $border-radius-lg; padding: $spacing-md;
  @include flex(row, flex-start, flex-start); gap: $spacing-sm;
  margin-bottom: $spacing-xl;
  .text { font-size: $font-size-sm; color: #c2410c; flex: 1; }
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  margin-bottom: 80rpx;

  .input-wrapper {
    background-color: $surface-color;
    border-radius: 32rpx;
    padding: 30rpx 32rpx;
    display: flex;
    align-items: center;
    
    .custom-input {
      flex: 1;
      font-size: 30rpx;
      color: $text-secondary; 
      font-weight: 600;
      height: 40rpx;
    }

    :deep(.placeholder-style) {
      color: $text-tertiary;
      font-weight: 700;
    }
  }

  // 验证码行的特殊样式
  .verify-wrapper {
    padding-right: 10rpx; // 右边距减小，给按钮腾位置
    
    .verify-btn {
      background-color: $text-primary; // 黑色按钮
      color: #fff;
      font-size: 24rpx;
      font-weight: 700;
      padding: 20rpx 30rpx;
      border-radius: 24rpx;
      transition: opacity 0.3s;
      
      &.disabled {
        background-color: #E2E8F0;
        color: #94A3B8;
      }
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