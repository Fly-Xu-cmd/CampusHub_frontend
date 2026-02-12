<template>
  <CommonLayout
    headerType="none"
    padding="0 0"
    title="编辑资料"
    showBack
    bgWhite
    rightText="保存"
    @rightClick="handleSave"
  >
    <view class="header">
      <wd-icon
        name="arrow-left"
        size="48rpx"
        color="#000"
        @click="toBack"
      ></wd-icon>
      <view class="title">编辑资料</view>
      <view class="right-text" @click="handleSave">保存</view>
    </view>
    <view class="page-padding">
      <!-- 数据加载中状态 -->
      <view v-if="!isDataReady" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 表单内容 -->
      <template v-else>
        <!-- 头像上传区域 -->
        <view class="avatar-section">
          <view class="avatar-wrap" @click="chooseAvatar">
            <image :src="avatarUrl" class="avatar" mode="aspectFill" />
            <view class="cam-badge">
              <wd-icon name="camera" size="12px" color="#fff"></wd-icon>
            </view>
          </view>
          <text class="avatar-tip">点击更换头像</text>
        </view>

        <view class="form-section">
          <!-- 昵称 -->
          <view class="form-item">
            <text class="label">昵称</text>
            <input
              class="input-box"
              v-model="formData.nickname"
              placeholder="请输入昵称"
              type="text"
              maxlength="20"
            />
          </view>

          <!-- 性别 -->
          <view class="form-item">
            <text class="label">性别</text>
            <view class="gender-selector">
              <view
                class="gender-option"
                :class="{ active: formData.gender === '男' }"
                @click="formData.gender = '男'"
              >
                <wd-icon
                  name="user"
                  size="16px"
                  :color="formData.gender === '男' ? '#3b82f6' : '#94a3b8'"
                ></wd-icon>
                <text>男</text>
              </view>
              <view
                class="gender-option"
                :class="{ active: formData.gender === '女' }"
                @click="formData.gender = '女'"
              >
                <wd-icon
                  name="user"
                  size="16px"
                  :color="formData.gender === '女' ? '#ec4899' : '#94a3b8'"
                ></wd-icon>
                <text>女</text>
              </view>
            </view>
          </view>

          <!-- 年龄 -->
          <view class="form-item">
            <text class="label">年龄</text>
            <view class="age-selector">
              <picker mode="selector" :range="ageRange" @change="onAgeChange">
                <view class="picker-display">
                  {{ formData.age > 0 ? formData.age + "岁" : "请选择年龄" }}
                  <wd-icon
                    name="arrow-down"
                    size="14px"
                    color="#94a3b8"
                  ></wd-icon>
                </view>
              </picker>
            </view>
          </view>

          <!-- 个性签名 -->
          <view class="form-item">
            <text class="label">个性签名</text>
            <textarea
              class="input-box area"
              v-model="formData.introduction"
              placeholder="介绍一下自己..."
              maxlength="100"
            />
            <text class="char-count"
              >{{ formData.introduction.length }}/100</text
            >
          </view>

          <!-- 兴趣标签 -->
          <view class="form-item tags-item">
            <text class="label"
              >兴趣标签
              <text class="tag-count"
                >({{ formData.interestTagIds.length }}/{{
                  tagsList.length
                }})</text
              ></text
            >
            <view class="tags-wrapper" v-if="tagsList.length > 0">
              <view
                v-for="tag in tagsList"
                :key="tag.id"
                class="tag-item"
                :class="{ 'is-selected': isTagSelected(tag.id) }"
                :style="{
                  borderColor: isTagSelected(tag.id)
                    ? tag.tagColor || '#f97316'
                    : '#e2e8f0',
                  backgroundColor: isTagSelected(tag.id)
                    ? `${tag.tagColor || '#f97316'}15`
                    : '#fff',
                }"
                @click="toggleTag(tag.id)"
              >
                <wd-icon
                  v-if="!isImageUrl(tag.tagIcon)"
                  class-prefix="iconfont"
                  :name="tag.tagIcon || 'star-on'"
                  size="14px"
                  class="tag-icon"
                  :color="
                    isTagSelected(tag.id)
                      ? tag.tagColor || '#f97316'
                      : '#94a3b8'
                  "
                  custom-style="margin-right: 6px;"
                />

                <image
                  v-else
                  :src="tag.tagIcon"
                  class="tag-img-icon"
                  mode="aspectFit"
                />

                <text
                  class="tag-text"
                  :style="{
                    color: isTagSelected(tag.id)
                      ? tag.tagColor || '#f97316'
                      : '#64748b',
                  }"
                  >{{ tag.tagName }}</text
                >
              </view>
            </view>
            <text class="empty-tags-tip" v-else>暂无可选标签</text>
          </view>
        </view>
      </template>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useUserStore } from "@/store/user";
