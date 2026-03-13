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
			<view class="preview-container">
				<image :src="localFileList[0].url" mode="aspectFill" class="preview-image"></image>
				<view v-if="localFileList[0].type === 'video'" class="video-indicator">
					<wd-icon name="play-circle" size="60rpx" color="rgba(255, 255, 255, 0.9)"></wd-icon>
				</view>
			</view>
			<view class="preview-actions">
				<button @click="removeFile" class="remove-btn">
					<wd-icon name="delete" size="24rpx" color="#fff"></wd-icon>
					<text style="margin-left: 8rpx;">移除</text>
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
			<view class="upload-icon-container">
				<wd-icon name="camera" size="56rpx" :color="isUploadHover ? '#f97316' : '#999'"></wd-icon>
			</view>
			<text class="upload-text" :style="{ color: isUploadHover ? '#f97316' : '#6b7280' }">{{ uploadText }}</text>
			<text class="upload-hint" :style="{ color: isUploadHover ? '#f97316' : '#9ca3af' }">支持图片和视频格式</text>
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

<style lang="scss" scoped>
@import '@/styles/variables.scss';

/* 上传组件样式 */
.upload-section {
	margin: 30rpx;
	padding: 24rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	background-color: #ffffff;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
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
	border: 2rpx dashed #e5e7eb;
	border-radius: 16rpx;
	background-color: #f9fafb;
	gap: 16rpx;
	width: 100% !important;
	max-width: 100% !important;
	transition: all 0.3s ease;
	cursor: pointer;
	height: 400rpx;
	position: relative;
	overflow: hidden;
}

/* 上传图标容器 */
.upload-icon-container {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background-color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease;
	margin-bottom: 8rpx;
}

.upload-placeholder.upload-hover .upload-icon-container {
	transform: scale(1.1);
	box-shadow: 0 6rpx 16rpx rgba(249, 115, 22, 0.2);
}

/* 上传文字 */
.upload-text {
	font-size: 28rpx;
	font-weight: 500;
	color: #6b7280;
	text-align: center !important;
	display: block !important;
	transition: color 0.3s ease;
}

/* 上传提示文字 */
.upload-hint {
	font-size: 22rpx;
	color: #9ca3af;
	text-align: center !important;
	display: block !important;
	transition: color 0.3s ease;
	margin-top: 4rpx;
}

/* 图片预览样式 */
.image-preview {
	position: relative;
	width: 100%;
	max-width: 620rpx;
	height: 400rpx;
	margin-bottom: 0;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 预览容器 */
.preview-container {
	position: relative;
	width: 100%;
	height: 100%;
	border-radius: 16rpx;
	overflow: hidden;
}

/* 预览图片 */
.preview-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 16rpx;
	transition: transform 0.3s ease;
}

.image-preview:hover .preview-image {
	transform: scale(1.02);
}

/* 视频指示器 */
.video-indicator {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(8rpx);
	animation: pulse 2s infinite;
}

@keyframes pulse {
	0% {
		box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
	}
	70% {
		box-shadow: 0 0 0 20rpx rgba(255, 255, 255, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
	}
}

/* 预览操作按钮 */
.preview-actions {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 20rpx;
	background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
	display: flex;
	justify-content: flex-end;
	gap: 12rpx;
	transform: translateY(100%);
	transition: transform 0.3s ease;
}

.image-preview:hover .preview-actions {
	transform: translateY(0);
}

/* 移除按钮 */
.remove-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 12rpx 24rpx;
	background-color: rgba(244, 67, 54, 0.9);
	color: white;
	border-radius: 12rpx;
	font-size: 24rpx;
	font-weight: 500;
	transition: all 0.3s ease;
	border: none;
}

.remove-btn:hover {
	background-color: rgba(211, 47, 47, 0.9);
	transform: translateY(-2rpx);
	box-shadow: 0 4rpx 12rpx rgba(244, 67, 54, 0.4);
}

/* 悬停效果 */
.upload-placeholder.upload-hover {
	border-color: #f97316;
	background-color: #fff7ed;
	box-shadow: 0 6rpx 16rpx rgba(249, 115, 22, 0.15);
}

.upload-placeholder:hover {
	border-color: #f97316;
	background-color: #fff7ed;
	box-shadow: 0 6rpx 16rpx rgba(249, 115, 22, 0.15);
}

.upload-placeholder:hover .upload-text {
	color: #f97316;
}

.upload-placeholder:hover .upload-hint {
	color: #f97316;
}

.upload-placeholder:hover :deep(.wd-icon) {
	color: #f97316 !important;
}

/* 确保图片预览区域的宽度与上传占位符一致 */
.image-preview,
.upload-placeholder {
	width: 100%;
	max-width: 620rpx;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
	.upload-section {
		margin: 20rpx;
		padding: 16rpx;
	}
	
	.custom-upload {
		min-width: 100%;
	}
	
	.upload-placeholder {
		padding: 60rpx 0;
		height: 320rpx;
	}
	
	.image-preview {
		height: 320rpx;
	}
	
	.upload-icon-container {
		width: 80rpx;
		height: 80rpx;
	}
	
	.upload-icon-container :deep(.wd-icon) {
		size: 48rpx !important;
	}
	
	.upload-text {
		font-size: 24rpx;
	}
	
	.upload-hint {
		font-size: 20rpx;
	}
}

</style>