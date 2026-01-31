<template>
	<CommonLayout headerType="standard" title="发布新活动" :showTabBar="true">
		<view class="publish-container">
			<!-- 上传组件 -->
			<view class="upload-section">
				<wd-upload :file-list="fileList" multiple action="" @change="handleChange" class="custom-upload">
					<view class="upload-placeholder">
						<wd-icon name="camera" size="48rpx" color="#999"></wd-icon>
						<text class="upload-text">上传活动封面/视频</text>
					</view>
				</wd-upload>
			</view>

			<!-- 活动标题 -->
			<view class="form-item">
				<input type="text" v-model="activityTitle" placeholder="活动标题" class="title-input" placeholder-style="color: #999;">
			</view>

			<!-- 活动时间 -->
			<view class="form-item" @click="togglePicker">
				<view class="form-item-left">
					<wd-icon name="clock" size="28rpx" color="#666" />
					<text class="form-label">活动时间</text>
				</view>
				<view class="form-item-right">
					<wd-icon name="arrow-right" size="24rpx" color="#999" />
				</view>
			</view>

			<!-- 活动地点 -->
			<view class="form-item">
				<view class="form-item-left">
					<wd-icon name="location" size="28rpx" color="#666" />
					<text class="form-label">活动地点</text>
				</view>
				<view class="form-item-right">
					<text class="form-value">选择线下地点</text>
					<wd-icon name="arrow-right" size="24rpx" color="#999" />
				</view>
			</view>

			<!-- 人数限制 -->
			<view class="form-item">
				<view class="form-item-left">
					<wd-icon name="users" size="28rpx" color="#666" />
					<text class="form-label">人数限制</text>
				</view>
				<view class="form-item-right">
					<text class="form-value">设置最大参与人数</text>
					<text class="number-limit">20 人</text>
				</view>
			</view>

			<!-- 活动标签 -->
			<view class="tags-section">
				<text class="section-title">活动标签</text>
				<view class="tags-container">
					<view class="tag-item active">运动</view>
					<view class="tag-item">聚会</view>
					<view class="tag-item add-tag">+ 添加</view>
				</view>
			</view>

			<!-- 活动详情 -->
			<view class="detail-section">
				<text class="section-title">活动详情</text>
				<textarea v-model="activityDetail" placeholder="输入详细的活动流程、注意事项等..." class="detail-textarea" placeholder-style="color: #999;"></textarea>
			</view>

			<!-- 全屏遮罩层 -->
			<view v-show="isShowPicker" class="picker-mask" @click="hidePicker"></view>

			<!-- 组件包裹层：新增z-index高于遮罩，避免被遮挡；点击自身不触发遮罩事件 -->
			<view v-show="isShowPicker" class="picker-wrap" @click.stop>
				<!-- 新增：顶部确定按钮 -->
				<view class="picker-header">
					<view class="confirm-btn" @click="hidePicker">确定</view>
				</view>
				<!-- 日期选择组件：原有代码、样式属性完全不变 -->
				<wd-datetime-picker-view v-model="startValue" label="开始时间" @change="onStartChange" font-size="26rpx"
					label-width="60rpx" picker-height="40rpx" style="margin-bottom: 20rpx;" />
				<wd-datetime-picker-view v-model="endValue" label="结束时间" @change="onEndChange" font-size="26rpx"
					label-width="60rpx" picker-height="40rpx" />
			</view>
		</view>
	</CommonLayout>
</template>

<script setup>
	import {
		useToast
	} from 'wot-design-uni'
	import {
		ref,
		computed
	} from 'vue'
	import { usePublishStore } from '@/store/publish'

	const toast = useToast()
	const publishStore = usePublishStore()
	const startValue = ref(Date.now())
	const endValue = ref(Date.now())
	const isShowPicker = ref(false)
	const activityTitle = ref('')
	const activityDetail = ref('')
	const fileList = ref([])

	// 格式化日期为 YYYY-MM-DD HH:mm：原有逻辑不变
	const timeRange = computed(() => {
		if (!startValue.value || !endValue.value) return ''
		const formatDate = (time) => {
			const date = new Date(time)
			const year = date.getFullYear()
			const month = (date.getMonth() + 1).toString().padStart(2, '0')
			const day = date.getDate().toString().padStart(2, '0')
			const hours = date.getHours().toString().padStart(2, '0')
			const minutes = date.getMinutes().toString().padStart(2, '0')
			return `${year}-${month}-${day} ${hours}:${minutes}`
		}
		return `${formatDate(startValue.value)} ~ ${formatDate(endValue.value)}`
	})

	// 原有：切换组件显示/隐藏
	const togglePicker = () => {
		isShowPicker.value = !isShowPicker.value
	}
	// 新增：单独的隐藏组件方法（失去焦点/点击遮罩时调用）
	const hidePicker = () => {
		isShowPicker.value = false
	}

	// 时间选择回调：添加日期验证逻辑
	const onStartChange = (event) => {
		// 处理不同格式的事件参数
		const value = event.value || event.detail?.value || event
		startValue.value = value
		// 确保结束日期不早于开始日期
		if (endValue.value < startValue.value) {
			endValue.value = startValue.value
			publishStore.setEndTime(startValue.value)
			toast({
				message: '结束日期不能早于开始日期',
				type: 'warning',
				duration: 2000
			})
		}
	}
	const onEndChange = (event) => {
		// 处理不同格式的事件参数
		const value = event.value || event.detail?.value || event
		// 确保结束日期不早于开始日期
		if (value < startValue.value) {
			toast({
				message: '结束日期不能早于开始日期',
				type: 'warning',
				duration: 2000
			})
			// 重置为开始日期
			endValue.value = startValue.value
			publishStore.setEndTime(startValue.value)
			return
		}
		endValue.value = value
		publishStore.setEndTime(value)
	}

	// 处理文件上传
	const handleChange = (files) => {
		fileList.value = files
	}
