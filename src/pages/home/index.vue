<template>
  <CommonLayout headerType="home" contentBg="#fff" :showTabBar="true">
    <view class="content">
      <view class="tag-row">...</view>
      <view class="card-list">...</view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">

</script>

<style>
.content{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
