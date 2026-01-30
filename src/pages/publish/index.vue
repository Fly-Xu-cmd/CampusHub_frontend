<template>
	<CommonLayout headerType="standard" title="发布新活动" :showTabBar="true">
		<wd-upload :file-list="fileList" multiple action="" @change="handleChange"></wd-upload>



		<view class="container" style="padding: 30rpx; position: relative; z-index: 1;">
			<!-- 自定义时间切换盒子：原有代码不变 -->
			<view class="time-item" @click="togglePicker">
				<view class="time-item-left">
					<wd-icon name="clock" size="28rpx" color="#666" />
					<text class="time-label">活动时间</text>
				</view>
				<view class="time-item-right">
					<text class="time-value">
						{{ timeRange ? timeRange : '设置开始~结束时间' }}
					</text>
					<wd-icon name="arrow-right" size="24rpx" color="#999" />
				</view>
			</view>

			<!-- 新增：全屏遮罩层 - 点击遮罩（失去焦点）隐藏组件 -->
			<view v-show="isShowPicker" class="picker-mask" @click="hidePicker"></view>

			<!-- 组件包裹层：新增z-index高于遮罩，避免被遮挡；点击自身不触发遮罩事件 -->
			<view v-show="isShowPicker" class="picker-wrap" @click.stop>
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

	// 原有时间选择回调：不变
	const onStartChange = ({
		value
	}) => {
		startValue.value = value
	}
	const onEndChange = ({
		value
	}) => {
		endValue.value = value
		publishStore.setEndTime(value)
	}
</script>

<style>
	/* 头部容器：吸顶、flex布局、边框、背景色，和原样式一致 */
	.header-wrap {
		padding: 30rpx 40rpx;
		/* 对应原px-6 py-5，1px≈2rpx适配750设计稿 */
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1rpx solid #f0f0f0;
		/* 对应原border-gray-50 */
		position: sticky;
		top: 0;
		background-color: #ffffff;
		z-index: 10;
		box-sizing: border-box;
		width: 100%;
	}

	/* 左侧关闭按钮：圆形灰色背景、居中 */
	.close-btn {
		width: 50rpx;
		height: 50rpx;
		border-radius: 50%;
		background-color: #f5f5f5;
		/* 对应原bg-gray-100 */
		display: flex;
		align-items: center;
		justify-content: center;
		color: #666666;
	}

	/* 中间标题：基础字号、加粗、深灰色 */
	.header-title {
		font-size: 32rpx;
		/* 对应原text-base */
		font-weight: bold;
		color: #1f2937;
		/* 对应原text-gray-900 */
	}

	/* 右侧提交按钮：橙白配色、圆角、内边距，和原样式一致 */
	.submit-btn {
		color: #f97316;
		/* 对应原text-orange-500 */
		font-weight: bold;
		font-size: 28rpx;
		/* 对应原text-sm */
		background-color: #fff7ed;
		/* 对应原bg-orange-50 */
		padding: 10rpx 28rpx;
		/* 对应原px-4 py-1.5 */
		border-radius: 100rpx;
		/* 对应原rounded-full */
		line-height: 1;
	}

	/* 整体容器：原有样式不变 */
	.container {
		box-sizing: border-box;

	}

	/* 自定义切换盒子：原有样式完全不变 */
	.time-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 100rpx;
		padding: 5rpx 5rpx;
		background-color: #fff;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.time-item-left {
		display: flex;
		align-items: center;
		gap: 26rpx;
	}

	.time-label {
		font-size: 20rpx;
		color: #333;
		font-weight: 500;
	}

	.time-item-right {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.time-value {
		font-size: 26rpx;
		color: #999;
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

	/* 组件包裹层：原有样式不变，仅新增z-index和position */
	.picker-wrap {
		position: relative;
		/* 配合z-index生效 */
		z-index: 1000;
		/* 高于遮罩，保证组件在最上层 */
		margin-top: 16rpx;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 20rpx;
	}
</style>