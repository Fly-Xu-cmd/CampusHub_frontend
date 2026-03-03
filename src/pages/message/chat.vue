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
                  <!-- 发送状态指示器 -->
                  <view class="message-status" v-if="msg.sendStatus">
                    <!-- 发送中：转圈 -->
                    <wd-loading
                      v-if="msg.sendStatus === 'pending'"
                      size="32rpx"
                      color="#94a3b8"
                    ></wd-loading>
                    <!-- 发送失败：红色感叹号（可点击重发） -->
                    <view
                      v-else-if="msg.sendStatus === 'failed'"
                      class="retry-icon"
                      @click="resendMessage(msg)"
                    >
                      <wd-icon
                        name="error-circle-filled"
                        size="32rpx"
                        color="#ef4444"
                      ></wd-icon>
                    </view>
                  </view>
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
import type { title } from "@/types/modules/message/title";
import { useUserStore } from "@/store/user";
import { useChatStore } from "@/store/chat";
import { safeNavigateBack } from "@/utils/navigation";

const userStore = useUserStore();
const chatStore = useChatStore();
const defaultAvatar = "https://picsum.photos/200?random=avatar";

// URL 参数
let groupId = "";

// 数据状态
const groupTitle = ref<title["data"]>({} as title["data"]);
const messages = ref<ChatMessage[]>([]);
const inputText = ref("");
const scrollIntoView = ref("");
const hasMore = ref(true);
const loadingHistory = ref(false);
const loadingGroupInfo = ref(true); // 群聊信息加载状态
const initialLoading = ref(true); // 初始加载状态
const currentUserId = computed(() => userStore.userId);
const isLoadingOffline = ref(false);

// 消息发送状态跟踪
const pendingMessages = ref<Map<string, ReturnType<typeof setTimeout>>>(
  new Map(),
); // tempId -> timeoutId
const MESSAGE_TIMEOUT = 15000; // 15秒未收到确认视为发送失败

// WebSocket 事件监听器引用（用于组件卸载时移除）
const wsListeners = {
  authenticated: null as (() => void) | null,
  newMessage: null as ((data: any) => void) | null,
  error: null as ((data: any) => void) | null,
};

// 网络状态监听器引用
let networkListener: ((res: any) => void) | null = null;

// 网络状态
const showNetworkTip = ref(false);
const networkTipText = ref("");
const isConnected = ref(true);
const wasDisconnected = ref(false); // 记录之前是否处于断网状态
const networkType = ref(""); // 网络类型：wifi, 4g, 5g, 2g, 3g, none

