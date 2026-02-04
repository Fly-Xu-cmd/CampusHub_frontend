<template>
	<CommonLayout headerType="title" title="我的票券" :showTabBar="true">
		<view class="content">
			<view class="container" style="padding: 30rpx;">
				<!-- 加载状态 -->
				<view v-if="loading" class="loading-container">
					<wd-icon name="loading" size="48rpx" color="#f97316" />
					<text class="loading-text">加载中...</text>
				</view>

				<!-- 错误信息 -->
				<view v-else-if="error" class="error-container">
					<wd-icon name="error" size="48rpx" color="#ef4444" />
					<text class="error-text">{{ error }}</text>
					<view class="retry-btn" @click="fetchTicketDetails">重试</view>
				</view>

				<!-- 票券列表 -->
				<view v-else-if="tickets.length > 0">
					<view v-for="ticket in tickets" :key="ticket.id" class="time-item">
						<view class="time-item-left">
							<view class="i-running">
								<wd-icon class-prefix="iconfont" name="running" size="68rpx" color="#f97316" />
							</view>
							<view class="event-info">
								<view class="event-title">{{ ticket.eventName }}</view>
								<view class="event-time">
									<wd-icon name="clock" size="28rpx" color="#666" />
									<text class="time-value">
										{{ formatEventTime(ticket.eventTime) }}
									</text>
								</view>
								<view :class="['event-status', ticket.status === 'used' ? 'status-used' : 'status-pending']"
									@click="toggleStatus(ticket)">
									{{ ticket.status === 'used' ? '已使用' : '待使用' }}
								</view>
							</view>
						</view>
						<view class="time-item-right">
							<view class="qr-code-btn" @click="showQRCode(ticket)">
								<view class="iconfont iconfont-qrcode" style="font-size: 24rpx; color: #999;"></view>
							</view>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<view v-else class="empty-container">
					<wd-icon name="ticket" size="64rpx" color="#d1d5db" />
					<text class="empty-text">暂无票券</text>
				</view>
			</view>

			<!-- 二维码详情弹窗 -->
			<view v-if="showQR && selectedTicket" class="qr-modal">
				<view class="qr-content">
					<view class="qr-header">
						<view class="qr-back" @click="hideQRCode">
							<wd-icon name="arrow-left" size="24rpx" color="#fff" />
						</view>
						<text class="qr-title">票券详情</text>
						<view class="qr-empty"></view>
					</view>
					<view class="qr-event-info">
						<text class="qr-event-name">{{ selectedTicket.eventName }}</text>
						<text class="qr-event-time">{{ formatEventTime(selectedTicket.eventTime) }}</text>
					</view>
					<view class="qr-body">
						<view class="qr-code">
							<qrcode :value="qrCodeValue" :options="qrCodeOptions"></qrcode>
						</view>
						<view class="qr-number">{{ selectedTicket.ticketNumber }}</view>
						<view class="qr-hint">请出示二维码核销入场</view>

						<!-- 核销功能 -->
						<view class="verify-section">
							<view class="verify-input-container">
								<text class="verify-label">TOTP验证码：</text>
								<input 
									v-model="totpCode" 
									type="text" 
									class="verify-input" 
									placeholder="请输入6位验证码" 
									placeholder-style="color: #999; font-size: 24rpx;"
									maxlength="6"
								/>
							</view>
							<view 
								class="verify-btn" 
								@click="verifyTicket"
								:class="{ 'loading': verifyLoading }"
								:disabled="verifyLoading"
							>
								<text v-if="!verifyLoading">确认核销</text>
								<text v-else>核销中...</text>
							</view>
							<view 
								v-if="verifyResult" 
								class="verify-result" 
								:class="{ 'success': verifySuccess, 'error': !verifySuccess }"
							>
								{{ verifyResult }}
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</CommonLayout>
</template>

<script lang="ts" setup>
	import { ref, onMounted } from 'vue'
	import Qrcode from '@chenfengyuan/vue-qrcode'
