<template>
  <CommonLayout headerType="standard" title="学生认证" showBack bgWhite>
    <view class="page-padding">
      
      <view class="notice-bar">
        <wd-icon class-prefix="iconfont" name="graduation-cap" size="16px" color="#3b82f6"></wd-icon>
        <text class="text">本平台仅对在校大学生开放。请提供真实的学校和学籍信息，认证通过后将获得学生专属标识。</text>
      </view>

      <view class="form-group">
        <view class="input-item" v-for="(label, idx) in ['真实姓名', '学校名称', '入学年份', '学号']" :key="idx">
          <text class="label">{{ label }}</text>
          <input class="custom-input" :placeholder="`请输入${label}`" placeholder-class="ph-style" />
        </view>
      </view>

      <view class="upload-section">
        <text class="section-title">上传学生证/校园卡</text>
        <view class="upload-grid">
          <view class="upload-box" >
            <view class="icon-container">
              <wd-icon class-prefix="iconfont" name="id-card-clip" size="44rpx"></wd-icon>
            </view>
            <text class="upload-text">正面（含照面）</text>
          </view>
          <view class="upload-box" >
            <view class="icon-container">
              <wd-icon class-prefix="iconfont" name="book" size="44rpx"></wd-icon>
            </view>
            <text class="upload-text">详情面</text>
          </view>
        </view>
      </view>

      <button class="submit-btn" hover-class="btn-hover">提交审核</button>
    </view>
  </CommonLayout>
</template>

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

      .icon-container {
        color: $text-tertiary;
      }
      .upload-text { font-size: $font-size-base; font-weight: $font-weight-normal; color: $text-tertiary; }
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