<template>
	<CommonLayout headerType="none"  padding="0 0" :showTabBar="true">
		<view class="header-container">
			<view class="header-content">
				<view class="header-left">
					<view class="close-btn" @click="goBackHome">×</view>
				</view>
				<view class="header-title">
					发布新活动
				</view>
				<view class="header-right">
					<button class="submit-btn-header" @click="submitForm">提交</button>
				</view>
			</view>
		</view>

		<view class="publish-container">
			<!-- 上传组件 -->
		<UploadVideo 
			:fileList="fileList"
			@update:fileList="handleFileListUpdate"
			upload-text="上传活动封面/视频"
		/>
			<!-- 上传组件 -->

			<!-- 活动标题 -->
		<view class="form-item title-item">
			<input type="text" v-model="activityTitle" placeholder="活动标题" class="title-input" placeholder-style="color: #999;">
		</view>

		<!-- 联系电话 -->
		<view class="form-item title-item">
			<input type="text" v-model="contactPhone" placeholder="联系电话" class="title-input" placeholder-style="color: #999;">
		</view>

			<!-- 活动信息容器（白色背景） -->
			<view class="form-info-container">
				<!-- 报名时间 -->
				<TimeSelect 
					label="报名时间"
					v-model:startValue="signupStartValue"
					v-model:endValue="signupEndValue"
					v-model:isShowPicker="isShowSignupPicker"
					v-model:errorMessage="signupTimeError"
					@toggle="toggleSignupPicker"
				/>

				<!-- 活动时间 -->
				<TimeSelect 
					label="活动时间"
					v-model:startValue="startValue"
					v-model:endValue="endValue"
					v-model:isShowPicker="isShowPicker"
					v-model:errorMessage="timeError"
					@toggle="togglePicker"
				/>

				<!-- 活动地点 -->
				<LocationSelect 
					label="活动地点"
					v-model:locationName="locationName"
					v-model:locationAddress="locationAddress"
					v-model:locationLatitude="locationLatitude"
					v-model:locationLongitude="locationLongitude"
				/>

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
					<!-- 只渲染已选择的标签 -->
					<template v-for="tag in tags" :key="tag.id">
						<view 
						     v-if="selectedTags.includes(tag.id)"
						     class="tag-item" 
						     :class="{ active: selectedTags.includes(tag.id) }"
						     :style="{ backgroundColor: tag.color, color: '#fff' }"
						     @click="selectTag(tag.id)">
							{{ tag.name }}
						</view>
					</template>
					<!-- 添加标签按钮 -->
					<view class="tag-item add-tag" @click="toggleTagPicker">+ 添加</view>
				</view>
			</view>

			<!-- 标签选择器 -->
			<view v-if="isShowTagPicker" class="tag-picker-container">
				<view class="tag-picker-content">
					<view class="tag-picker-header">
						<text class="tag-picker-title">选择标签</text>
						<view class="tag-picker-close" @click="toggleTagPicker">×</view>
					</view>
					<view class="tag-picker-body">
						<view v-for="tag in tags" :key="tag.id" 
						     class="tag-picker-item" 
						     :class="{ active: selectedTags.includes(tag.id) }"
						     :style="selectedTags.includes(tag.id) ? { backgroundColor: tag.color, color: '#fff' } : {}"
						     @click="selectTag(tag.id)">
							{{ tag.name }}
						</view>
					</view>
					<view class="tag-picker-footer">
						<button class="tag-picker-confirm" @click="toggleTagPicker">确定</button>
					</view>
				</view>
			</view>

			<!-- 活动详情 -->
			<view class="detail-section">
				<text class="section-title">活动详情</text>
				<textarea v-model="activityDetail" placeholder="输入详细的活动流程、注意事项等..." class="detail-textarea" placeholder-style="color: #999;"></textarea>
			</view>
		</view>
	</CommonLayout>
</template>

<script setup lang="ts">
import '@/styles/iconfont.css'

import {
	ref,
	computed,
	watch,
	onMounted,
} from 'vue'
import { usePublishStore } from '@/store/publish'
import TimeSelect from '@/components/TimeSelect/TimeSelect.vue'
import LocationSelect from '@/components/LocationSelect/LocationSelect.vue'
import UploadVideo from '@/components/UploadVideo/UploadVideo.vue'
import { postPublish, getTags, postId } from '@/api/publish/router'

// 定义标签类型
interface Tag {
	id: number
	name: string
	color: string
}

	const publishStore = usePublishStore()
	const activityTitle = ref<string>('')
