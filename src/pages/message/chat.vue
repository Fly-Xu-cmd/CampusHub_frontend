<template>
  <CommonLayout headerType="none" padding="0 0">
    <ClientOnly>
      <template #default>
        <!-- 聊天页面容器 -->
        <view class="chat-container">
          <!-- 网络状态提示 -->
          <view class="network-status" :class="{ show: showNetworkTip }">
            <view class="network-content">
              <wd-icon name="error-outline" size="32rpx" color="#fff"></wd-icon>
              <text class="network-text">{{ networkTipText }}</text>
            </view>
          </view>

          <!-- 顶部导航栏 -->
          <view class="chat-header">
            <view class="header-left" @click="goBack">
              <wd-icon
                name="arrow-left1"
                size="48rpx"
                color="#1e293b"
              ></wd-icon>
            </view>
            <view class="header-center">
              <view class="group-name" v-if="!loadingGroupInfo">
                {{ groupTitle.name }}({{ groupTitle.member_count }})
              </view>
              <view v-else class="skeleton-title"></view>
            </view>
            <view class="header-right" @click="viewChatDetail">
              <view class="more-icon">⋯</view>
            </view>
          </view>

          <!-- 聊天消息区域 -->
          <scroll-view
            class="chat-content"
            scroll-y
            :scroll-into-view="scrollIntoView"
            :scroll-with-animation="true"
            @scrolltoupper="handleScrollToUpper"
            @scroll="handleScroll"
            upper-threshold="50"
            enable-flex
          >
            <!-- 初始加载骨架屏 -->
            <view v-if="initialLoading" class="message-skeleton">
              <view
                v-for="i in 5"
                :key="i"
                class="skeleton-message"
                :class="{ 'skeleton-mine': i % 2 === 0 }"
              >
                <template v-if="i % 2 === 0">
                  <!-- 自己的消息：气泡在前，头像在后 -->
                  <view class="skeleton-bubble">
                    <view class="skeleton-line skeleton-line-long"></view>
                    <view class="skeleton-line skeleton-line-short"></view>
                  </view>
                  <view class="skeleton-avatar"></view>
                </template>
                <template v-else>
                  <!-- 他人的消息：头像在前，气泡在后 -->
                  <view class="skeleton-avatar"></view>
                  <view class="skeleton-bubble">
                    <view class="skeleton-line skeleton-line-long"></view>
                    <view class="skeleton-line skeleton-line-short"></view>
                  </view>
                </template>
              </view>
            </view>

            <!-- 空状态 - 无消息 -->
            <view v-else-if="messages.length === 0" class="empty-state">
              <wd-icon
                name="chat-bubble"
                size="120rpx"
                color="#cbd5e1"
              ></wd-icon>
              <text class="empty-text">暂无消息，开始聊天吧</text>
            </view>
            <!-- 加载更多提示 -->
            <view class="load-more" v-if="hasMore">
              <text v-if="loadingHistory">加载中...</text>
              <text v-else>下拉加载更多消息</text>
            </view>
            <view class="load-more" v-if="!hasMore && messages.length > 0">
              <text>没有更多消息了</text>
            </view>

            <!-- 消息列表 -->
            <view class="message-list">
              <!-- 消息项 -->
              <view
                class="message-item"
                :class="msg.sender_id === currentUserId ? 'mine' : 'others'"
                v-for="msg in messages"
                :key="msg.message_id"
                :id="'msg-' + msg.message_id"
              >
                <!-- 他人消息 -->
                <template v-if="msg.sender_id !== currentUserId">
                  <view class="message-avatar">
                    <image
                      :src="msg.sender_avatar"
                      mode="aspectFill"
                      v-if="msg.sender_avatar"
                    ></image>
                    <wd-icon
                      v-else
                      class-prefix="iconfont"
                      name="morentouxiang"
                      size="65rpx"
                      color="#94a3b8"
                    />
                  </view>
                  <view class="message-info">
                    <view class="message-sender">{{ msg.sender_name }}</view>
                    <view class="message-bubble">
                      <!-- 文字消息 -->
                      <text class="message-text" v-if="msg.msg_type === 1">{{
                        msg.content
                      }}</text>
                      <!-- 图片消息 -->
                      <image
                        class="message-image"
                        v-else-if="msg.msg_type === 2"
                        :src="msg.image_url"
                        mode="widthFix"
                      ></image>
                    </view>
                  </view>
                </template>

                <!-- 自己消息 -->
                <template v-else>
                  <view class="message-bubble">
                    <!-- 文字消息 -->
                    <text class="message-text" v-if="msg.msg_type === 1">{{
                      msg.content
                    }}</text>
                    <!-- 图片消息 -->
                    <image
                      class="message-image"
                      v-else-if="msg.msg_type === 2"
                      :src="msg.image_url"
                      mode="widthFix"
                    ></image>
                  </view>
                  <view class="message-avatar">
                    <image
                      :src="userStore.userInfo.avatarUrl || defaultAvatar"
                      mode="aspectFill"
                    ></image>
                  </view>
                </template>
              </view>
            </view>
          </scroll-view>

          <!-- 底部输入区域 -->
          <view class="chat-input">
            <view class="input-container">
              <wd-textarea
                placeholder="说点什么..."
                v-model="inputText"
                class="message-input"
                :maxlength="500"
                :auto-height="false"
                :show-count="false"
                :rows="1"
                placeholder-style="color: $text-tertiary; font-size: 28rpx;"
              />
            </view>
            <view class="send-button" @click="sendMessage">
              <view class="send-text">发送</view>
            </view>
          </view>
        </view>
      </template>
    </ClientOnly>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  getGroupInfo,
  getGroupHistory,
  getOfflineMessages,
} from "@/api/message/router";
import { getWebSocket } from "@/utils/websocket";
import type { ChatMessage } from "@/types/modules/chat";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const defaultAvatar = "https://picsum.photos/200?random=avatar";