import type { Ticket } from '@/types/modules/ticket'
import { getTicketList } from '@/api/ticket/router'

	const showQR = ref(false)
	const selectedTicket = ref<Ticket | null>(null)
	const qrCodeValue = ref('https://ticket.campus-hub.com/event/8293')
	const qrCodeOptions = ref({
		width: 180,
		margin: 10,
		color: {
			dark: '#1e293b',
			light: '#ffffff'
		}
	})
	const tickets = ref<Ticket[]>([])
	const loading = ref(true)
	const error = ref<string | null>(null)
	// 核销功能相关状态
	const totpCode = ref('')
	const verifyLoading = ref(false)
	const verifyResult = ref<string | null>(null)
	const verifySuccess = ref(false)

	// 格式化活动时间
	const formatEventTime = (eventTime: string) => {
		// 假设eventTime格式为 '2024-10-24 19:00:00'
		const parts = eventTime.split(' ')
		if (parts.length < 2) return eventTime
		const datePart = parts[0]
		const timePart = parts[1]
		
		// 格式化日期为 '10.24'
		const date = new Date(datePart)
		const month = (date.getMonth() + 1).toString().padStart(2, '0')
		const day = date.getDate().toString().padStart(2, '0')
		
		return `${month}.${day} ${timePart}`
	}

	// 本地模拟数据
	const mockTickets = [
		{
			id: '10001',
			eventId: '2001',
			eventName: '春季户外徒步活动',
			eventTime: '2024-03-15 09:00:00',
			eventLocation: '',
			ticketNumber: 'TK7A3B9K2D',
			status: 'pending' as const,
			qrCodeUrl: '',
			createdAt: new Date().toISOString()
		},
		{
			id: '10002',
			eventId: '2002',
			eventName: '摄影技巧分享会',
			eventTime: '2024-03-20 14:00:00',
			eventLocation: '',
			ticketNumber: 'TK8B4C0L3E',
			status: 'used' as const,
			qrCodeUrl: '',
			createdAt: new Date().toISOString()
		}
	]

	// 从API获取票券列表
	const fetchTicketDetails = async () => {
		loading.value = true
		error.value = null
		tickets.value = []
		try {
			// 尝试从API获取数据
			const result = await getTicketList()
			
			// 检查result结构
			if (!result || result.code !== 0 || !result.data || !result.data.items) {
				// API数据获取失败，使用本地模拟数据
				tickets.value = mockTickets
				return
			}
			
			// 使用类型断言处理TypeScript类型检查
			const apiData = result.data as any
			
			// 字段映射：将API返回的字段转换为前端期望的格式
			const fetchedTickets = apiData.items.map((item: any) => {
				const mappedTicket = {
					id: item.ticket_id?.toString() || '',
					eventId: item.activity_id?.toString() || '',
					eventName: item.activity_name || '',
					eventTime: item.activity_time || '',
					eventLocation: '', // 默认空值
					ticketNumber: item.ticket_code || '',
					status: item.status === 1 ? 'used' : 'pending', // 将数字状态转换为字符串
					qrCodeUrl: '', // 默认空值
					createdAt: new Date().toISOString() // 当前时间
				}
				return mappedTicket
			})
			
			// 过滤掉无效票券
			const validTickets = fetchedTickets.filter((ticket: any) => ticket && ticket.id) as Ticket[]
			tickets.value = validTickets
			
			if (validTickets.length === 0) {
				// 无有效票券数据，使用本地模拟数据
				tickets.value = mockTickets
			}
		} catch (err) {
			// API请求失败，使用本地模拟数据
			error.value = null
			tickets.value = mockTickets
		} finally {
			loading.value = false
		}
	}

	// 切换票券状态
	const toggleStatus = (ticket: Ticket) => {
		const index = tickets.value.findIndex(t => t.id === ticket.id)
		if (index !== -1) {
			tickets.value[index].status = tickets.value[index].status === 'pending' ? 'used' : 'pending'
			// 这里可以添加API调用，将状态更新到服务器
		}
	}

	// 显示二维码
	const showQRCode = (ticket: Ticket) => {
		// 显示基本信息
		selectedTicket.value = ticket
		showQR.value = true
		// 更新二维码值
		qrCodeValue.value = `https://ticket.campus-hub.com/event/${ticket.id}`
	}

	// 隐藏二维码
	const hideQRCode = () => {
		showQR.value = false
		selectedTicket.value = null
		// 重置核销状态
		totpCode.value = ''
		verifyResult.value = null
		verifySuccess.value = false
	}

	// 核销票券
	const verifyTicket = async () => {
		if (!selectedTicket.value || !totpCode.value) {
			verifyResult.value = '请输入TOTP验证码'
			verifySuccess.value = false
			return
		}

		verifyLoading.value = true
		verifyResult.value = null

		try {
			// 固定TOTP验证码为123456，相同为核销成功，不同为核销失败
			if (totpCode.value === '123456') {
				// 模拟核销成功
				verifyResult.value = '核销成功'
				verifySuccess.value = true
				// 更新票券状态为已使用
				const index = tickets.value.findIndex(t => t.id === selectedTicket.value?.id)
				if (index !== -1) {
					tickets.value[index].status = 'used'
				}
			} else {
				// 模拟核销失败
				verifyResult.value = '核销失败，验证码错误'
				verifySuccess.value = false
			}
		} catch (err) {
			verifyResult.value = '核销失败，请重试'
			verifySuccess.value = false
		} finally {
			verifyLoading.value = false
		}
	}

	// 组件挂载时获取票券数据
	onMounted(() => {
		fetchTicketDetails()
	})
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
		margin-bottom: 20rpx;
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

		// 加载状态样式
		.loading-container {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 120rpx 0;
			
			.loading-text {
				margin-top: 24rpx;
				font-size: 28rpx;
				color: #666;
				font-weight: 500;
			}
		}

		// 错误状态样式
		.error-container {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 120rpx 40rpx;
			text-align: center;
			
			.error-text {
				margin: 24rpx 0;
				font-size: 28rpx;
				color: #ef4444;
				font-weight: 500;
				line-height: 1.4;
			}
			
			.retry-btn {
				margin-top: 32rpx;
				padding: 16rpx 48rpx;
				background-color: #f97316;
				color: #fff;
				font-size: 28rpx;
				font-weight: 500;
				border-radius: 12rpx;
				box-shadow: 0 4rpx 12rpx 0 rgba(249, 115, 22, 0.3);
				cursor: pointer;
				transition: all 0.3s ease;
				
				&:active {
					background-color: #ea580c;
					transform: scale(0.98);
				}
			}
		}

		// 空状态样式
		.empty-container {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 120rpx 0;
			
			.empty-text {
				margin-top: 24rpx;
				font-size: 28rpx;
				color: #9ca3af;
				font-weight: 500;
			}
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

		/* 核销功能样式 */
		.verify-section {
			width: 100%;
			margin-top: 40rpx;
			padding: 0 20rpx;
			box-sizing: border-box;
		}

		.verify-input-container {
			display: flex;
			align-items: center;
			margin-bottom: 24rpx;
			gap: 16rpx;
		}

		.verify-label {
			font-size: 24rpx;
			color: #333;
			font-weight: 500;
			min-width: 160rpx;
		}

		.verify-input {
			flex: 1;
			height: 60rpx;
			padding: 0 16rpx;
			border: 2rpx solid #e5e7eb;
			border-radius: 12rpx;
			font-size: 26rpx;
			color: #333;
			background-color: #f9fafb;
			box-sizing: border-box;
		}

		.verify-input:focus {
			outline: none;
			border-color: #f97316;
			box-shadow: 0 0 0 3rpx rgba(249, 115, 22, 0.1);
		}

		.verify-btn {
			width: 100%;
			height: 72rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #f97316;
			color: #fff;
			font-size: 28rpx;
			font-weight: 500;
			border-radius: 16rpx;
			cursor: pointer;
			transition: all 0.3s ease;
			margin-bottom: 20rpx;
		}

		.verify-btn:hover {
			background-color: #ea580c;
		}

		.verify-btn:active {
			transform: scale(0.98);
		}

		.verify-btn.loading {
			background-color: #fb923c;
			cursor: not-allowed;
		}

		.verify-result {
			padding: 16rpx;
			border-radius: 12rpx;
			font-size: 24rpx;
			text-align: center;
			margin-top: 16rpx;
		}

		.verify-result.success {
			background-color: #dcfce7;
			color: #15803d;
		}

		.verify-result.error {
			background-color: #fee2e2;
			color: #dc2626;
		}
</style>