import { updateProfileWithAvatar } from "@/api/profile/router";
import { getTags } from "@/api/tags/router";
import type { PostUserDetailsRequest } from "@/types/modules/profile";
import type { InterestTag } from "@/types/modules/profile";

const userStore = useUserStore();
const loading = ref(false);
const hasNewAvatar = ref(false);
const newAvatarPath = ref("");
const isDataReady = ref(false); // 数据是否已准备好

// 年龄范围：10-80岁
const ageRange = Array.from({ length: 71 }, (_, i) => i + 10);

// 标签相关
const tagsList = ref<InterestTag[]>([]);
const isLoadingTags = ref(false);

// 表单数据
const formData = ref({
  nickname: "",
  gender: "",
  age: 0,
  introduction: "",
  interestTagIds: [] as number[],
});

// 头像URL（优先显示新选择的上传头像）
const avatarUrl = computed(() => {
  if (hasNewAvatar.value && newAvatarPath.value) {
    return newAvatarPath.value;
  }
  return userStore.userInfo.avatarUrl || "/static/default_avatar.png";
});

// 获取标签列表
const fetchTags = async () => {
  isLoadingTags.value = true;
  try {
    const res = await getTags();
    if (res.data && Array.isArray(res.data.interestTags)) {
      tagsList.value = res.data.interestTags;
    } else if (Array.isArray(res.data)) {
      tagsList.value = res.data as any;
    } else {
      tagsList.value = [];
    }
  } catch (error) {
    console.error("获取标签失败:", error);
    tagsList.value = [];
  } finally {
    isLoadingTags.value = false;
  }
};

// 切换标签选择
const toggleTag = (tagId: number) => {
  const index = formData.value.interestTagIds.indexOf(tagId);
  if (index > -1) {
    formData.value.interestTagIds.splice(index, 1);
  } else {
    // 最多选择10个标签
    if (formData.value.interestTagIds.length >= 10) {
      uni.showToast({ title: "最多选择10个标签", icon: "none" });
      return;
    }
    formData.value.interestTagIds.push(tagId);
  }
};

// 判断标签是否被选中
const isTagSelected = (tagId: number) => {
  return formData.value.interestTagIds.includes(tagId);
};

// 判断是否为图片URL
const isImageUrl = (str: string) => {
  if (!str) return false;
  return str.startsWith("http") || str.startsWith("/static");
};

onLoad(() => {
  // 使用 nextTick 确保 DOM 渲染完成后再更新数据
  // 这样可以避免 SSR hydration mismatch
  nextTick(() => {
    // 从用户存储中获取当前信息
    const userInfo = userStore.userInfo;
    formData.value = {
      nickname: userInfo.nickname || "",
      gender: userInfo.gender || "",
      age: userInfo.age ? Number(userInfo.age) : 0,
      introduction: userInfo.introduction || "",
      interestTagIds: userInfo.interestTags?.map((tag) => tag.id) || [],
    };
    isDataReady.value = true;
  });
  // 获取标签列表
  fetchTags();
});

// 年龄选择器变化
const onAgeChange = (e: any) => {
  const index = e.detail.value;
  formData.value.age = ageRange[index];
};

// 选择头像
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"], // 选择压缩后的图片
    sourceType: ["album", "camera"],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      newAvatarPath.value = tempFilePath;
      hasNewAvatar.value = true;
      console.log("选择的头像路径:", tempFilePath);
    },
    fail: (err) => {
      console.error("选择图片失败:", err);
    },
  });
};

// 保存
const handleSave = async () => {
  // 验证
  if (!formData.value.nickname?.trim()) {
    uni.showToast({ title: "请输入昵称", icon: "none" });
    return;
  }

  if (!formData.value.gender) {
    uni.showToast({ title: "请选择性别", icon: "none" });
    return;
  }

  if (formData.value.age <= 0) {
    uni.showToast({ title: "请选择年龄", icon: "none" });
    return;
  }

  loading.value = true;
  uni.showLoading({ title: "保存中..." });

  try {
    // 准备请求数据
    const requestData: PostUserDetailsRequest = {
      nickname: formData.value.nickname.trim(),
      gender: formData.value.gender,
      age: formData.value.age,
      introduction: formData.value.introduction.trim(),
      avatar_image: hasNewAvatar.value ? newAvatarPath.value : "",
      interestTagIds: formData.value.interestTagIds,
    };

    // 使用支持头像上传的接口
    const response = await updateProfileWithAvatar(requestData);

    uni.hideLoading();
    uni.showToast({ title: "保存成功", icon: "success" });

    // 更新本地存储的用户信息
    userStore.updateUserInfo({
      ...userStore.userInfo,
      nickname: formData.value.nickname,
      gender: formData.value.gender,
      age: String(formData.value.age),
      introduction: formData.value.introduction,
      // 如果上传了新头像，从响应中获取新头像URL
      ...(response.data?.avatarUrl && { avatarUrl: response.data.avatarUrl }),
      // 更新兴趣标签
      ...(response.data?.interestTags && {
        interestTags: response.data.interestTags,
      }),
    });

    // 清除临时头像状态
    hasNewAvatar.value = false;
    newAvatarPath.value = "";

    setTimeout(() => uni.navigateBack({ delta: 1 }), 1000);
  } catch (error) {
    uni.hideLoading();
    console.error("保存个人资料失败:", error);
    uni.showToast({ title: "保存失败，请重试", icon: "none" });
  } finally {
    loading.value = false;
  }
};