// 初始化 WebSocket 事件监听
const initWS = () => {
  const ws = getWebSocket();
  if (!ws) {
    uni.showToast({ title: "WebSocket 未连接，请重新登录", icon: "none" });
    return;
  }

  // 定义事件处理函数
  const handleAuthenticated = () => {
    console.log("WebSocket 认证成功");
    loadHistoryMessages();
    fetchOfflineMessages();
  };

  const handleNewMessage = (data: any) => {
    console.log("收到新消息:", data);
    if (data.group_id === groupId) {
      // 检查是否是自己发送的消息（通过 tempId 匹配）
      const existingMsgIndex = messages.value.findIndex(
        (msg) =>
          msg.tempId &&
          msg.tempId.startsWith("temp-") &&
          msg.sendStatus === "pending",
      );

      if (
        existingMsgIndex !== -1 &&
        messages.value[existingMsgIndex].sender_id === data.sender_id
      ) {
        // 更新自己发送的消息状态为成功
        const msg = messages.value[existingMsgIndex];
        msg.sendStatus = "success";
        msg.message_id = data.message_id; // 更新为真实ID
        // 清除超时定时器
        if (msg.tempId && pendingMessages.value.has(msg.tempId)) {
          clearTimeout(pendingMessages.value.get(msg.tempId)!);
          pendingMessages.value.delete(msg.tempId);
        }
      } else {
        // 检查消息是否已存在（避免重复添加）
        const exists = messages.value.some(
          (m) => m.message_id === data.message_id,
        );
        if (!exists) {
          // 新消息，添加到列表
          messages.value.push({
            message_id: data.message_id,
            group_id: data.group_id,
            sender_id: data.sender_id,
            sender_name: data.sender_name,
            sender_avatar: data.sender_avatar,
            msg_type: data.msg_type,
            content: data.content,
            image_url: data.image_url,
            created_at: new Date(data.created_at * 1000).toISOString(),
          });
        }
      }
      scrollToBottom();
    }
  };

  const handleError = (data: any) => {
    console.error("WebSocket 错误:", data);
    uni.showToast({
      title: data.message || "连接错误",
      icon: "none",
    });
  };

  // 保存监听器引用
  wsListeners.authenticated = handleAuthenticated;
  wsListeners.newMessage = handleNewMessage;
  wsListeners.error = handleError;

  // 等待认证成功
  if (ws.isAuth()) {
    // 已认证，直接加入群聊
    loadHistoryMessages();
    fetchOfflineMessages();
  } else {
    // 未认证，等待认证成功
    ws.on("authenticated", handleAuthenticated);
  }

  // 监听新消息
  ws.on("newMessage", handleNewMessage);

  // 监听错误
  ws.on("error", handleError);
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
  } else {
    uni.showToast({
      title: "没有更多消息了",
      icon: "none",
    });
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

  // 记录加载前的消息数量和第一条消息ID（用于保持滚动位置）
  const oldMessageCount = messages.value.length;
  const oldFirstMessageId = messages.value[0]?.message_id;

  try {
    const res = await getGroupHistory(groupId, beforeId);
    if (res.data?.messages) {
      const newMessages = res.data.messages.reverse();
      if (beforeId) {
        messages.value = [...newMessages, ...messages.value];
        // 加载更多后，保持滚动位置（滚动到原来的第一条消息）
        nextTick(() => {
          if (oldFirstMessageId) {
            scrollIntoView.value = "msg-" + oldFirstMessageId;
          }
        });
      } else {
        messages.value = newMessages;
        // 首次加载滚动到底部
        nextTick(() => {
          scrollToBottom();
        });
      }
      hasMore.value = res.data.has_more;
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
    // 生成临时ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // 5. 先添加临时消息到列表
    const tempMessage: ChatMessage = {
      message_id: tempId,
      tempId: tempId,
      group_id: groupId,
      sender_id: currentUserId.value,
      sender_name: userStore.nickname || "我",
      msg_type: 1,
      content: text,
      created_at: new Date().toISOString(),
      sendStatus: "pending",
    };
    messages.value.push(tempMessage);

    // 6. 滚动到底部
    nextTick(() => {
      scrollToBottom();
    });

    // 7. 清空输入框
    inputText.value = "";

    // 8. 设置超时检查
    const timeoutId = setTimeout(() => {
      const msgIndex = messages.value.findIndex((m) => m.tempId === tempId);
      if (
        msgIndex !== -1 &&
        messages.value[msgIndex].sendStatus === "pending"
      ) {
        messages.value[msgIndex].sendStatus = "failed";
        console.log(`[发送消息] 消息 ${tempId} 发送超时`);
        uni.showToast({
          title: "消息发送失败，点击红色感叹号可重发",
          icon: "none",
          duration: 2000,
        });
      }
      pendingMessages.value.delete(tempId);
    }, MESSAGE_TIMEOUT);

    pendingMessages.value.set(tempId, timeoutId);

    // 9. 发送消息
    ws.sendTextMessage(groupId, text);
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

// 初始化网络监听
const initNetworkListener = () => {
  // 检查初始网络状态
  uni.getNetworkType({
    success: (res) => {
      networkType.value = res.networkType;
      const initiallyConnected = res.networkType !== "none";
      isConnected.value = initiallyConnected;

      // 检查是否为弱网环境
      if (initiallyConnected && isWeakNetwork(res.networkType)) {
        uni.showToast({
          title: "当前网络环境较弱，消息可能延迟",
          icon: "none",
          duration: 2000,
        });
      }

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
  networkListener = (res: any) => {
    networkType.value = res.networkType;
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

          // 检查是否为弱网
          if (isWeakNetwork(res.networkType)) {
            setTimeout(() => {
              uni.showToast({
                title: "当前网络环境较弱，消息可能延迟",
                icon: "none",
                duration: 2000,
              });
            }, 1600);
          }
        } else {
          // 如果之前没有被标记为断开，就不显示恢复提示
          // 但仍需隐藏断开提示（如果有）
          hideNetworkTipToast();

          // 重新初始化 WebSocket
          const ws = getWebSocket();
          if (ws && !ws.isAuth()) {
            initWS();
          }

          // 检查是否为弱网
          if (isWeakNetwork(res.networkType)) {
            uni.showToast({
              title: "当前网络环境较弱，消息可能延迟",
              icon: "none",
              duration: 2000,
            });
          }
        }
      }
    }
  };

  uni.onNetworkStatusChange(networkListener);
};

// 判断是否为弱网环境
const isWeakNetwork = (type: string): boolean => {
  return type === "2g" || type === "3g";
};

// 显示网络断开提示
const showNetworkTipToast = () => {
  showNetworkTip.value = true;
  networkTipText.value = "网络已断开，消息无法发送";
};

// 隐藏网络断开提示
const hideNetworkTipToast = () => {
  showNetworkTip.value = false;
  networkTipText.value = "";
};

// 返回上一页
const goBack = () => {
  // 清除当前查看的群聊ID
  chatStore.clearCurrentGroup();
  // 清除所有待确认消息的定时器
  pendingMessages.value.forEach((timeoutId) => clearTimeout(timeoutId));
  pendingMessages.value.clear();
  safeNavigateBack("/pages/message/index");
};

// 重发消息
const resendMessage = (message: ChatMessage) => {
  if (!message.content) return;

  // 移除失败的消息
  const index = messages.value.findIndex((m) => m.tempId === message.tempId);
  if (index !== -1) {
    messages.value.splice(index, 1);
  }

  // 清空输入框并重新发送
  inputText.value = message.content;
  nextTick(() => {
    sendMessage();
  });
};

// 页面加载
onLoad((options: any) => {
  groupId = options.group_id;
  if (groupId) {
    // 设置当前正在查看的群聊ID
    chatStore.setCurrentGroup(groupId);
    // 清除该群的未读消息计数
    chatStore.clearGroupUnread(groupId);
    fetchGroupInfo();
    initWS();
    initNetworkListener();
  }
});

// 页面卸载
onUnmounted(() => {
  // 清除当前正在查看的群聊ID
  chatStore.clearCurrentGroup();

  // 移除 WebSocket 事件监听器
  const ws = getWebSocket();
  if (ws) {
    if (wsListeners.authenticated) {
      ws.off("authenticated", wsListeners.authenticated);
    }
    if (wsListeners.newMessage) {
      ws.off("newMessage", wsListeners.newMessage);
    }
    if (wsListeners.error) {
      ws.off("error", wsListeners.error);
    }
  }

  // 移除网络状态监听器
  if (networkListener) {
    uni.offNetworkStatusChange(networkListener);
    networkListener = null;
  }

  // 清除所有待确认消息的定时器
  pendingMessages.value.forEach((timeoutId) => clearTimeout(timeoutId));
  pendingMessages.value.clear();

  // 清除滚动防抖定时器
  if (scrollTimer) {
    clearTimeout(scrollTimer);
    scrollTimer = null;
  }

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
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4rpx 12rpx rgba(239, 68, 68, 0.3);
  z-index: $z-index-tooltip;
  transform: translateY(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.show {
    transform: translateY(0);
  }

  .network-content {
    @include flex(row, center, center);
    padding: $spacing-sm $spacing-md;
    gap: $spacing-xs;

    .network-text {
      font-size: $font-size-sm;
      color: #fff;
      font-weight: $font-weight-semibold;
      letter-spacing: 0.5rpx;
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
      @include flex(row, flex-end, center);

      .message-avatar {
        margin-left: $spacing-sm;

        image {
          width: 64rpx;
          height: 64rpx;
          border-radius: $border-radius-full;
        }
      }

      .message-status {
        display: flex;
        align-items: center;
        margin-right: $spacing-xs;
        flex-shrink: 0;

        .retry-icon {
          cursor: pointer;
          padding: 4rpx;
          border-radius: $border-radius-full;
          transition: background-color 0.2s ease;

          &:active {
            background-color: rgba(239, 68, 68, 0.1);
          }
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
