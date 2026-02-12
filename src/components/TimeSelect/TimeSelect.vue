<template>
	<view>
		<!-- 时间选择触发按钮和日历选择器容器 -->
		<view class="form-item time-item">
			<!-- 时间显示区域 -->
			<view class="time-display">
				<view class="form-item-left">
					<view class="icon-container">
						<wd-icon name="clock" size="38rpx" :color="'#f97316'" />
					</view>
					<view class="text-content">
						<text class="form-label">{{ label }}</text>
					</view>
				</view>
			</view>
			
			<!-- 日历选择器组件 - 直接渲染在盒子内部 -->
			<view class="calendar-container">
				<wd-calendar
					v-model:visible="localIsShowPicker"
					v-model="calendarValue"
					type="datetimerange"
					@confirm="onCalendarConfirm"
					@close="onCalendarCancel"
					allow-same-day
					:display-format="displayFormat"
					:inner-display-format="innerDisplayFormat"
					hide-second="false"
					z-index="9999"
				/>
			</view>
		</view>

		<!-- 错误信息显示 -->
		<view v-if="errorMessage" class="time-error-message">
			{{ errorMessage }}
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

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
	'update:errorMessage'
])

// 本地状态，用于处理组件内部的状态变化
const localStartValue = ref(props.startValue)
const localEndValue = ref(props.endValue)
const localErrorMessage = ref(props.errorMessage)
const localIsShowPicker = ref(props.isShowPicker)
const calendarValue = ref<number[]>([localStartValue.value, localEndValue.value])

// 自定义显示格式化函数
const displayFormat = (value: number[]): string => {
	if (value && value.length === 2) {
		return formatDateTime(value[0]) + ' - ' + formatDateTime(value[1])
	}
	return ''
}

// 自定义内部显示格式化函数
const innerDisplayFormat = (value: number, rangeType: 'start' | 'end', type: string): string => {
	return formatDateTime(value)
}

// 日期时间格式化函数
const formatDateTime = (timestamp: number): string => {
	const date = new Date(timestamp)
	const month = String(date.getMonth() + 1)
	const day = String(date.getDate())
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')
	const seconds = String(date.getSeconds()).padStart(2, '0')
	return `${month}月${day}日 ${hours}:${minutes}:${seconds}`
}



// 监听props的变化，更新本地状态
watch(() => props.startValue, (newValue) => {
	localStartValue.value = newValue
	calendarValue.value = [localStartValue.value, localEndValue.value]
})

watch(() => props.endValue, (newValue) => {
	localEndValue.value = newValue
	calendarValue.value = [localStartValue.value, localEndValue.value]
})

watch(() => props.errorMessage, (newValue) => {
	localErrorMessage.value = newValue
})

watch(() => props.isShowPicker, (newValue) => {
	localIsShowPicker.value = newValue
})

// 监听calendarValue的变化，更新本地状态
watch(calendarValue, (newValue) => {
	if (newValue && newValue.length === 2) {
		localStartValue.value = newValue[0]
		localEndValue.value = newValue[1]
		emit('update:startValue', newValue[0])
		emit('update:endValue', newValue[1])
	}
}, { deep: true })

// 日历选择确认回调
const onCalendarConfirm = (event: any): void => {
	const value = event.value || event.detail?.value || []
	if (value && value.length === 2) {
		localStartValue.value = value[0]
		localEndValue.value = value[1]
		emit('update:startValue', value[0])
		emit('update:endValue', value[1])
		// 清除错误信息
		localErrorMessage.value = ''
		emit('update:errorMessage', '')
		// 更新本地状态
		localIsShowPicker.value = false
		// 通知父组件关闭日历选择器
		emit('update:isShowPicker', false)
	}
}

// 日历选择取消回调
const onCalendarCancel = (): void => {
	// 更新本地状态
	localIsShowPicker.value = false
	// 通知父组件关闭日历选择器
	emit('update:isShowPicker', false)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

/* 表单项目样式 */
.form-item {
	width: 100%;
	background-color: #fff;
	box-sizing: border-box;
}

/* 时间、地点、人数限制的特殊样式 */
.time-item {
	margin: 30rpx 0;
	padding: 10rpx;
	padding-left: 20rpx;
	border-radius: 16rpx;
	background-color: #f8f9fa;
	border: none;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	flex-direction: column;
	align-items: flex-start;
	height: auto;
	min-height: 120rpx;
}

/* 时间显示区域样式 */
.time-display {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	margin-bottom: 20rpx;
	padding-top: 20rpx;
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
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
	margin-bottom: -60rpx;
	z-index: 1;
}

.text-content {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
	padding-left: 70rpx;
}

.form-label {
	font-size: 30rpx;
	color: #333;
	font-weight: 600;
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
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

/* 日历选择器容器样式 */
.calendar-container {
	margin-top: 20rpx;
	width: 100%;
	background-color: #f8f9fa;
	border-radius: 12rpx;
	overflow: hidden;
	padding: 0;
}

/* 修改wd-cell__wrapper背景颜色 */
.calendar-container :deep(.wd-cell__wrapper) {
	background-color: #f8f9fa;
	padding: 0;
}

/* 调整wd-cell__value内部文字位置 */
.calendar-container :deep(.wd-cell__value),
.calendar-container :deep(.wd-cell__value--left) {
	padding-left: 150rpx;
}

/* 取消wd-cell wd-calendar__cell的padding-left */
.calendar-container :deep(.wd-cell.wd-calendar__cell) {
	padding-left: 0;
}
</style>