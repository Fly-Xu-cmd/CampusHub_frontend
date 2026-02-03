<template>
  <CommonLayout headerType="standard" title="待参加活动" showBack bgWhite>
    <view class="list-container">
      <view class="activity-card" v-for="i in 2" :key="i">
        <image src="https://picsum.photos/200?random=1" class="cover-img" mode="aspectFill" />
        <view class="info-col">
          <text class="title">奥森公园夜跑</text>
          <view class="meta-row">
            <wd-icon name="time" size="12px" color="#94a3b8" custom-style="margin-right:8rpx"></wd-icon>
            <text class="time">10.24 19:00</text>
          </view>
          <text class="status-tip">倒计时 2天</text>
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
  @include card; // 使用 mixins 里的卡片样式
  border: 1rpx solid $border-light;
  padding: $spacing-sm; // 稍微紧凑一点
  margin-bottom: $spacing-md;
  @include flex(row, flex-start, center);
  gap: $spacing-md;

  .cover-img {
    width: 160rpx;
    height: 160rpx;
    border-radius: $border-radius-md;
    background-color: $background-color;
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
      .time {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }

    .status-tip {
      font-size: $font-size-sm;
      color: $primary-color; // 橙色
      font-weight: $font-weight-bold;
    }
  }
}
</style>