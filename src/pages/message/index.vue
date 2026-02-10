<template>
  <CommonLayout
    headerType="title"
    title="消息"
    padding="0 0"
    :showTabBar="true"
  >
    <view class="content">
      <!-- 系统通知卡片 -->
      <view class="nav-title">
        <view class="system-notice" @click="viewSystemMsg">
          <view class="notice-icon">
            <wd-icon name="notification" size="45rpx" color="#f97316"></wd-icon>
          </view>
          <view class="notice-content">
            <view class="notice-title">系统通知</view>
            <view class="notice-desc">点击查看最新的活动状态变更</view>
          </view>
          <view class="notice-badge" v-if="unreadCount > 0">
            <view class="badge-count">{{
              unreadCount > 99 ? "99+" : unreadCount
            }}</view>
          </view>
        </view>
      </view>

      <!-- 消息列表 -->
      <view class="message-list" v-if="!loading && groups.length > 0">
        <view
          class="message-item"
          v-for="group in groups"
          :key="group.group_id"
          @click="viewChat(group.group_id)"
        >
          <view class="message-avatar">
            <image
              :src="group.avatar || defaultAvatar"
              mode="aspectFill"
            ></image>
            <view class="avatar-badge">{{ group.member_count }}</view>
          </view>
          <view class="message-content">
            <view class="message-header">
              <view class="message-title">{{ group.name }}</view>
              <view class="message-time">{{
                formatTime(group.last_message_at)
              }}</view>
            </view>
            <view class="message-text">
              <view class="message-sender">{{ group.owner_name }}:</view>
              <view class="message-artical">{{
                group.last_message || "暂无消息"
              }}</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else-if="!loading && groups.length === 0">
        <wd-icon name="chat" size="120rpx" color="#cbd5e1"></wd-icon>
        <text class="empty-text">暂无群聊消息</text>
        <text class="empty-desc">报名活动后自动加入群聊</text>
      </view>

      <!-- 加载中 -->
      <view class="loading-state" v-else>
        <AsyncLoading text="加载中..." />
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { getGroups, getNotificationsUnreadCount } from "@/api/message/router";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const defaultAvatar = "https://picsum.photos/200?random=chat";

// 数据状态
const groups = ref<any[]>([]);
const unreadCount = ref(0);
const loading = ref(true);

// 格式化时间
const formatTime = (time: string | number) => {
  try {
    let timestamp = time;

    if (typeof time === "number") {
      // 核心逻辑：判断是否为秒级时间戳
      // 10位数字的数量级在 10^9 到 10^10 之间（对应 1970年到 2286年）
      if (time < 1e12) {
        timestamp = time * 1000;
      }
    } else {
      // 如果输入是字符串类型的数字，先尝试转成数字处理
      const numTime = Number(time);
      if (!isNaN(numTime)) {
        timestamp = numTime < 1e12 ? numTime * 1000 : numTime;
      } else {
        timestamp = time;
      }
    }

    const date = new Date(timestamp);

    // 检查 Date 对象是否合法（防止类似 "abc" 导致的 Invalid Date）
    if (isNaN(date.getTime())) return typeof time === "string" ? time : "";

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}-${month}-${day}`;
  } catch {
    return typeof time === "string" ? time : "";
  }
};

// 获取群聊列表
const fetchGroups = async () => {
  loading.value = true;
  try {
    const res = await getGroups(userStore.userId);
    if (res.data?.groups) {
      groups.value = res.data.groups;
    }
  } catch (error) {
    console.error("获取群聊列表失败:", error);
    uni.showToast({
      title: "获取群聊列表失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
  }
};

// 获取未读通知数量
const fetchUnreadCount = async () => {
  try {
    const res = await getNotificationsUnreadCount(userStore.userId);
    if (res.data?.count !== undefined) {
      unreadCount.value = res.data.count;
    }
  } catch (error) {
    console.error("获取未读数量失败:", error);
  }
};

// 查看聊天
const viewChat = (group_id: string) => {
  uni.navigateTo({
    url: `/pages/message/chat?group_id=${group_id}`,
  });
};

// 查看系统通知
const viewSystemMsg = () => {
  uni.navigateTo({
    url: `/pages/message/SystemMsg`,
  });
};

onMounted(() => {
  fetchGroups();
  fetchUnreadCount();
});
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;

.content {
  background-color: $background-color;
  min-height: calc(100vh - var(--header-height) - var(--tab-bar-height));

  .nav-title {
    padding: $spacing-md;
    background-color: $surface-color;
  }

  // 系统通知卡片
  .system-notice {
    @include flex(row, flex-start, center);
    padding: $spacing-md;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-sm;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:active {
      transform: translateY(2rpx);
      box-shadow: $shadow-sm;
    }

    .notice-icon {
      margin-right: $spacing-md;
      width: 80rpx;
      height: 80rpx;
      @include flex(row, center, center);
      border-radius: $border-radius-full;
      background-color: rgba(255, 115, 22, 0.1);
    }

    .notice-content {
      flex: 1;

      .notice-title {
        font-size: $font-size-base;
        font-weight: $font-weight-semibold;
        color: $text-primary;
        margin-bottom: $spacing-xs;
      }

      .notice-desc {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }
    }

    .notice-badge {
      .badge-count {
        min-width: 36rpx;
        height: 36rpx;
        padding: 0 8rpx;
        background-color: $accent-color;
        color: $text-light;
        font-size: $font-size-xs;
        font-weight: $font-weight-semibold;
        border-radius: 18rpx;
        @include flex(row, center, center);
      }
    }
  }

  // 消息列表
  .message-list {
    padding: $spacing-md;

    .message-item {
      @include flex(row, flex-start, center);
      padding: $spacing-sm $spacing-md;
      background-color: $surface-color;
      border-radius: $border-radius-xl;
      box-shadow: $shadow-sm;
      margin-bottom: $spacing-md;
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;

      &:active {
        transform: translateY(2rpx);
        box-shadow: $shadow-sm;
      }

      .message-avatar {
        position: relative;
        margin-right: $spacing-sm;

        image {
          width: 112rpx;
          height: 112rpx;
          border-radius: $border-radius-xl;
        }

        .avatar-badge {
          position: absolute;
          top: -8rpx;
          right: -8rpx;
          min-width: 40rpx;
          height: 40rpx;
          padding: 0 10rpx;
          background-color: $accent-color;
          color: $text-light;
          font-size: $font-size-xs;
          font-weight: $font-weight-semibold;
          border-radius: 20rpx;
          @include flex(row, center, center);
        }
      }

      .message-content {
        flex: 1;
        padding: $spacing-xs;

        .message-header {
          @include flex(row, space-between, center);
          margin-bottom: $spacing-sm;

          .message-title {
            font-size: $font-size-base;
            font-weight: $font-weight-semibold;
            color: $text-primary;
          }

          .message-time {
            font-size: $font-size-xs;
            color: $text-tertiary;
          }
        }

        .message-text {
          @include flex(row, flex-start, center);
          font-size: $font-size-xs;
          color: $text-secondary;
          line-height: 1.4;

          .message-sender {
            color: $text-tertiary;
            margin-right: $spacing-xs;
          }

          .message-artical {
            max-width: 400rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }

  // 空状态
  .empty-state {
    @include flex(column, center, center);
    padding: 120rpx 0;
    gap: $spacing-md;

    .empty-text {
      font-size: $font-size-base;
      color: $text-secondary;
      font-weight: $font-weight-semibold;
    }

    .empty-desc {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }

  // 加载状态
  .loading-state {
    @include flex(column, center, center);
    padding: 120rpx 0;
  }
}
</style>
