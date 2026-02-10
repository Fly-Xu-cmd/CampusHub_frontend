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
			<view class="wd-icon" style="font-size: 24rpx; color: #999;">
				<text style="font-size: 24rpx; transform: rotate(90deg); display: inline-block;">›</text>
			</view>
		</view>
	</view>

	<!-- H5环境下的地图选择弹窗 -->
	<view v-if="showH5LocationMap" class="custom-popup">
		<view class="popup-overlay" @click="showH5LocationMap = false"></view>
		<view class="h5-location-popup">
			<view class="popup-header">
				<text class="popup-title">选择活动地点</text>
				<text class="popup-close" @click="showH5LocationMap = false">&times;</text>
			</view>
			<view class="popup-body">
				<!-- 搜索输入框 -->
				<view class="search-container">
					<view class="search-input-wrapper">
						<text class="search-icon">ὐd</text>
						<input 
							id="search"
							class="search-input" 
							placeholder="搜索地点"
							@input="(e: Event) => debouncedHandleSearch((e.target as HTMLInputElement).value)"
						/>
					</view>
				</view>
				<!-- 地图容器 -->
				<view id="mapContainer" class="map-container"></view>
				<!-- 地点列表 -->
				<view class="poi-list" v-if="poiList.length > 0">
					<view 
						v-for="(poi, index) in poiList" 
						:key="index"
						class="poi-item"
						@click="selectPoi(poi)"
					>
						<text class="poi-name">{{ poi.name }}</text>
						<text class="poi-address">{{ poi.address }}</text>
					</view>
				</view>
			</view>
			<view class="popup-footer">
				<button class="btn btn-cancel" @click="showH5LocationMap = false">取消</button>
				<button class="btn btn-confirm" @click="confirmH5Location">确认选择</button>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
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

// H5环境下的地图选择状态
const showH5LocationMap = ref(false)
const searchKeyword = ref('')
const poiList = ref<any[]>([])
const locationPopup = ref(null)
const mapInstance = ref<any>(null)
const placeSearchInstance = ref<any>(null)
const selectedPoi = ref<any>(null)

// 防抖函数，用于优化搜索性能
const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
	let timer: ReturnType<typeof setTimeout> | null = null
	return function(this: any, ...args: Parameters<T>) {
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
			func.apply(this, args)
		}, delay)
	}
}

// 防抖处理后的搜索函数
const debouncedHandleSearch = debounce((value: string) => {
	handleSearch(value)
}, 300)

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

// 初始化高德地图
const initAmap = () => {
	// 检查地图容器是否存在
	const mapContainer = document.getElementById('mapContainer')
	if (!mapContainer) {
		uni.showToast({
			title: '地图容器初始化失败',
			icon: 'none'
		})
		return
	}
	
	initMapWithLoader()

}

// 使用AMapLoader初始化地图
const initMapWithLoader = () => {
	const AMapLoader = (window as any).AMapLoader
	if (!AMapLoader) {
		uni.showToast({
			title: '地图加载失败，请检查网络连接',
			icon: 'none'
		})
		showH5LocationMap.value = false
		return
	}
	
	// 配置安全密钥
	(window as any)._AMapSecurityConfig = {
		securityJsCode: '6a80522dfe82512795bb11e345a975ec', // 替换为你申请的安全密钥
	}
	
	AMapLoader.load({
		key: '99682615a3c3718fa6dadfcc7247e9a6', // 申请好的 Web 端开发 Key
		version: '2.0', // 指定要加载的 JS API 的版本
		plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.PlaceSearch', 'AMap.Geocoder', 'AMap.Marker'], // 需要使用的插件列表
		AMapUI: {
			// 是否加载 AMapUI
			version: '1.1', // AMapUI 版本
			plugins: ['overlay/SimpleMarker'], // 需要加载的 AMapUI ui 插件
		},
		Loca: {
			// 是否加载 Loca
			version: '2.0', // Loca 版本
		},
	})
	.then((AMap: any) => {
		// 将AMap对象存储到window中，以便其他函数使用
		(window as any).AMap = AMap
		// 初始化地图实例
		initMapInstance()
	})
	.catch((e: Error) => {
		uni.showToast({
			title: '地图加载失败，请检查网络连接',
			icon: 'none'
		})
		showH5LocationMap.value = false
	})
}