// URL 参数
let groupId = "";

// 数据状态
const groupTitle = ref<any>({});
const messages = ref<ChatMessage[]>([]);
const inputText = ref("");
const scrollIntoView = ref("");
const hasMore = ref(true);
const loadingHistory = ref(false);
const loadingGroupInfo = ref(true); // 群聊信息加载状态
const initialLoading = ref(true); // 初始加载状态
const currentUserId = computed(() => userStore.userId);
const isLoadingOffline = ref(false);

// 网络状态
const showNetworkTip = ref(false);
const networkTipText = ref("");
const isConnected = ref(true);
const wasDisconnected = ref(false); // 记录之前是否处于断网状态

// 初始化 WebSocket 事件监听
const initWS = () => {
  const ws = getWebSocket();
  if (!ws) {
    uni.showToast({ title: "WebSocket 未连接，请重新登录", icon: "none" });
    return;
  }

  // 等待认证成功
  if (ws.isAuth()) {
    // 已认证，直接加入群聊
    loadHistoryMessages();
    fetchOfflineMessages();
  } else {
    // 未认证，等待认证成功
    ws.on("authenticated", () => {
      console.log("WebSocket 认证成功");
      loadHistoryMessages();
      fetchOfflineMessages();
    });
  }

  // 监听新消息
  ws.on("newMessage", (data: any) => {
    console.log("收到新消息:", data);
    if (data.group_id === groupId) {
      messages.value.push({
        message_id: data.message_id,
        group_id: data.group_id,
        sender_id: data.sender_id,
        sender_name: data.sender_name,
        msg_type: data.msg_type,
        content: data.content,
        image_url: data.image_url,
        created_at: new Date(data.created_at * 1000).toISOString(),
      });
      scrollToBottom();
    }
  });

  // 监听错误
  ws.on("error", (data: any) => {
    console.error("WebSocket 错误:", data);
    uni.showToast({
      title: data.message || "连接错误",
      icon: "none",
    });
  });
};

// 获取群聊信息
const fetchGroupInfo = async () => {
  loadingGroupInfo.value = true;
  try {
    const res = await getGroupInfo(groupId);
    if (res.data) {
      groupTitle.value = res.data;
    }
  } catch (error) {
    console.error("获取群聊信息失败:", error);
  } finally {
    loadingGroupInfo.value = false;
  }
};

