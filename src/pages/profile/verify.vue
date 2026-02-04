<template>
  <CommonLayout headerType="standard" title="学生认证" showBack bgWhite>
    <view class="page-padding">
      
      <view class="notice-bar">
        <wd-icon class-prefix="iconfont" name="graduation-cap" size="16px" color="#3b82f6"></wd-icon>
        <text class="text">本平台仅对在校大学生开放。请提供真实的学校和学籍信息，认证通过后将获得学生专属标识。</text>
      </view>

      <view v-if="loading" class="loading-section">
        <AsyncLoading text="加载中..." />
      </view>

      <view v-else-if="authStatus === 'completed'" class="status-section success">
        <wd-icon class-prefix="iconfont" name="check-circle" size="80rpx" color="#10b981"></wd-icon>
        <text class="status-title">认证成功</text>
        <text class="status-desc">{{ statusDesc || '您已成功通过学生认证，获得学生专属标识' }}</text>
      </view>

      <view v-else-if="authStatus === 'pending'" class="status-section pending">
        <wd-icon class-prefix="iconfont" name="clock" size="80rpx" color="#f59e0b"></wd-icon>
        <text class="status-title">审核中</text>
        <text class="status-desc">{{ statusDesc || '您的认证申请正在审核中，请耐心等待' }}</text>
        <button class="cancel-btn" @click="handleCancelAuth">取消申请</button>
      </view>

      <view v-else-if="authStatus === 'failed'" class="status-section failed">
        <wd-icon class-prefix="iconfont" name="x-circle" size="80rpx" color="#ef4444"></wd-icon>
        <text class="status-title">认证失败</text>
        <text class="status-desc">{{ statusDesc || '您的认证申请未通过，请重新提交' }}</text>
        <button class="retry-btn" @click="resetForm">重新提交</button>
      </view>

      <view v-else class="form-section">
        <view class="form-group">
          <view class="input-item">
            <text class="label">真实姓名</text>
            <input class="custom-input" placeholder="请输入真实姓名" placeholder-class="ph-style" v-model="formData.realName" />
          </view>
          <view class="input-item">
            <text class="label">学校名称</text>
            <input class="custom-input" placeholder="请输入学校名称" placeholder-class="ph-style" v-model="formData.school" />
          </view>
          <view class="input-item">
            <text class="label">入学年份</text>
            <input class="custom-input" placeholder="请输入入学年份" placeholder-class="ph-style" v-model="formData.enrollmentYear" />
          </view>
          <view class="input-item">
            <text class="label">学号</text>
            <input class="custom-input" placeholder="请输入学号" placeholder-class="ph-style" v-model="formData.studentId" />
          </view>
        </view>

        <view class="upload-section">
          <text class="section-title">上传学生证/校园卡</text>
          <view class="upload-grid">
            <view class="upload-box" @click="handleUpload('front')">
              <view v-if="formData.frontImage" class="image-preview">
                <image :src="formData.frontImage" mode="aspectFill"></image>
              </view>
              <view v-else class="icon-container">
                <wd-icon class-prefix="iconfont" name="id-card-clip" size="44rpx"></wd-icon>
              </view>
              <text class="upload-text">正面（含照面）</text>
            </view>
            <view class="upload-box" @click="handleUpload('back')">
              <view v-if="formData.backImage" class="image-preview">
                <image :src="formData.backImage" mode="aspectFill"></image>
              </view>
              <view v-else class="icon-container">
                <wd-icon class-prefix="iconfont" name="book" size="44rpx"></wd-icon>
              </view>
              <text class="upload-text">详情面</text>
            </view>
          </view>
        </view>

        <button class="submit-btn" hover-class="btn-hover" @click="handleSubmit">提交审核</button>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getAuthProgress, postStudentAuth, postStudentAuthCancel } from '@/api/profile/router';
import type { PostStudentAuthRequest } from '@/types/modules/profile';

const loading = ref(false);
const authStatus = ref<'initial' | 'pending' | 'completed' | 'failed'>('initial');
const statusDesc = ref('');
const formData = ref({
  realName: '',
  school: '',
  enrollmentYear: '',
  studentId: '',
  frontImage: '',
  backImage: ''
});

// Helper function to map status code to description
const getStatusDescription = (status: number): string => {
  const statusMap: Record<number, string> = {
    '-1': '未申请',
    0: '初始',
    1: 'OCR审核中',
    2: '待确认',
    3: '人工审核',
    4: '通过',
    5: '拒绝',
    6: '超时',
    7: '取消'
  };
  return statusMap[status] || '未知状态';
};

onLoad(async () => {
  await fetchAuthStatus();
});

const fetchAuthStatus = async () => {
  loading.value = true;
  try {
    const response = await getAuthProgress();
    if (response.data) {
      const status = response.data.status || -1; // Default to -1 (未申请) if status is undefined
      statusDesc.value = getStatusDescription(status);
      
      // Map status code to authStatus state
      if (status === 4) {
        authStatus.value = 'completed';
      } else if (status === 1 || status === 2 || status === 3) {
        authStatus.value = 'pending';
      } else if (status === 5 || status === 6) {
        authStatus.value = 'failed';
      } else {
        authStatus.value = 'initial';
      }
    }
  } catch (error) {
    console.error('获取认证状态失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleUpload = (type: 'front' | 'back') => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      if (res.tempFilePaths[0]) {
        if (type === 'front') {
          formData.value.frontImage = res.tempFilePaths[0];
        } else {
          formData.value.backImage = res.tempFilePaths[0];
        }
      }
    }
  });
};

