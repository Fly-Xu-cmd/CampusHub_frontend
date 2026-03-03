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
              :src="group.cover_url || defaultAvatar"
              mode="aspectFill"
            ></image>
            <view
              class="avatar-badge"
              v-show="getGroupUnreadCount(group.group_id) > 0"
              >{{ getGroupUnreadCount(group.group_id) }}</view
            >
          </view>
          <view class="message-content">
            <view class="message-header">
              <view class="message-title">{{ group.name }}</view>
              <view class="message-time">{{
                formatTime(group.last_message_at)
              }}</view>
            </view>
            <view class="message-text">
              <view class="message-sender">{{ group.last_sender_name }}:</view>
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

      <!-- 骨架屏 -->
      <view class="loading-state" v-else>
        <MessageListSkeleton :count="5" />
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import {
  getGroups,
  getNotificationsUnreadCount,
  getOfflineMessages,
} from "@/api/message/router";
import { useUserStore } from "@/store/user";
import { getWebSocket } from "@/utils/websocket";

const userStore = useUserStore();
const defaultAvatar = "https://picsum.photos/200?random=chat";

// 数据状态
const groups = ref<any[]>([]);
const unreadCount = ref(0);
const loading = ref(true);

// 群聊未读消息数量映射（group_id -> unread_count）
const groupUnreadMap = ref<Map<string, number>>(new Map());

// 本地存储 key
const UNREAD_STORAGE_KEY = "group_unread_messages";

// 从本地存储加载未读消息数量
const loadUnreadFromStorage = () => {
  try {
    const data = uni.getStorageSync(UNREAD_STORAGE_KEY);
    if (data) {
      const unreadObj = JSON.parse(data);
      groupUnreadMap.value = new Map(Object.entries(unreadObj));
      console.log(
        "[消息列表] 已从本地存储恢复未读消息数量:",
        groupUnreadMap.value,
      );
    }
  } catch (error) {
    console.error("[消息列表] 加载未读消息数量失败:", error);
  }
};

// 保存未读消息数量到本地存储
const saveUnreadToStorage = () => {
  try {
    const unreadObj = Object.fromEntries(groupUnreadMap.value);
    uni.setStorageSync(UNREAD_STORAGE_KEY, JSON.stringify(unreadObj));
  } catch (error) {
    console.error("[消息列表] 保存未读消息数量失败:", error);
  }
};

// WebSocket 事件处理器
const handleNewMessage = (data: any) => {
  console.log("[消息列表] 收到新消息:", data);

  // 如果是自己发送的消息，不增加未读计数
  if (data.sender_id === userStore.userId) {
    console.log("[消息列表] 自己发送的消息，不计入未读");
    // 更新最后一条消息信息（不增加未读）
    const groupIndex = groups.value.findIndex(
      (g) => g.group_id === data.group_id,
    );
    if (groupIndex !== -1) {
      const group = groups.value[groupIndex];
      group.last_message = data.msg_type === 1 ? data.content : "[图片]";
      group.last_message_at = data.created_at;
      group.last_sender_name = data.sender_name;
    }
    return;
  }

  // 查找对应的群聊
  const groupIndex = groups.value.findIndex(
    (g) => g.group_id === data.group_id,
  );

  if (groupIndex !== -1) {
    // 群聊已存在，更新最后一条消息信息
    const group = groups.value[groupIndex];
    group.last_message = data.msg_type === 1 ? data.content : "[图片]";
    group.last_message_at = data.created_at;
    group.last_sender_name = data.sender_name;

    // 增加未读消息数量
    const currentUnread = groupUnreadMap.value.get(data.group_id) || 0;
    groupUnreadMap.value.set(data.group_id, currentUnread + 1);

    // 保存到本地存储
    saveUnreadToStorage();

    // 按未读数量和最后消息时间重新排序
    sortGroupsByUnread();
  } else {
    // 群聊不存在，刷新整个列表
    fetchGroups();
  }
};

const handleNewSystemMessage = (data: any) => {
  console.log("[消息列表] 收到通知:", data);
  if (data.type === "notification") {
    fetchUnreadCount();
  }
};

// 获取群聊未读消息数量
const getGroupUnreadCount = (groupId: string): number => {
  return groupUnreadMap.value.get(groupId) || 0;
};

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

