<template>
  <CommonLayout headerType="standard" title="系统消息">
    <!-- 系统通知列表 -->
    <view class="message-list">
      <view class="message-item" v-for="value in 2">   
          <view class="message-header">
            <view class="message-title">审核通过</view>
            <view class="message-time">刚刚</view>
          </view>
          <view class="message-text">
            你报名参加的“奥森公园夜跑”已通过发起人审核，请准时参加。
          </view>
      </view>
    </view>

  </CommonLayout>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
// 消息列表
.message-list {
  padding: $spacing-md;
  .message-item {
    padding: $spacing-md;
    background-color: $surface-color;
    border-radius: $border-radius-xl;
    box-shadow: $shadow-sm;
    margin-bottom: $spacing-md;
    
    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-sm;
      .message-title {
        font-size: $font-size-base;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }
      .message-time {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }
    }
    .message-text {
      display: flex;
      align-items: center;
      font-size: $font-size-xs;
      color: $text-secondary;
      
    }
  }
}
</style>