// 处理高德地图API错误
window.onerror = function(msg: string | Event, url: string | undefined, line: number | undefined, col: number | undefined, error: Error | undefined) {
	// 过滤掉高德地图的无效密钥错误，避免频繁弹窗
	if (typeof msg === 'string' && (msg.includes('INVALID_USER_KEY') || msg.includes('Unimplemented type: 3') || msg.includes('FlyDataAuthTask error'))) {
		// 即使密钥无效，也尝试继续显示地图
		return true // 阻止默认错误处理
	}
	return false // 其他错误正常处理
}

// 优化地图初始化，确保即使密钥无效也能显示基本地图
const initMapInstance = () => {
	const AMap = (window as any).AMap
	if (!AMap) {
		uni.showToast({
			title: '地图API初始化失败',
			icon: 'none'
		})
		return
	}
	
	// 检查地图容器是否存在
	const mapContainer = document.getElementById('mapContainer')
	if (!mapContainer) {
		return
	}
	
	try {
		// 创建地图实例
		mapInstance.value = new AMap.Map('mapContainer', {
			zoom: 15,
			center: [localLocationLongitude.value || 116.4074, localLocationLatitude.value || 39.9042],
			resizeEnable: true
		})

		// 加载并添加控件
		AMap.plugin(['AMap.Scale', 'AMap.ToolBar'], function() {
			try {
				// 添加比例尺控件
				mapInstance.value.addControl(new AMap.Scale())
				// 添加工具栏控件
				mapInstance.value.addControl(new AMap.ToolBar())
			} catch (err) {
				// 控件添加失败不影响地图基本显示
			}
		})

		// 加载并创建地点搜索实例
		AMap.plugin(['AMap.PlaceSearch'], function() {
			try {
				placeSearchInstance.value = new AMap.PlaceSearch({
					pageSize: 10,
					pageIndex: 1,
					city: '全国',
					map: mapInstance.value,
					panel: false,
					autoFitView: true
				})
				placeSearchInstance.value.search('河南科技学院')
			} catch (err) {
				// 搜索功能失败不影响地图基本显示
			}
		})

		// 监听地图点击事件
		mapInstance.value.on('click', (e: any) => {
			const lnglat = e.lnglat
			// 根据经纬度获取地点信息
			AMap.plugin('AMap.Geocoder', function() {
				try {
					const geocoder = new AMap.Geocoder({
						radius: 1000,
						extensions: 'all'
					})
					geocoder.getAddress([lnglat.getLng(), lnglat.getLat()], (status: string, result: any) => {
						if (status === 'complete' && result.regeocode) {
							const address = result.regeocode
							selectedPoi.value = {
								name: address.formattedAddress,
								address: address.formattedAddress,
								location: {
									lng: lnglat.getLng(),
									lat: lnglat.getLat()
								}
							}
							// 在地图上标记选中位置
							markSelectedLocation(lnglat.getLng(), lnglat.getLat())
						}
					})
				} catch (err) {
				}
			})
		})
	} catch (error) {
		uni.showToast({
			title: '地图初始化失败',
			icon: 'none'
		})
	}
}



// 在地图上标记选中位置
const markSelectedLocation = (lng: number, lat: number) => {
	const AMap = (window as any).AMap
	// 清除之前的标记
	mapInstance.value.clearMap()
	// 加载Marker插件
	AMap.plugin('AMap.Marker', function() {
		// 添加新标记
		new AMap.Marker({
			position: [lng, lat],
			map: mapInstance.value,
			title: '选中位置'
		})
	})
	// 调整地图视野
	mapInstance.value.setCenter([lng, lat])
}

// 处理搜索
const handleSearch = (value: string) => {
	if (!value) {
		poiList.value = []
		return
	}

	// 使用高德地图的地点搜索
	placeSearchInstance.value.search(value, (status: string, result: any) => {
		if (status === 'complete' && result.poiList) {
			poiList.value = result.poiList.pois
		} else {
			poiList.value = []
		}
	})
}

// 选择地点
const selectPoi = (poi: any) => {
	selectedPoi.value = poi
	// 在地图上标记选中位置
	markSelectedLocation(poi.location.lng, poi.location.lat)
	// 清空搜索结果
	poiList.value = []
	searchKeyword.value = ''
}