// 获取离线消息
const fetchOfflineMessages = async () => {
  if (isLoadingOffline.value) return;

  // 从本地存储获取上次离线时间
  const lastOfflineTime = uni.getStorageSync("last_offline_time");
  if (!lastOfflineTime) {
    console.log("[离线消息] 无上次离线时间记录");
    return;
  }

  isLoadingOffline.value = true;
  try {
    const res = await getOfflineMessages(userStore.userId, lastOfflineTime);
    if (res.data?.messages && res.data.messages.length > 0) {
      console.log(`[离线消息] 获取到 ${res.data.messages.length} 条离线消息`);

      // 过滤出当前群聊的消息
      const offlineMessages = res.data.messages.filter(
        (msg: any) => msg.group_id === groupId,
      );

      if (offlineMessages.length > 0) {
        // 将离线消息添加到消息列表（去重）
        const existingIds = new Set(messages.value.map((m) => m.message_id));
        const newMessages = offlineMessages.filter(
          (msg: any) => !existingIds.has(msg.message_id),
        );

        if (newMessages.length > 0) {
          messages.value.push(...newMessages);
          nextTick(() => {
            scrollToBottom();
          });

          uni.showToast({
            title: `收到 ${newMessages.length} 条新消息`,
            icon: "none",
          });
        }
      }
    }
  } catch (error) {
    console.error("[离线消息] 获取离线消息失败:", error);
  } finally {
    isLoadingOffline.value = false;
  }
};

// 处理滚动到顶部事件（上滑加载更多历史消息）
const handleScrollToUpper = () => {
  console.log("[滚动] 触发 scrolltoupper 事件");
  if (hasMore.value && !loadingHistory.value && messages.value.length > 0) {
    const oldestMessage = messages.value[0];
    loadHistoryMessages(oldestMessage.message_id);
  }
};

// 处理滚动事件（兼容 H5）
let scrollTimer: number | null = null;
const handleScroll = (e: any) => {
  // 防抖处理，避免频繁触发
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }

  scrollTimer = setTimeout(() => {
    // #ifdef H5
    const scrollTop = e.detail.scrollTop;
    console.log("[滚动] 当前滚动位置:", scrollTop);

    // 当滚动到顶部（scrollTop < 50）且有更多消息时，加载历史消息
    if (
      scrollTop < 50 &&
      hasMore.value &&
      !loadingHistory.value &&
      messages.value.length > 0
    ) {
      console.log("[滚动] 触发加载历史消息");
      const oldestMessage = messages.value[0];
      loadHistoryMessages(oldestMessage.message_id);
    }
    // #endif
  }, 100) as unknown as number;
};

// 获取历史消息
const loadHistoryMessages = async (beforeId?: string) => {
  if (loadingHistory.value) return;
  loadingHistory.value = true;

  // 首次加载时显示骨架屏
  if (!beforeId) {
    initialLoading.value = true;
  }

  try {
    const res = await getGroupHistory(groupId, beforeId);
    if (res.data?.messages) {
      const newMessages = res.data.messages.reverse();
      if (beforeId) {
        messages.value = [...newMessages, ...messages.value];
      } else {
        messages.value = newMessages;
      }
      hasMore.value = res.data.has_more;

      // 首次加载滚动到底部
      if (!beforeId) {
        nextTick(() => {
          scrollToBottom();
        });
      }
    }
  } catch (error) {
    console.error("获取历史消息失败:", error);
  } finally {
    loadingHistory.value = false;
    if (!beforeId) {
      initialLoading.value = false;
    }
  }
};

// 暴露给模板
defineExpose({
  loadHistoryMessages,
});

// 滚动到底部
const scrollToBottom = () => {
  if (messages.value.length > 0) {
    const lastMsg = messages.value[messages.value.length - 1];
    scrollIntoView.value = "msg-" + lastMsg.message_id;
  }
};

