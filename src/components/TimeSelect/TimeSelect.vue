<template>
	<view>
		<!-- 时间选择触发按钮 -->
		<view class="form-item time-item" @click="toggle">
			<view class="form-item-left">
				<view class="icon-container">
					<wd-icon name="clock" size="38rpx" color="#666" />
				</view>
				<view class="text-content">
					<text class="form-label">{{ label }}</text>
					<text class="form-value">设置开始 ~ 结束时间</text>
				</view>
			</view>
			<view class="form-item-right">
				<wd-icon name="arrow-right" size="24rpx" color="#999" />
			</view>
		</view>

		<!-- 全屏遮罩层 -->
		<view v-show="isShowPicker" class="picker-mask"></view>

		<!-- 组件包裹层：新增z-index高于遮罩，避免被遮挡；点击自身不触发遮罩事件 -->
		<view v-show="isShowPicker" class="picker-wrap" @click.stop>
			<!-- 新增：顶部确定按钮 -->
			<view class="picker-header">
				<view class="confirm-btn" @click="hide">确定</view>
			</view>
			<!-- 日期选择组件 -->
			<view class="picker-section">
				<text class="picker-section-label">开始时间</text>
				<wd-datetime-picker-view v-model="localStartValue" @change="onStartChange" font-size="26rpx"
					label-width="0rpx" picker-height="40rpx" style="margin-bottom: 20rpx;" />
			</view>
			<view class="picker-section">
				<text class="picker-section-label">结束时间</text>
				<wd-datetime-picker-view v-model="localEndValue" @change="onEndChange" font-size="26rpx"
					label-width="0rpx" picker-height="40rpx" />
			</view>
			<!-- 错误信息显示 -->
			<view v-if="errorMessage" class="time-error-message">
				{{ errorMessage }}
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// 定义组件的props
const props = defineProps({
	label: {
	
type: String,
		default: '活动时间'
	},
	startValue: {
	
type: Number,
		default: Date.now()
	},
	endValue: {
	
type: Number,
		default: Date.now()
	},
	isShowPicker: {
	
type: Boolean,
		default: false
	},
	errorMessage: {
	
type: String,
		default: ''
	}
})

// 定义组件的emits
const emit = defineEmits([
	'update:startValue',
	'update:endValue',
	'update:isShowPicker',
	'update:errorMessage',
	'toggle'
])

// 本地状态，用于处理组件内部的状态变化
const localStartValue = ref(props.startValue)
const localEndValue = ref(props.endValue)
const localErrorMessage = ref(props.errorMessage)

// 监听props的变化，更新本地状态
watch(() => props.startValue, (newValue) => {
	localStartValue.value = newValue
})

watch(() => props.endValue, (newValue) => {
	localEndValue.value = newValue
})

watch(() => props.errorMessage, (newValue) => {
	localErrorMessage.value = newValue
})

// 切换选择器显示/隐藏
const toggle = (): void => {
	emit('toggle')
}

// 隐藏选择器
const hide = (): void => {
	emit('update:isShowPicker', false)
}

// 时间选择回调：移除日期验证逻辑
const onStartChange = (event: any): void => {
	// 处理不同格式的事件参数
	const value = event.value || event.detail?.value || event
	// 确保value是number类型
	const numericValue = typeof value === 'number' ? value : Number(value) || Date.now()
	localStartValue.value = numericValue
	emit('update:startValue', numericValue)
	// 清除错误信息
	localErrorMessage.value = ''
	emit('update:errorMessage', '')
}

const onEndChange = (event: any): void => {
	// 处理不同格式的事件参数
	const value = event.value || event.detail?.value || event
	// 确保value是number类型
	const numericValue = typeof value === 'number' ? value : Number(value) || Date.now()
	
	// 清除错误信息
	localErrorMessage.value = ''
	emit('update:errorMessage', '')
	localEndValue.value = numericValue
	emit('update:endValue', numericValue)
}
</script>

<style scoped>
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
.time-item {
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

.form-value {
	font-size: 26rpx;
	color: #999;
	margin-left: 70rpx;
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

/* 错误信息样式 */
.time-error-message {
	margin-top: 20rpx;
	font-size: 22rpx;
	color: #ef4444;
	text-align: center;
	padding: 10rpx;
	background-color: #fef2f2;
	border-radius: 8rpx;
	border: 1rpx solid #fee2e2;
}

/* 选择器部分样式 */
.picker-section {
	margin-bottom: 30rpx;
}

/* 选择器部分标签样式 */
.picker-section-label {
	display: block;
	font-size: 24rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 15rpx;
	padding-left: 10rpx;
}
</style>