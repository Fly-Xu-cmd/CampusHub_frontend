<template>
  <CommonLayout headerType="none" bgWhite>
    <view class="login-container" :style="{ paddingTop: `${systemStore.statusBarHeight + 40}px` }">
      
      <view class="header-section">
        <view class="logo-box">
          <wd-icon name="fill-lightning-o" size="32px" color="#ffffff"></wd-icon>
        </view>
        <view class="title">欢迎回来</view>
        <view class="subtitle">登录 Activity Pro，发现精彩校园生活</view>
      </view>

      <view class="form-section">
        <view class="input-wrapper">
          <wd-icon name="mobile" size="20px" color="#94a3b8" custom-class="input-icon"></wd-icon>
          <input 
            class="custom-input" 
            placeholder="手机号码" 
            placeholder-class="placeholder-style"
            v-model="formData.mobile" 
            type="number"
            maxlength="11"
          />
        </view>

        <view class="input-wrapper">
          <wd-icon name="lock-on" size="20px" color="#94a3b8" custom-class="input-icon"></wd-icon>
          <input 
            class="custom-input" 
            placeholder="密码" 
            placeholder-class="placeholder-style"
            v-model="formData.password" 
            password
          />
        </view>

        <view class="action-row">
          <text class="text-gray" @click="handleForgot">忘记密码?</text>
          <text class="text-orange" @click="handleCodeLogin">验证码登录</text>
        </view>
      </view>

      <view class="footer-section">
        <button class="login-btn" hover-class="btn-hover" @click="handleLogin">立即登录</button>
        
        <view class="register-tip">
          <text class="text-gray">还没有账号? </text>
          <text class="text-orange font-bold" @click="goToRegister">立即注册</text>
        </view>
      </view>

    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useSystemStore } from '@/store/system';

const systemStore = useSystemStore();

const formData = reactive({
  mobile: '',
  password: ''
});

const handleLogin = () => {
  if (!formData.mobile || !formData.password) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
    return;
  }
  // 模拟登录
  uni.showLoading({ title: '登录中...' });
  setTimeout(() => {
    uni.hideLoading();
    // 登录成功，跳转首页
    uni.switchTab({ url: '/pages/index/index' });
  }, 1500);
};

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/register/index' });
};

const handleForgot = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' });
};

const handleCodeLogin = () => {
  uni.showToast({ title: '切换验证码登录', icon: 'none' });
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.login-container {
  padding: 0 60rpx;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header-section {
  margin-bottom: 80rpx;
  
  .logo-box {
    width: 120rpx;
    height: 120rpx;
    // 品牌渐变色
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40rpx;
    box-shadow: 0 10px 20px rgba(249, 115, 22, 0.3);
  }
  
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
  margin-bottom: 60rpx;
  
  // 自定义输入框样式 wrapper
  .input-wrapper {
    background-color: #F9FAFB; // UI 中的 gray-50
    border-radius: 32rpx;
    padding: 30rpx 32rpx;
    display: flex;
    align-items: center;
    transition: all 0.3s;
    border: 1px solid transparent;
    
    &:focus-within {
      background-color: #fff;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
    }
    
    .input-icon {
      margin-right: 24rpx;
    }
    
    .custom-input {
      flex: 1;
      font-size: 30rpx;
      color: $text-primary;
      font-weight: 600;
      height: 40rpx;
      line-height: 40rpx;
    }
    
    :deep(.placeholder-style) {
      color: $text-tertiary; // 浅灰色占位符
      font-weight: normal;
    }
  }
  
  .action-row {
    display: flex;
    justify-content: space-between;
    font-size: 24rpx;
    font-weight: 600;
    padding: 0 10rpx;
    
    .text-gray { color: $text-tertiary; }
    .text-orange { color: $primary-color; }
  }
}

.footer-section {
  .login-btn {
    background-color: $text-primary; // 黑色背景
    color: #fff;
    font-size: 32rpx;
    font-weight: 700;
    border-radius: 32rpx;
    padding: 10rpx 0;
    line-height: 88rpx;
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    margin-bottom: 40rpx;
    
    &::after { border: none; }
    &.btn-hover { opacity: 0.9; transform: scale(0.99); }
  }
  
  .register-tip {
    text-align: center;
    font-size: 24rpx;
    
    .text-gray { color: $text-tertiary; }
    .text-orange { 
      color: $primary-color; 
      margin-left: 10rpx;
      padding: 10rpx; // 增加点击热区
    }
    .font-bold { font-weight: 700; }
  }
}
</style>