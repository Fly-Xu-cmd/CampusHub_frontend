<template>
  <CommonLayout headerType="standard" title="历史记录" showBack bgWhite>
    <view class="list-container">
      <view class="activity-card ended" v-for="i in 3" :key="i">
        <image src="https://picsum.photos/200?random=5" class="cover-img" mode="aspectFill" />
        <view class="info-col">
          <text class="title">读书分享会</text>
          <view class="meta-row">
            <wd-icon name="time" size="12px" color="#94a3b8" custom-style="margin-right:8rpx"></wd-icon>
            <text class="time">10.10</text>
          </view>
          <text class="status-tip">已结束</text>
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.list-container {
  padding: $spacing-md;
}

.activity-card {
  @include card;
  border: 1rpx solid $border-light;
  padding: $spacing-sm;
  margin-bottom: $spacing-md;
  @include flex(row, flex-start, center);
  gap: $spacing-md;

  // --- 历史记录特有样式 ---
  &.ended {
    opacity: 0.6; // 整体半透明
    .cover-img {
      filter: grayscale(100%); // 图片黑白
    }
  }

  .cover-img {
    width: 160rpx;
    height: 160rpx;
    border-radius: $border-radius-md;
  }

  .info-col {
    flex: 1;
    height: 160rpx;
    @include flex(column, space-between, flex-start);
    padding: 4rpx 0;

    .title {
      font-size: $font-size-base;
      font-weight: $font-weight-bold;
      color: $text-primary;
    }

    .meta-row {
      @include flex(row, flex-start, center);
      .time { font-size: $font-size-sm; color: $text-secondary; }
    }

    .status-tip {
      font-size: $font-size-sm;
      color: $text-tertiary; // 灰色
      font-weight: $font-weight-bold;
    }
  }
}
</style>