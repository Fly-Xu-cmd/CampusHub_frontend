<template>
  <view v-if="isMounted">
    <slot></slot>
  </view>
  <view v-else>
    <slot name="placeholder"></slot>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});
</script>