<template>
  <div class="async-error">
    <div class="error-icon">⚠️</div>
    <h3 class="error-title">加载失败</h3>
    <p class="error-message">{{ errorMessage }}</p>
    <button class="retry-button" @click="onRetry">重试</button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  errorMessage: {
    type: String,
    default: '页面加载失败，请稍后重试'
  }
});

const emit = defineEmits<{
  (e: 'retry'): void
}>();

const onRetry = () => {
  emit('retry');
};
</script>

<style scoped>
.async-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  background-color: #f8f8f8;
  padding: 0 20px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.error-message {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

.retry-button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #2980b9;
}
</style>