const activityDetail = ref<string>('')
const fileList = ref<any[]>([])
const peopleLimit = ref<number>(20)
const locationName = ref<string>('选择线下地点')
const locationAddress = ref<string>('')
const locationLatitude = ref<number>(0)
const locationLongitude = ref<number>(0)
const contactPhone = ref<string>('')
const selectedTags = ref<number[]>([1, 2, 3]) // 默认标签ID，可根据实际选择修改
const tags = ref<Tag[]>([]) // 存储从接口获取的标签数据
const isShowTagPicker = ref<boolean>(false) // 控制标签选择器显示/隐藏
// 日期选择相关的变量和逻辑已移至TimeSelect组件
const startValue = ref<number>(Date.now())
const endValue = ref<number>(Date.now())
const signupStartValue = ref<number>(Date.now())
const signupEndValue = ref<number>(Date.now())
const isShowPicker = ref<boolean>(false)
const isShowSignupPicker = ref<boolean>(false)
const timeError = ref<string>('')
const signupTimeError = ref<string>('')

// 切换选择器显示/隐藏
const togglePicker = (): void => {
	isShowPicker.value = !isShowPicker.value
}

// 切换报名时间选择器显示/隐藏
const toggleSignupPicker = (): void => {
	isShowSignupPicker.value = !isShowSignupPicker.value
}

// 切换标签选择器显示/隐藏
const toggleTagPicker = async (): Promise<void> => {
	if (!isShowTagPicker.value) {
		// 当打开标签选择器时，获取标签数据
		await fetchTags()
	}
	isShowTagPicker.value = !isShowTagPicker.value
}

// 处理文件列表更新
const handleFileListUpdate = (val: any[]): void => {
	fileList.value = val
}

// 组件初始化时获取标签数据
onMounted(async () => {
	await fetchTags()
})

// 获取标签数据
const fetchTags = async (): Promise<void> => {
	try {
		const response: any = await getTags()
		if (response && response.code === 0 && response.data && response.data.list) {
			tags.value = response.data.list
		} else {
			tags.value = []
		}
	} catch (error) {
		uni.showToast({ title: '获取标签失败，请稍后重试', icon: 'error' })
		tags.value = []
	}
}

// 选择标签
const selectTag = (tagId: number): void => {
	const index = selectedTags.value.indexOf(tagId)
	if (index === -1) {
		// 如果标签未选中，则添加到选中列表
		selectedTags.value.push(tagId)
	} else {
		// 如果标签已选中，则从选中列表中移除
		selectedTags.value.splice(index, 1)
	}
}

// 监听结束时间变化，更新store
watch(endValue, (newValue) => {
	publishStore.setEndTime(newValue)
})

// 提交表单
const submitForm = async () => {
	try {
		// 表单验证
		if (!activityTitle.value) {
			uni.showToast({ title: '请输入活动标题', icon: 'none' })
			return
		}
		
		if (!contactPhone.value) {
			uni.showToast({ title: '请输入联系电话', icon: 'none' })
			return
		}
		
		if (!locationName.value || locationName.value === '选择线下地点') {
			uni.showToast({ title: '请选择活动地点', icon: 'none' })
			return
		}
		
		if (!peopleLimit.value || peopleLimit.value < 1) {
			uni.showToast({ title: '请设置有效的人数限制', icon: 'none' })
			return
		}
		
		if (selectedTags.value.length === 0) {
			uni.showToast({ title: '请至少选择一个活动标签', icon: 'none' })
			return
		}
		
		// 添加封面上传验证
		if (fileList.value.length === 0) {
			uni.showToast({ title: '请上传活动封面', icon: 'none' })
			return
		} else {
			if (!fileList.value[0].url) {
				uni.showToast({ title: '请等待文件上传完成', icon: 'none' })
				return
			}
		}
		
		// 时间验证
		const registerStartTime = Math.floor(signupStartValue.value / 1000)
		const registerEndTime = Math.floor(signupEndValue.value / 1000)
		const activityStartTime = Math.floor(startValue.value / 1000)
		const activityEndTime = Math.floor(endValue.value / 1000)
		
		// 检查时间顺序
		if (registerEndTime <= registerStartTime) {
			uni.showToast({ title: '报名截止时间必须在报名开始时间之后', icon: 'error' })
			return
		}
		
		if (activityStartTime <= registerEndTime) {
			uni.showToast({ title: '活动开始时间必须在报名截止时间之后', icon: 'error' })
			return
		}
		
		if (activityEndTime <= activityStartTime) {
			uni.showToast({ title: '活动结束时间必须在活动开始时间之后', icon: 'error' })
			return
		}
		
		// 上传图片获取ID
		uni.showLoading({ title: '上传图片中...' })
		const imageFile = fileList.value[0]
		// 传递实际的File对象而不是本地URL
		const uploadResponse = await postId(imageFile.file)
		if (!uploadResponse || !uploadResponse.data || !uploadResponse.data.data || !uploadResponse.data.data.id) {
			uni.hideLoading()
			uni.showToast({ title: '图片上传失败', icon: 'error' })
			return
		}
		
		const coverImageId = uploadResponse.data.data.id
		uni.hideLoading()
		
		// 准备数据 - 完全使用用户选择的数据
		const activityData = {
			title: activityTitle.value,
			coverImageId: coverImageId,
			coverType: imageFile.type === 'video' ? 2 : 1,
			content: activityDetail.value || "",
			categoryId: selectedTags.value[0],
			contactPhone: contactPhone.value,
			registerStartTime: registerStartTime,
			registerEndTime: registerEndTime,
			activityStartTime: activityStartTime,
			activityEndTime: activityEndTime,
			location: locationName.value,
			addressDetail: locationAddress.value || "",
			longitude: locationLongitude.value,
			latitude: locationLatitude.value,
			maxParticipants: Number(peopleLimit.value),
			requireApproval: false,
			requireStudentVerify: true,
			minCreditScore: 60,
			tagIds: selectedTags.value,
			isDraft: false
		} as any
		
		// 提交数据
			await postPublish(activityData)
			
			uni.showToast({ title: '发布成功', icon: 'success' })
			// 重置表单
			activityTitle.value = ''
			activityDetail.value = ''
			fileList.value = []
			peopleLimit.value = 20
			locationName.value = '选择线下地点'
			locationAddress.value = ''
			locationLatitude.value = 0
			locationLongitude.value = 0
			contactPhone.value = ''
			selectedTags.value = [1, 2, 3] // 重置为默认标签
			// 跳转到票卷列表页面
			uni.redirectTo({
				url: '/pages/ticket/index'
			})
	} catch (error) {
		uni.hideLoading()
		uni.showToast({ title: '发布失败，请稍后重试', icon: 'error' })
	}
}