// 获取离线消息并更新未读数量
const fetchOfflineMessages = async () => {
  // 从本地存储获取上次离线时间
  const lastOfflineTime = uni.getStorageSync("last_offline_time");
  if (!lastOfflineTime) {
    console.log("[消息列表] 无上次离线时间记录，跳过离线消息获取");
    return;
  }

  try {
    const res = await getOfflineMessages(userStore.userId, lastOfflineTime);
    if (res.data?.messages && res.data.messages.length > 0) {
      console.log(`[消息列表] 获取到 ${res.data.messages.length} 条离线消息`);

      // 统计每个群组的离线消息数量（排除自己发送的消息）
      const offlineUnreadMap = new Map<string, number>();
      res.data.messages.forEach((msg: any) => {
        // 排除自己发送的消息
        if (msg.sender_id !== userStore.userId) {
          const count = offlineUnreadMap.get(msg.group_id) || 0;
          offlineUnreadMap.set(msg.group_id, count + 1);
        }
      });

      // 更新群组未读数量（累加到现有数量上）
      offlineUnreadMap.forEach((count, groupId) => {
        const currentUnread = groupUnreadMap.value.get(groupId) || 0;
        groupUnreadMap.value.set(groupId, currentUnread + count);
      });

      // 保存到本地存储
      saveUnreadToStorage();

      // 按未读数量和最后消息时间重新排序群组
      sortGroupsByUnread();

      // 显示提示
      const totalUnread = Array.from(offlineUnreadMap.values()).reduce(
        (sum, count) => sum + count,
        0,
      );
      if (totalUnread > 0) {
        uni.showToast({
          title: `收到 ${totalUnread} 条新消息`,
          icon: "none",
        });
      }
    }
  } catch (error) {
    console.error("[消息列表] 获取离线消息失败:", error);
  }
};

// 按未读数量和最后消息时间排序群组
const sortGroupsByUnread = () => {
  groups.value.sort((a, b) => {
    // 优先按未读数量排序（有未读的排前面）
    const unreadA = groupUnreadMap.value.get(a.group_id) || 0;
    const unreadB = groupUnreadMap.value.get(b.group_id) || 0;

    if (unreadA > 0 && unreadB === 0) return -1;
    if (unreadB > 0 && unreadA === 0) return 1;
    if (unreadA !== unreadB) return unreadB - unreadA;

    // 未读数量相同时，按最后消息时间排序
    const timeA = new Date(a.last_message_at || 0).getTime();
    const timeB = new Date(b.last_message_at || 0).getTime();
    return timeB - timeA;
  });
};

// 查看聊天
const viewChat = (group_id: string) => {
  // 清空该群聊的未读消息数量
  groupUnreadMap.value.set(group_id, 0);

  // 保存到本地存储
  saveUnreadToStorage();

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

onShow(() => {
  // 每次页面显示时刷新未读数量
  fetchUnreadCount();
});

onMounted(async () => {
  // 从本地存储恢复未读消息数量
  loadUnreadFromStorage();

  // 获取群聊列表
  await fetchGroups();

  // 获取离线消息并更新未读数量
  await fetchOfflineMessages();

  // 获取系统通知未读数
  fetchUnreadCount();

  // 注册 WebSocket 新消息监听
  const ws = getWebSocket();
  if (ws) {
    ws.on("newMessage", handleNewMessage);
    ws.on("notification", handleNewSystemMessage);
    console.log("[消息列表] 已注册 WebSocket 新消息监听");
  }
});

onUnmounted(() => {
  // 移除 WebSocket 新消息监听
  const ws = getWebSocket();
  if (ws) {
    ws.off("newMessage", handleNewMessage);
    ws.off("notification", handleNewSystemMessage);
    console.log("[消息列表] 已移除 WebSocket 新消息监听");
  }
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

          .unread-badge {
            min-width: 36rpx;
            height: 36rpx;
            padding: 0 8rpx;
            background-color: $accent-color;
            color: $text-light;
            font-size: $font-size-xs;
            font-weight: $font-weight-semibold;
            border-radius: 18rpx;
            @include flex(row, center, center);
            margin-left: $spacing-sm;
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
    width: 100%;
  }
}
</style>