</script>

<style>
	/* 发布页面容器 */
	.publish-container {
		width: 100%;
		box-sizing: border-box;
	}

	/* 上传组件样式 */
	.upload-section {
		padding: 30rpx;
		display: flex;
		justify-content: center;
	}

	.custom-upload {
		width: 100%;
		flex: 1;
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
	:deep(.wd-upload *) {
		width: 100% !important;
		max-width: 100% !important;
		box-sizing: border-box !important;
	}

	/* 确保图标和文字居中显示 */
	:deep(.wd-icon) {
		display: block !important;
		margin: 0 auto !important;
		text-align: center !important;
	}

	/* 确保图标容器也居中 */
	:deep(.wd-icon-container) {
		display: flex !important;
		justify-content: center !important;
		align-items: center !important;
		width: 100% !important;
	}

	/* 表单项目样式 */
	.form-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 100rpx;
		padding: 0 30rpx;
		background-color: #fff;
		border-bottom: 1rpx solid #f0f0f0;
		box-sizing: border-box;
	}

	.form-item-left {
		display: flex;
		align-items: center;
		gap: 26rpx;
	}

	.form-label {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.form-item-right {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.form-value {
		font-size: 26rpx;
		color: #999;
	}

	/* 活动标题输入框 */
	.title-input {
		width: 100%;
		height: 100rpx;
		padding: 0 30rpx;
		font-size: 28rpx;
		color: #333;
		background-color: #fff;
		border-bottom: 1rpx solid #f0f0f0;
		box-sizing: border-box;
	}

	/* 人数限制 */
	.number-limit {
		font-size: 26rpx;
		color: #333;
		font-weight: 500;
	}

	/* 标签部分 */
	.tags-section {
		padding: 30rpx;
		background-color: #fff;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.section-title {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		margin-bottom: 20rpx;
	}

	.tags-container {
		display: flex;
		gap: 20rpx;
		flex-wrap: wrap;
	}

	.tag-item {
		padding: 12rpx 24rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		background-color: #f5f5f5;
		color: #666;
	}

	.tag-item.active {
		background-color: #fff7ed;
		color: #f97316;
	}

	.tag-item.add-tag {
		border: 1rpx dashed #d1d5db;
		background-color: transparent;
	}

	/* 详情部分 */
	.detail-section {
		padding: 30rpx;
		background-color: #fff;
	}

	.detail-textarea {
		width: 100%;
		min-height: 200rpx;
		padding: 20rpx;
		font-size: 26rpx;
		color: #333;
		border: 1rpx solid #f0f0f0;
		border-radius: 16rpx;
		box-sizing: border-box;
		resize: none;
	}

	/* 新增：遮罩层样式 - 全屏、半透明、覆盖整个页面 */
	.picker-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.1);
		/* 淡灰色遮罩，可调整透明度 */
		z-index: 999;
		/* 遮罩层级低于组件，高于页面其他内容 */
	}

	/* 组件包裹层：使用fixed定位确保在屏幕上正确显示 */
	.picker-wrap {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		/* 配合z-index生效 */
		z-index: 1000;
		/* 高于遮罩，保证组件在最上层 */
		background-color: #fff;
		border-radius: 16rpx;
		padding: 20rpx;
		width: 90%;
		max-width: 500rpx;
	}

	/* 新增：顶部确定按钮容器 */
	.picker-header {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 20rpx;
	}

	/* 新增：确定按钮样式 */
	.confirm-btn {
		padding: 10rpx 40rpx;
		background-color: #f97316;
		color: #fff;
		border-radius: 20rpx;
		font-size: 24rpx;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.confirm-btn:hover {
		background-color: #ea580c;
	}

	/* 自定义标题样式：左移60rpx */
	:deep(.standard-header .nav-title) {
		transform: translateX(-60rpx);
	}

	/* 自定义提交按钮样式：右移20rpx */
	:deep(.standard-header .nav-right) {
		transform: translateX(35rpx);
	}
</style>