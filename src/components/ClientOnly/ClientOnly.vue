<template>
  <view class="client-only">
    <view v-if="hasMounted" class="client-only-content">
      <slot></slot>
    </view>
    <view v-else class="client-only-placeholder">
      <slot name="placeholder">
        <view class="skeleton-wrapper">
          <view class="skeleton-avatar"></view>
          <view class="skeleton-lines">
            <view class="skeleton-line"></view>
            <view class="skeleton-line short"></view>
          </view>
        </view>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const hasMounted = ref(false);

onMounted(() => {
  hasMounted.value = true;
});
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.client-only {
  width: 100%;
  height: 100%;
  @include flex(column, center, center);
  .client-only-content {
    @include flex(column, center, center);
    width: 100%;
    height: 100%;
    flex: 1;
  }
}
.client-only-placeholder {
  min-height: 400rpx;
  padding: 40rpx;
}

.skeleton-wrapper {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.skeleton-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.skeleton-line {
  height: 32rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;

  &.short {
    width: 60%;
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
