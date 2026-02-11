<template>
	<view class="upload-section">
		<input 
			type="file" 
			accept="image/*,video/*" 
			@change="handleFileChange" 
			style="display: none;" 
			ref="fileInput"
		/>
		<!-- 图片预览 -->
		<view v-if="localFileList.length > 0" class="image-preview">
			<image :src="localFileList[0].url" mode="aspectFill" style="width: 100%; height: 400rpx; border-radius: 12rpx;"></image>
			<view class="preview-actions">
				<button @click="removeFile" style="padding: 8rpx 20rpx; background-color: #f44336; color: white; border-radius: 8rpx;">
					移除
				</button>
			</view>
		</view>
		
		<!-- 上传占位符 -->
		<view 
			v-else
			class="upload-placeholder custom-upload" 
			:class="{ 'upload-hover': isUploadHover }"
			@touchstart="isUploadHover = true" 
			@touchend="isUploadHover = false" 
			@touchcancel="isUploadHover = false"
			@mouseenter="isUploadHover = true" 
			@mouseleave="isUploadHover = false"
			@click="openFileDialog"
		>
			<wd-icon name="camera" size="48rpx" :color="isUploadHover ? '#f97316' : '#999'"></wd-icon>
			<text class="upload-text" :style="{ color: isUploadHover ? '#f97316' : '#6b7280' }">{{ uploadText }}</text>
		</view>
		
	</view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

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
const localFileList = ref<any[]>([...props.fileList])
const fileInput = ref<HTMLInputElement | null>(null)

// 监听外部fileList变化
watch(() => props.fileList, (newValue) => {
	localFileList.value = [...newValue]
}, { deep: true })

// 处理文件选择
function handleFileChange(event: Event) {
	const target = event.target as HTMLInputElement
	const files = target.files
	
	if (files && files.length > 0) {
		const file = files[0]
		
		// 创建文件对象
		const fileObj = {
			name: file.name,
			url: URL.createObjectURL(file), // 创建本地URL
			type: file.type.startsWith('image/') ? 'image' : 'video',
			file: file // 保存原始文件对象
		}
		
		// 更新本地文件列表
		localFileList.value = [fileObj]
		
		// 触发update:fileList事件，更新父组件的fileList
		emit('update:fileList', localFileList.value)
		
		// 触发change事件，提供与原组件相同的回调
		emit('change', localFileList.value)
	}
}

// 移除文件
function removeFile() {
	// 清空本地文件列表
	localFileList.value = []
	
	// 触发update:fileList事件，更新父组件的fileList
	emit('update:fileList', localFileList.value)
	
	// 触发change事件，提供与原组件相同的回调
	emit('change', localFileList.value)
	
	// 重置文件输入元素
	if (fileInput.value) {
		fileInput.value.value = ''
	}
}

// 打开文件选择对话框
function openFileDialog() {
	if (fileInput.value) {
		try {
			fileInput.value.click()
		} catch (error) {
			// 降级方案：创建一个新的input元素并触发点击
			const newInput = document.createElement('input')
			newInput.type = 'file'
			newInput.accept = 'image/*,video/*'
			newInput.style.display = 'none'
			newInput.onchange = handleFileChange
			document.body.appendChild(newInput)
			newInput.click()
			document.body.removeChild(newInput)
		}
	} else {
		// 降级方案：创建一个新的input元素并触发点击
		const newInput = document.createElement('input')
		newInput.type = 'file'
		newInput.accept = 'image/*,video/*'
		newInput.style.display = 'none'
		newInput.onchange = handleFileChange
		document.body.appendChild(newInput)
		newInput.click()
		document.body.removeChild(newInput)
	}
}
</script>

<style scoped>
/* 上传组件样式 */
.upload-section {
	padding: 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.custom-upload {
	width: 100%;
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
	cursor: pointer;
	height: 400rpx;
}

/* 图片预览样式 */
.image-preview {
	position: relative;
	width: 100%;
	max-width: 620rpx;
	height: 400rpx;
	margin-bottom: 0;
}

.image-preview image {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 16rpx;
	border: 2rpx dashed #d1d5db;
}

.preview-actions {
	position: absolute;
	bottom: 16rpx;
	right: 16rpx;
	display: flex;
	gap: 12rpx;
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

/* 图片预览样式 */
.image-preview {
	position: relative;
	width: 100%;
	max-width: 620rpx;
	margin-bottom: 20rpx;
}

.preview-actions {
	position: absolute;
	bottom: 16rpx;
	right: 16rpx;
	display: flex;
	gap: 12rpx;
}

/* 确保图片预览区域的宽度与上传占位符一致 */
.image-preview,
.upload-placeholder {
	width: 100%;
	max-width: 620rpx;
}

</style>