const toBack = () => {
  uni.navigateBack({
    delta: 1,
  });
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

.header {
  @include flex(row, space-between, center);
  padding: $spacing-sm 0;
  background: $surface-color;
  border-bottom: 1rpx solid $border-light;

  .title {
    font-size: $font-size-base;
    font-weight: bold;
    color: $text-primary;
  }

  .right-text {
    font-size: $font-size-base;
    font-weight: bold;
    color: $primary-color;
    padding: $spacing-sm $spacing-sm;
  }
}

.page-padding {
  padding: $spacing-lg;
}

/* --- 加载容器 --- */
.loading-container {
  @include flex(column, center, center);
  min-height: 400rpx;

  .loading-text {
    font-size: $font-size-base;
    color: $text-tertiary;
  }
}

/* --- 头像区域 --- */
.avatar-section {
  @include flex(column, center, center);
  margin-bottom: $spacing-xl;

  .avatar-wrap {
    position: relative;

    .avatar {
      width: 180rpx;
      height: 180rpx;
      border-radius: 50%;
      border: 8rpx solid $surface-color;
      box-shadow: $shadow-md;
    }

    .cam-badge {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 60rpx;
      height: 60rpx;
      background: #1e293b;
      border-radius: 50%;
      border: 4rpx solid #fff;
      @include flex(row, center, center);
    }
  }

  .avatar-tip {
    margin-top: $spacing-md;
    font-size: $font-size-sm;
    color: $text-tertiary;
  }
}

/* --- 表单项 --- */
.form-item {
  margin-bottom: $spacing-lg;
  position: relative;

  .label {
    font-size: $font-size-base;
    font-weight: bold;
    color: $text-secondary;
    margin-bottom: $spacing-sm;
    display: block;
  }

  .input-box {
    width: 100%;
    background: $background-color;
    border: 1rpx solid $border-color;
    border-radius: $border-radius-lg;
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-base;
    box-sizing: border-box;
    height: 80rpx;

    &.area {
      height: 160rpx;
      padding: $spacing-sm $spacing-md;
    }
  }

  .char-count {
    position: absolute;
    right: $spacing-sm;
    bottom: $spacing-sm;
    font-size: $font-size-xs;
    color: $text-tertiary;
  }
}

/* --- 性别选择器 --- */
.gender-selector {
  @include flex(row, flex-start, center);
  gap: $spacing-md;

  .gender-option {
    flex: 1;
    @include flex(row, center, center);
    gap: $spacing-xs;
    height: 80rpx;
    background: $background-color;
    border: 2rpx solid $border-color;
    border-radius: $border-radius-lg;
    font-size: $font-size-base;
    color: $text-secondary;
    transition: all 0.3s;

    &.active {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #3b82f6;
      font-weight: bold;
    }
  }
}

/* --- 年龄选择器 --- */
.age-selector {
  .picker-display {
    @include flex(row, space-between, center);
    width: 100%;
    height: 80rpx;
    background: $background-color;
    border: 1rpx solid $border-color;
    border-radius: $border-radius-lg;
    padding: 0 $spacing-md;
    font-size: $font-size-base;
    color: $text-primary;

    &:empty::before {
      content: "请选择年龄";
      color: $text-tertiary;
    }
  }
}

/* --- 兴趣标签选择器 --- */
.tags-item {
  .tag-count {
    font-size: $font-size-sm;
    color: $text-tertiary;
    font-weight: normal;
  }

  .tags-wrapper {
    @include flex(row, flex-start, center);
    flex-wrap: wrap;
    gap: 16rpx;

    .tag-item {
      @include flex(row, center, center);
      padding: 12rpx 20rpx;
      background-color: #fff;
      border: 2rpx solid #e2e8f0;
      border-radius: 999px;
      transition: all 0.2s ease;

      .tag-icon,
      .tag-img-icon {
        margin-right: 6rpx;
      }

      .tag-img-icon {
        width: 28rpx;
        height: 28rpx;
        opacity: 0.5;
      }

      &.is-selected .tag-img-icon {
        opacity: 1;
      }

      .tag-text {
        font-size: $font-size-sm;
        font-weight: $font-weight-bold;
        color: #64748b;
      }
    }
  }

  .empty-tags-tip {
    font-size: $font-size-sm;
    color: $text-tertiary;
    padding: $spacing-md 0;
  }
}
</style>
