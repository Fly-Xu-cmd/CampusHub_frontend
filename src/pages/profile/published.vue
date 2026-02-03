<template>
  <CommonLayout headerType="standard" title="我发布的" showBack bgWhite>
    <view class="empty-container">
      <wd-icon name="folder" size="64px" color="#cbd5e1"></wd-icon>
      <text class="empty-text">暂无发布活动</text>
    </view>
  </CommonLayout>
</template>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.empty-container {
  height: 60vh;
  @include flex(column, center, center);
  gap: $spacing-md;
  
  .empty-text {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }
}
</style>