// 上传相关的变量和逻辑已移至UploadVideo组件

// 地点选择相关的变量和逻辑已移至LocationSelect组件

// 返回首页
const goBackHome = () => {
	uni.redirectTo({
		url: '/pages/home/index'
	})
}
</script>

<style>
	/* 头部容器 */
	.header-container {
		background-color: #fff;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	/* 头部内容 */
	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 80rpx;
	}

	/* 左侧关闭按钮 */
	.header-left {
		flex: 0 0 60rpx;
		display: flex;
		align-items: center;
	}

	/* 关闭按钮 */
	.close-btn {
		font-size: 40rpx;
		color: #333;
		font-weight: bold;
	}

	/* 中间标题 */
	.header-title {
		flex: 1;
		text-align: center;
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	/* 右侧提交按钮 */
	.header-right {
		flex: 0 0 120rpx;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	/* 头部提交按钮 */
	.submit-btn-header {
		padding: 12rpx 24rpx;
		font-size: 26rpx;
		font-weight: 500;
		background-color: #fff7ed;
		color: #f97316;
		border-radius: 20rpx;
		border: none;
	}

	.submit-btn-header::after {
		border: none;
	}

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

	/* 上传相关的样式已移至UploadVideo组件 */

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

	/* 自定义标题样式：调整宽度和位置，避免与提交按钮重叠 */
	:deep(.standard-header .nav-title) {
		transform: translateX(-90rpx);
	}

	/* 自定义提交按钮样式：右移20rpx */
	:deep(.standard-header .nav-right) {
		transform: translateX(35rpx);
	}

	/* 标签选择器样式 */
	.tag-picker-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.tag-picker-content {
		width: 100%;
		background-color: #fff;
		border-radius: 20rpx 20rpx 0 0;
		max-height: 70vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.tag-picker-header {
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.tag-picker-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.tag-picker-close {
		font-size: 40rpx;
		color: #999;
		font-weight: bold;
	}

	.tag-picker-body {
		padding: 30rpx;
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.tag-picker-item {
		padding: 16rpx 32rpx;
		border-radius: 24rpx;
		font-size: 26rpx;
		background-color: #f5f5f5;
		color: #666;
		transition: all 0.3s ease;
	}

	.tag-picker-item.active {
		background-color: #fff7ed;
		color: #f97316;
	}

	.tag-picker-footer {
		padding: 30rpx;
		border-top: 1rpx solid #f0f0f0;
		display: flex;
		justify-content: center;
	}

	.tag-picker-confirm {
		width: 100%;
		padding: 20rpx;
		background-color: #f97316;
		color: #fff;
		border-radius: 12rpx;
		font-size: 28rpx;
		font-weight: 500;
		border: none;
	}

	.tag-picker-confirm::after {
		border: none;
	}
</style>