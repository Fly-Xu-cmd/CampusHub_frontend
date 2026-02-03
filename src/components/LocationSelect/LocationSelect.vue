<template>
	<view class="form-item location-item" @click="selectLocation">
		<view class="form-item-left">
			<view class="icon-container">
				<view class="iconfont iconfont-location" style="font-size: 40rpx; color: #6b7280;"></view>
			</view>
			<view class="text-content">
				<text class="form-label">{{ label }}</text>
				<text class="form-value location-total">{{ locationName }}</text>
			</view>
		</view>
		<view class="form-item-right">
			<wd-icon name="arrow-right" size="24rpx" color="#999" />
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// 定义组件的props
const props = defineProps({
	label: {
	
type: String,
		default: '活动地点'
	},
	locationName: {
	
type: String,
		default: '选择线下地点'
	},
	locationAddress: {
	
type: String,
		default: ''
	},
	locationLatitude: {
	
type: Number,
		default: 0
	},
	locationLongitude: {
	
type: Number,
		default: 0
	}
})

// 定义组件的emits
const emit = defineEmits([
	'update:locationName',
	'update:locationAddress',
	'update:locationLatitude',
	'update:locationLongitude'
])

// 本地状态，用于处理组件内部的状态变化
const localLocationName = ref(props.locationName)
const localLocationAddress = ref(props.locationAddress)
const localLocationLatitude = ref(props.locationLatitude)
const localLocationLongitude = ref(props.locationLongitude)

// 监听props的变化，更新本地状态
watch(() => props.locationName, (newValue) => {
	localLocationName.value = newValue
})

watch(() => props.locationAddress, (newValue) => {
	localLocationAddress.value = newValue
})

watch(() => props.locationLatitude, (newValue) => {
	localLocationLatitude.value = newValue
})

watch(() => props.locationLongitude, (newValue) => {
	localLocationLongitude.value = newValue
})

// 打开位置选择器
const openLocationPicker = (): void => {
	// #ifdef MP-WEIXIN
	// 使用微信小程序的选择位置API（底层使用高德地图）
	uni.chooseLocation({
		latitude: 39.9042, // 默认北京
		longitude: 116.4074,
		scale: 16,
		success: (res) => {
			localLocationName.value = res.name
			localLocationAddress.value = res.address
			localLocationLatitude.value = res.latitude
			localLocationLongitude.value = res.longitude
			
			// 触发事件，更新父组件的数据
			emit('update:locationName', res.name)
			emit('update:locationAddress', res.address)
			emit('update:locationLatitude', res.latitude)
			emit('update:locationLongitude', res.longitude)
			
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
.location-item {
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

/* 地点名称样式 */
.location-total {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
	margin-left: 70rpx;
}
</style>