// 发送消息
const sendMessage = () => {
  const text = inputText.value.trim();

  if (!text) return;

  // 1. 检查网络状态
  if (!isConnected.value) {
    uni.showToast({
      title: "网络未连接，请检查网络设置",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  // 2. 检查 WebSocket 实例
  const ws = getWebSocket();
  if (!ws) {
    uni.showToast({
      title: "连接已断开，请重新登录",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  // 3. 检查 WebSocket 连接状态
  const status = ws.getStatus();
  if (status !== "connected") {
    let errorMsg = "连接异常";
    switch (status) {
      case "connecting":
        errorMsg = "正在连接中，请稍后...";
        break;
      case "disconnected":
        errorMsg = "连接已断开，正在重连...";
        break;
      case "error":
        errorMsg = "连接错误，请重新登录";
        break;
    }

    uni.showToast({
      title: errorMsg,
      icon: "none",
      duration: 2000,
    });
    return;
  }

  // 4. 检查 WebSocket 认证状态
  if (!ws.isAuth()) {
    uni.showToast({
      title: "连接未认证，请重新登录",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  try {
    // 5. 发送消息
    ws.sendTextMessage(groupId, text);
    inputText.value = ""; // 只在发送成功后清空输入框
  } catch (error) {
    console.error("[发送消息] 失败:", error);
    uni.showToast({
      title: "发送失败，请重试",
      icon: "none",
      duration: 2000,
    });
  }
};

// 查看群聊详情
const viewChatDetail = () => {
  uni.navigateTo({
    url: `/pages/message/ChatDetail?group_id=${groupId}&name=${groupTitle.value.name}&member_count=${groupTitle.value.member_count}`,
  });
};

import { safeNavigateBack } from "@/utils/navigation";

// 初始化网络监听
const initNetworkListener = () => {
  // 检查初始网络状态
  uni.getNetworkType({
    success: (res) => {
      const initiallyConnected = res.networkType !== "none";
      isConnected.value = initiallyConnected;

      // 如果初始就是断开状态，标记为已断开
      if (!initiallyConnected) {
        wasDisconnected.value = true;
        showNetworkTipToast();
      } else {
        // 如果初始是连接状态，确保不标记为断开过
        wasDisconnected.value = false;
      }
    },
  });

  // 监听网络状态变化
  const handleNetworkChange = (res: any) => {
    const nowConnected = res.isConnected;

    // 只有当状态真正改变时才处理
    if (nowConnected !== isConnected.value) {
      isConnected.value = nowConnected;

      if (!nowConnected) {
        // ⭐ 网络断开 - 先隐藏可能的恢复提示，再标记断开状态
        wasDisconnected.value = true;
        showNetworkTipToast();
      } else {
        // ⭐ 网络恢复 - 只有在之前确实被标记为断开时才显示恢复提示
        if (wasDisconnected.value) {
          // 隐藏断开提示
          hideNetworkTipToast();

          // 重新初始化 WebSocket
          const ws = getWebSocket();
          if (ws && !ws.isAuth()) {
            initWS();
          }

          // 立即重置标志（防止重复触发）
          wasDisconnected.value = false;

          // 显示恢复提示
          uni.showToast({
            title: "网络已恢复",
            icon: "success",
            duration: 1500,
          });
        } else {
          // 如果之前没有被标记为断开，就不显示恢复提示
          // 但仍需隐藏断开提示（如果有）
          hideNetworkTipToast();

          // 重新初始化 WebSocket
          const ws = getWebSocket();
          if (ws && !ws.isAuth()) {
            initWS();
          }
        }
      }
    }
  };

  uni.onNetworkStatusChange(handleNetworkChange);
};

// 显示网络断开提示
const showNetworkTipToast = () => {
  showNetworkTip.value = true;
  networkTipText.value = "网络已断开，请检查网络连接";
};

// 隐藏网络断开提示
const hideNetworkTipToast = () => {
  showNetworkTip.value = false;
  networkTipText.value = "";
};

// 返回上一页
const goBack = () => {
  safeNavigateBack("/pages/message/index");
};

// 页面加载
onLoad((options: any) => {
  groupId = options.group_id;
  if (groupId) {
    fetchGroupInfo();
    initWS();
    initNetworkListener();
  }
});

// 页面卸载
onUnmounted(() => {
  // 保存当前时间作为离线时间
  const currentTime = Math.floor(Date.now() / 1000);
  uni.setStorageSync("last_offline_time", currentTime);
  console.log("[聊天页面] 已保存离线时间:", currentTime);
});
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

/* 聊天页面容器 - 使用固定定位确保内部元素稳定 */
.chat-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background-color: $background-color;
  z-index: 1;
}

/* 网络状态提示 */
.network-status {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #ef4444;
  z-index: $z-index-tooltip;
  transform: translateY(-100%);
  transition: transform 0.3s ease;

  &.show {
    transform: translateY(0);
  }

  .network-content {
    @include flex(row, center, center);
    padding: $spacing-sm;
    gap: $spacing-xs;

    .network-text {
      font-size: $font-size-xs;
      color: #fff;
      font-weight: $font-weight-medium;
    }
  }
}

/* 顶部导航栏 - 固定定位 */
.chat-header {
  @include flex(row, space-between, center);
  padding: $spacing-lg;
  background-color: $surface-color;
  border-bottom: 1rpx solid $border-color;
  height: 120rpx;
  flex-shrink: 0;
  position: relative;
  z-index: $z-index-sticky;
}

.header-left {
  width: 80rpx;
}

.header-center {
  width: 50%;
  text-align: center;

  .group-name {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    max-width: 100%;
    @include truncate(1);
    white-space: nowrap;
  }

  .skeleton-title {
    width: 200rpx;
    height: 32rpx;
    margin: 0 auto;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: 4rpx;
  }
}

.header-right {
  width: 80rpx;
  display: flex;
  justify-content: flex-end;

  .more-icon {
    font-size: $font-size-xl;
    color: $text-primary;
  }
}

/* 聊天消息区域 - 占据剩余空间 */
.chat-content {
  flex: 1;
  padding: $spacing-md;
  background-color: $background-color;
  overflow-y: auto;

  .load-more {
    @include flex(row, center, center);
    padding: $spacing-sm;
    font-size: $font-size-xs;
    color: $text-tertiary;

    &.loading {
      color: $primary-color;
    }
  }

  /* 骨架屏 */
  .message-skeleton {
    .skeleton-message {
      @include flex(row, flex-start, flex-start);
      margin-bottom: $spacing-md;

      .skeleton-avatar {
        width: 64rpx;
        height: 64rpx;
        border-radius: $border-radius-full;
        background: linear-gradient(
          90deg,
          #f0f0f0 25%,
          #e0e0e0 50%,
          #f0f0f0 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        flex-shrink: 0;
      }

      .skeleton-bubble {
        margin-left: $spacing-sm;
        padding: $spacing-sm;
        background: linear-gradient(
          90deg,
          #f0f0f0 25%,
          #e0e0e0 50%,
          #f0f0f0 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: $border-radius-lg;
        min-width: 200rpx;
        max-width: 70%;

        .skeleton-line {
          height: 28rpx;
          border-radius: 4rpx;
          background: linear-gradient(
            90deg,
            #e0e0e0 25%,
            #d0d0d0 50%,
            #e0e0e0 75%
          );
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;

          &.skeleton-line-long {
            width: 100%;
            margin-bottom: $spacing-xs;
          }

          &.skeleton-line-short {
            width: 60%;
          }
        }
      }

      &.skeleton-mine {
        @include flex(row, flex-end, flex-start);

        .skeleton-avatar {
          margin-left: $spacing-sm;
          margin-right: 0;
        }

        .skeleton-bubble {
          margin-left: 0;
          margin-right: $spacing-sm;
        }
      }
    }
  }

  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* 空状态 */
  .empty-state {
    @include flex(column, center, center);
    height: 100%;
    gap: $spacing-lg;

    .empty-text {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }

  /* 消息时间 */
  .message-time {
    @include flex(row, center, flex-start);
    margin-bottom: $spacing-md;

    .time-text {
      font-size: $font-size-xs;
      color: $text-tertiary;
      background-color: rgba(0, 0, 0, 0.05);
      padding: $spacing-xs $spacing-sm;
      border-radius: $border-radius-full;
    }
  }

  /* 消息项 */
  .message-item {
    @include flex(row, flex-start, flex-start);
    margin-bottom: $spacing-md;

    /* 他人消息 */
    &.others {
      align-items: flex-start;

      .message-avatar {
        margin-right: $spacing-sm;

        image {
          width: 64rpx;
          height: 64rpx;
          border-radius: $border-radius-full;
        }
      }
      .message-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .message-sender {
          font-size: $font-size-xs;
          color: $text-tertiary;
          margin-bottom: $spacing-xs;
        }
        .message-bubble {
          background-color: $surface-color;
          border-radius: $border-radius-lg;
          border-top-left-radius: 0;
          padding: $spacing-sm;
          box-shadow: $shadow-sm;
          width: fit-content;
          max-width: 70%;

          .message-text {
            font-size: $font-size-sm;
            color: $text-primary;
            line-height: 1.5;
            word-break: break-word;
            white-space: pre-wrap;
            display: inline;
          }

          .message-image {
            max-width: 400rpx;
            border-radius: $border-radius-md;
          }
        }
      }
    }

    /* 自己消息 */
    &.mine {
      @include flex(row, flex-end, flex-start);

      .message-avatar {
        margin-left: $spacing-sm;

        image {
          width: 64rpx;
          height: 64rpx;
          border-radius: $border-radius-full;
        }
      }

      .message-bubble {
        background-color: $primary-color;
        border-radius: $border-radius-lg;
        border-top-right-radius: 0;
        padding: $spacing-sm;
        box-shadow: $shadow-sm;
        width: fit-content;
        max-width: 70%;

        .message-text {
          font-size: $font-size-sm;
          color: $text-light;
          line-height: 1.5;
          word-break: break-word;
          white-space: pre-wrap;
          display: inline;
        }

        .message-image {
          max-width: 400rpx;
          border-radius: $border-radius-md;
        }
      }
    }
  }
}

/* 底部输入区域 - 固定在底部 */
.chat-input {
  @include flex(row, flex-start, center);
  padding: $spacing-md;
  background-color: $surface-color;
  border-top: 1rpx solid $border-light;
  max-height: 240rpx;
  flex-shrink: 0;
  position: relative;
  z-index: $z-index-sticky;

  .input-container {
    flex: 1;
    margin-right: $spacing-sm;
    display: flex;
    align-items: center;
    // max-height: 240rpx;

    .message-input {
      width: 100%;
      // max-height: 240rpx;
      padding: 0;
      background-color: $background-color;
      border: 2rpx solid $border-color;
      border-radius: 40rpx;
      font-size: 28rpx;
      line-height: 40rpx;
      color: $text-primary;
      transition: all 0.3s ease;
      box-sizing: border-box;

      &:focus {
        background-color: #fff;
        border-color: $primary-color;
        box-shadow: 0 0 0 4rpx rgba(249, 115, 22, 0.1);
      }

      &::placeholder {
        color: $text-tertiary;
        font-size: 28rpx;
      }
    }

    /* Wot Design Uni textarea 组件内部样式覆盖 */
    :deep(.wd-textarea) {
      background-color: transparent !important;
      border: none !important;
      padding: 0 !important;
      height: 120rpx !important;
      overflow-y: auto !important;
    }

    :deep(.wd-textarea__inner) {
      background-color: transparent !important;
      border: none !important;
      padding: 20rpx 24rpx !important;
      line-height: 40rpx !important;
      font-size: 28rpx !important;
      color: $text-primary !important;
      box-sizing: border-box !important;
      height: 120rpx !important;
      overflow-y: auto !important;

      /* 输入框滚动条样式 (H5) */
      /* #ifdef H5 */
      &::-webkit-scrollbar {
        width: 6rpx;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 3rpx;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.3);
      }
      /* #endif */
    }
  }

  .send-button {
    @include flex(row, center, center);
    background-color: $primary-color;
    border-radius: $border-radius-full;
    padding: 0 $spacing-lg;
    height: 80rpx;
    flex-shrink: 0;

    .send-text {
      font-size: $font-size-xs;
      font-weight: $font-weight-semibold;
      color: $text-light;
      white-space: nowrap;
    }
  }
}
</style>