// 确认H5环境下的位置选择
const confirmH5Location = () => {
	if (!selectedPoi.value) {
		uni.showToast({
			title: '请选择地点',
			icon: 'none'
		})
		return
	}

	localLocationName.value = selectedPoi.value.name
	localLocationAddress.value = selectedPoi.value.address
	localLocationLatitude.value = selectedPoi.value.location.lat
	localLocationLongitude.value = selectedPoi.value.location.lng

	// 触发事件，更新父组件的数据
	emit('update:locationName', selectedPoi.value.name)
	emit('update:locationAddress', selectedPoi.value.address)
	emit('update:locationLatitude', selectedPoi.value.location.lat)
	emit('update:locationLongitude', selectedPoi.value.location.lng)

	showH5LocationMap.value = false
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
			localLocationName.value = res.name
			localLocationAddress.value = res.address
			localLocationLatitude.value = res.latitude
			localLocationLongitude.value = res.longitude
			
			// 触发事件，更新父组件的数据
			emit('update:locationName', res.name)
			emit('update:locationAddress', res.address)
			emit('update:locationLatitude', res.latitude)
			emit('update:locationLongitude', res.longitude)
		},
		fail: (err: UniApp.GeneralCallbackResult)  => {
		}
	})
	// #endif

	// #ifdef H5
	// H5环境下显示地图选择
	showH5LocationMap.value = true
	// 延迟初始化地图，确保DOM已经渲染
	setTimeout(() => {
		initAmap()
	}, 100)
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

	// #ifdef H5
	// H5环境下直接打开地图选择
	openLocationPicker()
	// #endif
}

// 组件卸载时清理
onUnmounted(() => {
	// 清除地图实例
	if (mapInstance.value) {
		mapInstance.value.destroy()
	}
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;
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

/* 自定义弹窗样式 */
.custom-popup {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9999;
	display: flex;
	justify-content: flex-end;
	align-items: flex-end;
}

.popup-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
}

/* H5环境下的地图选择弹窗样式 */
.h5-location-popup {
	width: 100vw;
	height: 80vh;
	background-color: #fff;
	border-top-left-radius: 16rpx;
	border-top-right-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.15);
	z-index: 1;
}

.popup-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
	background-color: #fff;
	position: sticky;
	top: 0;
	z-index: 10;
}

.popup-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.popup-close {
	font-size: 40rpx;
	color: #999;
	cursor: pointer;
}

.popup-body {
	height: 500px;
	min-height: 400rpx;
	display: flex;
	flex-direction: column;
	position: relative;
}

/* 搜索容器样式 */
.search-container {
	padding: 20rpx;
	background-color: #f8f9fa;
	position: sticky;
	top: 100rpx;
	z-index: 5;
}

.search-input-wrapper {
	display: flex;
	align-items: center;
	background-color: #fff;
	border-radius: 8rpx;
	padding: 0 20rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.search-icon {
	font-size: 24rpx;
	color: #999;
	margin-right: 10rpx;
}

.search-input {
	flex: 1;
	padding: 20rpx 0;
	height: 88rpx;
	font-size: 26rpx;
	border: none;
	outline: none;
}

/* 地图容器样式 */
.map-container {
	flex: 1;
	width: 100%;
	min-height: 400rpx;
	height: 100%;
}

/* 地点列表样式 */
.poi-list {
	max-height: 200rpx;
	overflow-y: auto;
	background-color: #fff;
	border-top: 1rpx solid #f0f0f0;
}

.poi-item {
	padding: 20rpx;
	border-bottom: 1rpx solid #f8f9fa;
	cursor: pointer;
}

.poi-item:hover {
	background-color: #f8f9fa;
}

.poi-name {
	display: block;
	font-size: 26rpx;
	font-weight: 500;
	color: #333;
	margin-bottom: 8rpx;
}

.poi-address {
	display: block;
	font-size: 22rpx;
	color: #999;
}

.popup-footer {
	display: flex;
	border-top: 1rpx solid #f0f0f0;
	background-color: #fff;
	position: sticky;
	bottom: 0;
}

.btn {
	flex: 1;
	padding: 26rpx;
	font-size: 28rpx;
	font-weight: 500;
	border: none;
	cursor: pointer;
}

.btn-cancel {
	background-color: #f8f9fa;
	color: #666;
	border-right: 1rpx solid #f0f0f0;
}

.btn-confirm {
	background-color: #007aff;
	color: #fff;
}

/* 响应式调整 */
@media screen and (max-width: 750rpx) {
	.h5-location-popup {
		height: 70vh;
	}
}
</style>