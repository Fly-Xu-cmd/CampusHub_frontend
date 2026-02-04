<template>
	<view class="upload-section">
		<wd-upload :file-list="fileList" multiple action="" @change="handleChange" >
			<view class="upload-placeholder custom-upload" :class="{ 'upload-hover': isUploadHover }"
				@touchstart="isUploadHover = true" @touchend="isUploadHover = false" @touchcancel="isUploadHover = false"
				@mouseenter="isUploadHover = true" @mouseleave="isUploadHover = false"
				@click="isUploadHover = false">
				<wd-icon name="camera" size="48rpx" :color="isUploadHover ? '#f97316' : '#999'"></wd-icon>
				<text class="upload-text" :style="{ color: isUploadHover ? '#f97316' : '#6b7280' }">{{ uploadText }}</text>
			</view>
		</wd-upload>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 定义组件的props
const props = defineProps({
	fileList: {
	
type: Array,
		default: () => []
	},
	uploadText: {
	
type: String,
		default: '上传活动封面/视频'
	}
})

// 定义组件的emits
const emit = defineEmits([
	'update:fileList',
	'change'
])

// 本地状态，用于处理组件内部的状态变化
const isUploadHover = ref<boolean>(false)

// 处理文件上传
const handleChange = (files: any[]): void => {
	// 触发update:fileList事件，更新父组件的fileList
	emit('update:fileList', files)
	// 触发change事件，提供与原组件相同的回调
	emit('change', files)
}
</script>

<style scoped>
/* 上传组件样式 */
.upload-section {
	padding: 30rpx;
	display: flex;
	justify-content: center;
}

.custom-upload {
	width: 100%;
	flex: 1;
	min-width: 620rpx;
}

.upload-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 0;
	border: 2rpx dashed #d1d5db;
	border-radius: 16rpx;
	background-color: #f9fafb;
	gap: 16rpx;
	width: 100% !important;
	max-width: 100% !important;
	transition: all 0.3s ease;
}

.upload-placeholder.upload-hover {
	border-color: #f97316;
	box-shadow: 0 4rpx 12rpx rgba(249, 115, 22, 0.15);
}

.upload-placeholder:hover {
	border-color: #f97316;
	box-shadow: 0 4rpx 12rpx rgba(249, 115, 22, 0.15);
}

.upload-placeholder:hover .upload-text {
	color: #f97316;
}

.upload-placeholder:hover :deep(.wd-icon) {
	color: #f97316 !important;
}

.upload-text {
	font-size: 26rpx;
	color: #6b7280;
	text-align: center !important;
	display: block !important;
}

/* 确保上传组件占据整行 */
:deep(.wd-upload) {
	width: 100% !important;
	max-width: 100% !important;
	display: block !important;
}

:deep(.wd-upload__slot) {
	width: 100% !important;
	max-width: 100% !important;
	display: block !important;
}

:deep(.wd-upload__trigger) {
	width: 100% !important;
	max-width: 100% !important;
	display: block !important;
}

/* 确保所有wd-upload内部元素都占据整行 */
:deep(.wd-upload ) {
	width: 100% !important;
	max-width: 100% !important;
	box-sizing: border-box !important;
}
</style>