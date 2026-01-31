<template>
	<CommonLayout headerType="standard" title="发布新活动" :showTabBar="true">
		<view class="publish-container">
			<!-- 上传组件 -->
		<view class="upload-section" @click="isUploadHover = false">
			<wd-upload :file-list="fileList" multiple action="" @change="handleChange" class="custom-upload"
				@touchstart="isUploadHover = true" @touchend="isUploadHover = false" @touchcancel="isUploadHover = false"
				@click.stop>
				<view class="upload-placeholder" :class="{ 'upload-hover': isUploadHover }">
					<wd-icon name="camera" size="48rpx" :color="isUploadHover ? '#f97316' : '#999'"></wd-icon>
					<text class="upload-text" :style="{ color: isUploadHover ? '#f97316' : '#6b7280' }">上传活动封面/视频</text>
				</view>
			</wd-upload>
		</view>

			<!-- 活动标题 -->
			<view class="form-item title-item">
				<input type="text" v-model="activityTitle" placeholder="活动标题" class="title-input" placeholder-style="color: #999;">
			</view>

			<!-- 活动信息容器（白色背景） -->
			<view class="form-info-container">
				<!-- 活动时间 -->
				<view class="form-item time-item" @click="togglePicker">
					<view class="form-item-left">
						<view class="icon-container">
							<wd-icon name="clock" size="38rpx" color="#666" />
						</view>
						<view class="text-content">
							<text class="form-label">活动时间</text>
							<text class="form-value">设置开始 ~ 结束时间</text>
						</view>
					</view>
					<view class="form-item-right">
						<wd-icon name="arrow-right" size="24rpx" color="#999" />
					</view>
				</view>

				<!-- 活动地点 -->
				<view class="form-item location-item" @click="selectLocation">
					<view class="form-item-left">
						<view class="icon-container">
							<view class="iconfont iconfont-location" style="font-size: 40rpx; color: #6b7280;"></view>
						</view>
						<view class="text-content">
							<text class="form-label">活动地点</text>
							<text class="form-value location-total">{{ locationName }}</text>
						</view>
					</view>
					<view class="form-item-right">
						<wd-icon name="arrow-right" size="24rpx" color="#999" />
					</view>
				</view>

				<!-- 人数限制 -->
				<view class="form-item people-item">
					<view class="form-item-left">
						<view class="icon-container">
							<view class="iconfont iconfont-people" style="font-size: 40rpx; color: #666;"></view>
						</view>
						<view class="text-content">
							<text class="form-label">人数限制</text>
							<text class="form-value">设置最大参与人数</text>
						</view>
					</view>
					<view class="form-item-right">
						<view class="number-input-container">
							<input type="number" v-model="peopleLimit" class="number-input" min="1" max="1000">
							<text class="people-unit">人</text>
						</view>
					</view>
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
			<view v-show="isShowPicker" class="picker-mask"></view>

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

