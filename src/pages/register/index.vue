<template>
  <CommonLayout headerType="transparent" contentBg="#fff">
    <view class="register-container" :style="{ paddingTop: `${2 * (systemStore.statusBarHeight + 30)}rpx` }">

      <view class="content-body">
        <view class="header-text">
          <view class="title">注册账号</view>
          <view class="subtitle">填写信息，开启你的旅程</view>
        </view>

        <view class="form-section">
          <view class="input-wrapper">
            <input 
              class="custom-input" 
              placeholder="昵称" 
              placeholder-class="placeholder-style"
              v-model="formData.nickname"
            />
          </view>

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

          <view class="input-wrapper">
            <input 
              class="custom-input" 
              placeholder="设置密码" 
              placeholder-class="placeholder-style"
              v-model="formData.password" 
              password
            />
          </view>
        </view>

        <view class="footer-btn">
          <button class="register-btn" hover-class="btn-hover" @click="handleRegister">完成注册</button>
        </view>
      </view>

    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useSystemStore } from '@/store/system';

const systemStore = useSystemStore();

const formData = reactive({
  nickname: '',
  QQemail: '',
  code: '',
  password: ''
});

const timer = ref(0);

const getVerifyCode = () => {
  if (timer.value > 0) return;
  if (!formData.QQemail || !/^[a-zA-Z0-9_]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(formData.QQemail)) { 
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

const handleRegister = () => {
  if (!formData.QQemail || !formData.password || !formData.nickname || !formData.code) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
    return;
  }
  
  uni.showLoading({ title: '注册中...' });
  setTimeout(() => {
    uni.hideLoading();
    // 注册成功，跳转到选择标签页 (UI 21)
    uni.navigateTo({ url: '/pages/select-tags/index' });
  }, 1500);
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.register-container {
  display: flex;
  flex-direction: column;
}

.nav-header {
  padding: 20rpx 40rpx;
  .back-btn {
    width: 80rpx;
    height: 80rpx;
    background-color: #F9FAFB; // 浅灰背景
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.content-body {
  flex: 1;
  padding: 40rpx 60rpx;
  display: flex;
  flex-direction: column;
}

.header-text {
  margin-bottom: 80rpx;
  .title {
    font-size: 56rpx;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 16rpx;
  }
  .subtitle {
    font-size: 28rpx;
    color: $text-tertiary;
  }
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  margin-bottom: 80rpx;

  .input-wrapper {
    background-color: #F9FAFB;
    border-radius: 32rpx;
    padding: 30rpx 32rpx;
    display: flex;
    align-items: center;
    
    .custom-input {
      flex: 1;
      font-size: 30rpx;
      color: $text-primary;
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

.footer-btn {
  .register-btn {
    padding: $spacing-sm;
    background-color: $primary-color; // 橙色
    color: #fff;
    font-size: 32rpx;
    font-weight: 700;
    border-radius: 32rpx;
    line-height: 88rpx;
    box-shadow: 0 10px 20px rgba(249, 115, 22, 0.25);
    
    &::after { border: none; }
    &.btn-hover { opacity: 0.9; }
  }
}
</style>