<template>
  <CommonLayout headerType="transparent" contentBg="#fff">
    <view class="login-container" :style="{ paddingTop: `${2 * (systemStore.statusBarHeight + 30)}rpx` }">
      
      <view class="header-section">
        <view class="logo-box">
          <wd-icon class-prefix="iconfont" name="a-shapequickpressedtrue" size="64rpx" color="#ffffff"></wd-icon>
        </view>
        <view class="title">欢迎回来</view>
        <view class="subtitle">登录 Activity Pro，发现精彩校园生活</view>
      </view>

      <view class="form-section">
        <view class="input-wrapper">
          <view class="input-icon">
            <wd-icon name="mail" size="40rpx" color="#94a3b8" custom-class="input-icon"></wd-icon>
          </view>
          <input 
            class="custom-input" 
            placeholder="QQ邮箱" 
            placeholder-class="placeholder-style"
            v-model="formData.qqEmail" 
            type="text"
            required
          />
        </view>

        <view class="input-wrapper">
          <view class="input-icon">
            <wd-icon name="lock-on" size="40rpx" color="#94a3b8" custom-class="input-icon"></wd-icon>
          </view>
          <input 
            class="custom-input" 
            :placeholder="passwordPlaceholder" 
            placeholder-class="placeholder-style"
            v-model="formData.password" 
            :password="!showPassword&&!isCodeLogin"
          />
          <view v-if="!isCodeLogin" class="input-icon" @click="toggleShowPassword" >
            <wd-icon :name="showPassword?'browse':'browse-off'" size="40rpx" color="#94a3b8" custom-class="input-icon"></wd-icon>
          </view>
          <view v-else class="send-code-btn" @click="handleSendCode">
            <text>发送验证码</text>
          </view>
        </view>

        <view class="action-row">
          <text class="text-gray" @click="handleForgot">忘记密码?</text>
          <text class="text-orange" @click="toggleLoginMode">{{ isCodeLogin ? '密码登录' : '验证码登录' }}</text>
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
import { reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSystemStore } from '@/store/system';
import { useUserStore } from '@/store/user';
import { authApi } from '@/api/register/router';

const userStore = useUserStore();
const passwordPlaceholder = ref('密码');
const isCodeLogin = ref(false);// 是否是验证码登录模式
const showPassword = ref(false);// 是否显示密码
const redirectUrl = ref(''); // 用来存“原本想去哪”

const systemStore = useSystemStore();

const formData = reactive({
  qqEmail: '',
  password: '',
  captchaOutput: '',
  genTime: '',
  lotNumber: '',
  passToken: ''
});

// 登录成功后，判断是否有 redirect 参数
onLoad((options) => {
  if (options && options.redirect) {
    // 解码 URL
    redirectUrl.value = decodeURIComponent(options.redirect);
    console.log('登录成功后将跳转至:', redirectUrl.value);
  }
});

const handleLogin = async () => {
  if (!formData.qqEmail || !formData.password) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
    return;
  }
  if(isCodeLogin.value) {
    if(!formData.captchaOutput || !formData.genTime || !formData.lotNumber || !formData.passToken) {
      uni.showToast({ title: '请填写完整验证码信息', icon: 'none' });
      return;
    }
  }
  uni.showLoading({ title: '登录中...' });
  try {
    const response = await authApi.login({
      qqEmail: formData.qqEmail,
      password: formData.password,
      captchaOutput: formData.captchaOutput,
      genTime: formData.genTime,
      lotNumber: formData.lotNumber,
      passToken: formData.passToken
    });
    uni.hideLoading();
    uni.showToast({ title: '登录成功', icon: 'success' });
    // 登录成功，存储用户信息
    userStore.login(response.data.userInfo, response.data.accessToken, response.data.refreshToken);
    // 跳转页面
    if (redirectUrl.value) {
      setTimeout(() => {
        uni.redirectTo({ url: redirectUrl.value });
      }, 1000);
    } else {
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/index/index' });
      }, 1000);
    }
  } catch (error) {
    uni.hideLoading();
    uni.showToast({ title: '登录失败，请重试', icon: 'none' });
    console.error('登录失败:', error);
  }
};

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/register/index' });
};

const handleForgot = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' });
};

const handleSendCode = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' });
};



const toggleLoginMode = () => {
  uni.showToast({ title: '切换验证码登录', icon: 'none' });
  isCodeLogin.value = !isCodeLogin.value;
  if(isCodeLogin.value) {
    passwordPlaceholder.value = '验证码';
    formData.password = '';
  } else {
    passwordPlaceholder.value = '密码';
    formData.password = '';
  }
};

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;

};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.login-container {
  padding: 0 60rpx;
  display: flex;
  flex-direction: column;
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

    .send-code-btn {
      font-size: 24rpx;
      color: $primary-color;
      font-weight: 600;
      height: 40rpx;
      line-height: 40rpx;
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