<script setup lang="ts">
import '@/styles/iconfont.css'
import {
	useToast,
} from 'wot-design-uni'
import {
	ref,
	computed,
} from 'vue'
import { usePublishStore } from '@/store/publish'

	const toast = useToast()
	const publishStore = usePublishStore()
	const startValue = ref<number>(Date.now())
	const endValue = ref<number>(Date.now())
	const isShowPicker = ref<boolean>(false)
	const isUploadHover = ref<boolean>(false)
	const activityTitle = ref<string>('')
	const activityDetail = ref<string>('')
	const fileList = ref<any[]>([])
	const peopleLimit = ref<number>(20)
	const locationName = ref<string>('选择线下地点')
	const locationAddress = ref<string>('')
	const locationLatitude = ref<number>(0)
	const locationLongitude = ref<number>(0)





	// 格式化日期为 YYYY-MM-DD HH:mm：原有逻辑不变
	const timeRange = computed<string>(() => {
		if (!startValue.value || !endValue.value) return ''
		const formatDate = (time: number) => {
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
	const togglePicker = (): void => {
		isShowPicker.value = !isShowPicker.value
	}
	// 新增：单独的隐藏组件方法（失去焦点/点击遮罩时调用）
	const hidePicker = (): void => {
		isShowPicker.value = false
	}

	// 时间选择回调：添加日期验证逻辑
	const onStartChange = (event: any): void => {
		// 处理不同格式的事件参数
		const value = event.value || event.detail?.value || event
		// 确保value是number类型
		const numericValue = typeof value === 'number' ? value : Number(value) || Date.now()
		startValue.value = numericValue
		// 确保结束日期不早于开始日期
		if (endValue.value < startValue.value) {
			endValue.value = startValue.value
			publishStore.setEndTime(startValue.value)

		}
	}
	const onEndChange = (event: any): void => {
		// 处理不同格式的事件参数
		const value = event.value || event.detail?.value || event
		// 确保value是number类型
		const numericValue = typeof value === 'number' ? value : Number(value) || Date.now()
		// 确保结束日期不早于开始日期
		if (numericValue < startValue.value) {

			// 重置为开始日期
			endValue.value = startValue.value
			publishStore.setEndTime(startValue.value)
			return
		}
		endValue.value = numericValue
		publishStore.setEndTime(numericValue)
	}

	// 处理文件上传
	const handleChange = (files: any[]): void => {
		fileList.value = files
	}

	// 打开位置选择器
	const openLocationPicker = (): void => {
		// #ifdef MP-WEIXIN
		// 使用微信小程序的选择位置API（底层使用高德地图）
		uni.chooseLocation({
			latitude: 39.9042, // 默认北京
			longitude: 116.4074,
			scale: 16,
			success: (res) => {
				locationName.value = res.name
				locationAddress.value = res.address
				locationLatitude.value = res.latitude
				locationLongitude.value = res.longitude
				console.log('选择的位置:', res)
			},
			fail: (err: UniApp.GeneralCallbackResult)  => {
				console.error('选择位置失败:', err)
			}
		})
		// #endif
	}

	// 选择线下地点 - 使用高德地图API
	const selectLocation = (): void => {
		// #ifdef MP-WEIXIN
		// 检查位置权限
		uni.getSetting({
			success: (res) => {
				if (!res.authSetting['scope.userLocation']) {
					// 请求位置权限
					uni.authorize({
						scope: 'scope.userLocation',
						success: () => {
							// 权限获取成功，打开位置选择
							openLocationPicker()
						},
						fail: () => {
							// 权限获取失败，引导用户手动开启
							uni.showModal({
								title: '需要位置权限',
								content: '请在设置中开启位置权限，以便选择活动地点',
								confirmText: '去设置',
								cancelText: '取消',
								success: (modalRes) => {
									if (modalRes.confirm) {
										uni.openSetting()
									}
								}
							})
						}
					})
				} else {
					// 已有权限，直接打开位置选择
					openLocationPicker()
				}
			}
		})
		// #endif
	}
</script>

<style>
	/* 发布页面容器 */
	.publish-container {
		width: 100%;
		box-sizing: border-box;
		background-color: #f5f5f5;
	}

	/* 隐藏滚动条 */
	::-webkit-scrollbar {
		display: none;
	}

	/* 活动信息容器（白色背景） */
	.form-info-container {
		background-color: #ffffff;
		padding: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
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
		height: 120rpx;
		padding: 0 30rpx;
		background-color: #fff;
		box-sizing: border-box;
	}

	/* 时间、地点、人数限制的特殊样式 */
	.time-item, .location-item, .people-item {
		margin: 30rpx 0;
		padding: 20rpx;
		border-radius: 16rpx;
		background-color: #f8f9fa;
		border: none;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	}

	.form-item-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	/* 图标容器样式 */
	.icon-container {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background-color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	}

	.text-content {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.form-label {
		font-size: 30rpx;
		color: #333;
		font-weight: 600;
		margin-left: 70rpx;
		text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
	}

	.form-item-right {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	/* 人数限制的右侧区域特殊样式 */
	.people-item .form-item-right {
		margin-left: -20rpx;
	}

	.form-value {
		font-size: 26rpx;
		color: #999;
		margin-left: 70rpx;
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

	/* 人数输入容器 */
	.number-input-container {
		display: flex;
		align-items: center;
		gap: 8rpx;
		background: #ffffff;
		padding: 0 10rpx;
		border-radius: 8rpx;
	}

	/* 人数输入框 */
	.number-input {
		width: 80rpx;
		height: 40rpx;
		font-size: 26rpx;
		color: #333;
		font-weight: 500;
		text-align: center;
		border: none;
		background: transparent;
	}

	/* 人数单位 */
	.people-unit {
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

	/* 自定义标题样式：调整宽度和位置，避免与提交按钮重叠 */
	:deep(.standard-header .nav-title) {
		transform: translateX(-90rpx);
	}

	/* 自定义提交按钮样式：右移20rpx */
	:deep(.standard-header .nav-right) {
		transform: translateX(35rpx);
	}
</style>