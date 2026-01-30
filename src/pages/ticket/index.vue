<template>
	<CommonLayout headerType="title" title="我的票券" :showTabBar="true">
		<view class="content">


			<view class="container" style="padding: 30rpx;">
				<view class="time-item">
					<view class="time-item-left">
						<view class="i-running">
							<wd-icon class-prefix="iconfont" name="running" size="28rpx" color="#f97316" />
						</view>
						<view class="event-info">
							<view class="event-title">奥森公园夜跑</view>
							<view class="event-time">
								<wd-icon name="clock" size="28rpx" color="#666" />
								<text class="time-value">
									{{ formattedEndTime }}
								</text>
							</view>
							<view :class="['event-status', isUsed ? 'status-used' : 'status-pending']"
								@click="toggleStatus">
								{{ isUsed ? '已使用' : '待使用' }}
							</view>
						</view>
					</view>
					<view class="time-item-right">
						<view class="qr-code-btn" @click="showQRCode">
							<view class="iconfont iconfont-qrcode" style="font-size: 24rpx; color: #999;"></view>
						</view>
					</view>
				</view>
			</view>

			<!-- 二维码详情弹窗 -->
			<view v-if="showQR" class="qr-modal">
				<view class="qr-content">
					<view class="qr-header">
						<view class="qr-back" @click="hideQRCode">
							<wd-icon name="arrow-left" size="24rpx" color="#fff" />
						</view>
						<text class="qr-title">票券详情</text>
						<view class="qr-empty"></view>
					</view>
					<view class="qr-event-info">
						<text class="qr-event-name">奥森公园夜跑</text>
						<text class="qr-event-time">10.24 19:00-21:00</text>
					</view>
					<view class="qr-body">
						<view class="qr-code">
							<qrcode :value="qrCodeValue" :options="qrCodeOptions"></qrcode>
						</view>
						<view class="qr-number">8293</view>
						<view class="qr-hint">请出示二维码核销入场</view>
					</view>
				</view>
			</view>
		</view>
	</CommonLayout>
</template>

<script lang="ts" setup>
	import { computed, ref } from 'vue'
	import { usePublishStore } from '@/store/publish'
	import Qrcode from '@chenfengyuan/vue-qrcode'

	const publishStore = usePublishStore()
	const isUsed = ref(false)
	const showQR = ref(false)
	const qrCodeValue = ref('https://ticket.campus-hub.com/event/8293')
	const qrCodeOptions = ref({
		width: 180,
		margin: 10,
		color: {
			dark: '#1e293b',
			light: '#ffffff'
		}
	})

	const formattedEndTime = computed(() => {
		const time = publishStore.endTime
		if (!time) return ''
		const date = new Date(time)
		const month = (date.getMonth() + 1).toString().padStart(2, '0')
		const day = date.getDate().toString().padStart(2, '0')
		const hours = date.getHours().toString().padStart(2, '0')
		const minutes = date.getMinutes().toString().padStart(2, '0')
		return `${month}.${day} ${hours}:${minutes}`
	})

	const toggleStatus = () => {
		isUsed.value = !isUsed.value
		// 这里可以添加API调用，将状态更新到服务器
		console.log('Ticket status changed to:', isUsed.value ? 'used' : 'pending')
	}

	const showQRCode = () => {
		showQR.value = true
		// 这里可以添加生成二维码的逻辑
		console.log('Show QR code')
	}

	const hideQRCode = () => {
		showQR.value = false
	}
</script>

<style lang="scss" scoped>
	.nav-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.container {
		box-sizing: border-box;
	}

	.time-item {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		width: 100%;
		height: 180rpx;
		padding: 25rpx 5%;
		background-color: #fff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}

	.time-item-left {
		display: flex;
		align-items: flex-start;
		gap: 20rpx;
		margin-top: 10rpx;
	}

	.time-item-right {
		display: flex;
		align-items: center;
		margin-top: 35rpx;
	}

	.qr-code-btn {
		padding: 10rpx;
		cursor: pointer;
		border-radius: 8rpx;
		transition: background-color 0.3s ease;
	}

	.qr-code-btn:hover {
		background-color: #f3f4f6;
	}

	/* 二维码详情弹窗样式 */
	.qr-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #1e293b;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.qr-content {
		background-color: #fff;
		border-radius: 20rpx;
		width: 90%;
		max-width: 500rpx;
		overflow: hidden;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.3);
	}

	.qr-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		background-color: #1e293b;
	}

	.qr-back {
		padding: 10rpx;
	}

	.qr-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #fff;
	}

	.qr-empty {
		width: 44rpx;
	}

	.qr-event-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 30rpx;
		background-color: #f97316;
		color: #fff;
		gap: 10rpx;
	}

	.qr-event-name {
		font-size: 32rpx;
		font-weight: bold;
	}

	.qr-event-time {
		font-size: 24rpx;
		opacity: 0.9;
	}

	.qr-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 30rpx;
		gap: 40rpx;
	}

	.qr-code {
		width: 280rpx;
		height: 280rpx;
		background-color: #f3f4f6;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx;
	}

	.qr-number {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		letter-spacing: 8rpx;
	}

	.qr-hint {
		font-size: 22rpx;
		color: #6b7280;
		text-align: center;
		line-height: 1.4;
	}

	.event-info {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.event-title {
		font-size: 25rpx;
		font-weight: bold;
		color: #333;
		font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
		letter-spacing: 2rpx;
		text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
	}

	.event-time {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.event-status {
		font-size: 24rpx;
		font-weight: 500;
		padding: 6rpx 16rpx;
		border-radius: 12rpx;
		width: fit-content;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.status-pending {
		color: #3bb267;
		background-color: #dcfce7;
	}

	.status-used {
		color: #6b7280;
		background-color: #f3f4f6;
	}

	.i-running {
		width: 120rpx;
		height: 120rpx;
		background-color: #ffedd5;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.time-value {
		font-size: 26rpx;
		color: #999;
	}
</style>