const handleSubmit = async () => {
  // 表单验证
  if (!formData.value.realName || !formData.value.school || !formData.value.enrollmentYear || !formData.value.studentId) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
    return;
  }
  
  if (!formData.value.frontImage || !formData.value.backImage) {
    uni.showToast({ title: '请上传学生证照片', icon: 'none' });
    return;
  }
  
  loading.value = true;
  try {
    const authData: PostStudentAuthRequest = {
      real_name: formData.value.realName,
      school: formData.value.school,
      school_name: formData.value.school,
      admission_year: formData.value.enrollmentYear,
      student_id: formData.value.studentId,
      department: '', // 暂时为空，实际应该从表单获取
      major: '', // 暂时为空，实际应该从表单获取
      front_image_url: formData.value.frontImage,
      back_image_url: formData.value.backImage
    };
    
    const response = await postStudentAuth(authData);
    uni.showToast({ title: '提交成功，等待审核' });
    authStatus.value = 'pending';
    statusDesc.value = 'OCR审核中'; // Set initial status description after submission
  } catch (error) {
    console.error('提交认证申请失败:', error);
    uni.showToast({ title: '提交失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const handleCancelAuth = async () => {
  uni.showModal({
    title: '取消认证',
    content: '确定要取消认证申请吗？',
    success: async (res) => {
      if (res.confirm) {
        loading.value = true;
        try {
          await postStudentAuthCancel({ verify_id: 0 }); // 暂时使用默认值，实际应该从认证状态中获取
          uni.showToast({ title: '取消成功' });
          authStatus.value = 'initial';
          statusDesc.value = '';
        } catch (error) {
          console.error('取消认证失败:', error);
          uni.showToast({ title: '取消失败，请重试', icon: 'none' });
        } finally {
          loading.value = false;
        }
      }
    }
  });
};

const resetForm = () => {
  authStatus.value = 'initial';
  statusDesc.value = '';
  formData.value = {
    realName: '',
    school: '',
    enrollmentYear: '',
    studentId: '',
    frontImage: '',
    backImage: ''
  };
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.page-padding {
  padding: $spacing-lg;
}

.notice-bar {
  background-color: #eff6ff;
  border: 1rpx solid #dbeafe;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  @include flex(row, flex-start, flex-start);
  gap: $spacing-sm;
  margin-bottom: $spacing-xl;

  .text {
    flex: 1;
    font-size: $font-size-base;
    color: #1d4ed8;
    line-height: 1.5;
  }
}

.loading-section {
  @include flex(column, center, center);
  gap: $spacing-md;
  padding: $spacing-xl 0;
  
  .loading-text {
    font-size: $font-size-base;
    color: $text-secondary;
  }
}

.status-section {
  @include flex(column, center, center);
  gap: $spacing-md;
  padding: $spacing-xl 0;
  text-align: center;
  
  &.success {
    .status-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
      color: #10b981;
    }
  }
  
  &.pending {
    .status-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
      color: #f59e0b;
    }
  }
  
  &.failed {
    .status-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
      color: #dc2626;
    }
  }
  
  .status-desc {
    font-size: $font-size-base;
    color: $text-tertiary;
    max-width: 80%;
  }
  
  .cancel-btn,
  .retry-btn {
    margin-top: $spacing-lg;
    border-radius: $border-radius-full;
    font-weight: $font-weight-bold;
    font-size: $font-size-sm;
  }
  
  .cancel-btn {
    background-color: #f3f4f6;
    color: $text-secondary;
  }
  
  .retry-btn {
    background-color: #fee2e2;
    color: #dc2626;
  }
}

.form-group {
  margin-bottom: $spacing-xl;
  .input-item {
    margin-bottom: $spacing-md;
    .label {
      font-size: $font-size-base;
      font-weight: $font-weight-bold;
      color: $text-secondary;
      margin-bottom: $spacing-sm;
      display: block;
    }
    .custom-input {
      background-color: $surface-color;
      border: 1rpx solid $border-color;
      border-radius: $border-radius-lg;
      padding: 24rpx;
      font-size: $font-size-sm;
      height: 80rpx;
    }
  }
}

.upload-section {
  .section-title {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: $text-secondary;
    margin-bottom: $spacing-md;
    display: block;
  }
  .upload-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-md;
    
    .upload-box {
      aspect-ratio: 3/2;
      background-color: $surface-color;
      border: 2rpx dashed $border-color;
      border-radius: $border-radius-lg;
      @include flex(column, center, center);
      gap: $spacing-sm;
      color: $text-tertiary;
      position: relative;
      overflow: hidden;

      .icon-container {
        color: $text-tertiary;
      }
      
      .image-preview {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        
        image {
          width: 100%;
          height: 100%;
        }
      }
      
      .upload-text { 
        font-size: $font-size-base; 
        font-weight: $font-weight-normal; 
        color: $text-tertiary;
        position: relative;
        z-index: 1;
      }
    }
  }
}

.submit-btn {
  margin-top: 60rpx;
  background-color: #1e293b;
  color: #fff;
  border-radius: $border-radius-full;
  font-weight: $font-weight-bold;
  font-size: $font-size-sm;
}
</style>