<template>
  <CommonLayout headerType="none" padding="0 0">
    <!-- 聊天页面容器 -->
    <view class="chat-container">
      <!-- 顶部导航栏 -->
      <view class="chat-header">
        <view class="header-left" @click="goBack">
          <wd-icon name="arrow-left1" size="48rpx" color="#1e293b"></wd-icon>
        </view>
        <view class="header-center">
          <view class="group-name">
            {{ groupTitle.name }}({{ groupTitle.member_count }})
          </view>
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
                <image :src="defaultAvatar" mode="aspectFill"></image>
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
          <input
            type="text"
            placeholder="发送消息..."
            v-model="inputText"
            class="message-input"
          />
        </view>
        <view class="send-button" @click="sendMessage">
          <view class="send-text">发送</view>
        </view>
      </view>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getGroupInfo, getGroupHistory, getOfflineMessages } from "@/api/message/router";
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
const currentUserId = computed(() => userStore.userId);
const isLoadingOffline = ref(false);

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
    ws.joinGroup(groupId);
    loadHistoryMessages();
    fetchOfflineMessages();
  } else {
    // 未认证，等待认证成功
    ws.on("authenticated", () => {
      console.log("WebSocket 认证成功");
      ws.joinGroup(groupId);
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
  try {
    const res = await getGroupInfo(groupId);
    if (res.data) {
      groupTitle.value = res.data;
    }
  } catch (error) {
    console.error("获取群聊信息失败:", error);
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
        (msg: any) => msg.group_id === groupId
      );

      if (offlineMessages.length > 0) {
        // 将离线消息添加到消息列表（去重）
        const existingIds = new Set(messages.value.map((m) => m.message_id));
        const newMessages = offlineMessages.filter(
          (msg: any) => !existingIds.has(msg.message_id)
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
    if (scrollTop < 50 && hasMore.value && !loadingHistory.value && messages.value.length > 0) {
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

  const ws = getWebSocket();
  if (!ws || !ws.isAuth()) {
    uni.showToast({ title: "未连接", icon: "none" });
    return;
  }

  ws.sendTextMessage(groupId, text);
  inputText.value = "";
};

// 查看群聊详情
const viewChatDetail = () => {
  uni.navigateTo({
    url: `/pages/message/ChatDetail?group_id=${groupId}&name=${groupTitle.value.name}&member_count=${groupTitle.value.member_count}`,
  });
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 页面加载
onLoad((options: any) => {
  groupId = options.group_id;
  if (groupId) {
    fetchGroupInfo();
    initWS();
  }
});

// 页面卸载
onUnmounted(() => {
  const ws = getWebSocket();
  if (ws) {
    ws.leaveGroup(groupId);
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

  .header-left {
    width: 80rpx;
  }

  .header-center {
    flex: 1;
    text-align: center;

    .group-name {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $text-primary;
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
          max-width: 70%;

          .message-text {
            font-size: $font-size-sm;
            color: $text-primary;
            line-height: 1.4;
            word-break: break-all;
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
        max-width: 70%;

        .message-text {
          font-size: $font-size-sm;
          color: $text-light;
          line-height: 1.4;
          word-break: break-all;
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
  height: 150rpx;
  flex-shrink: 0;
  position: relative;
  z-index: $z-index-sticky;

  .input-container {
    flex: 1;
    margin-right: $spacing-sm;

    .message-input {
      width: 100%;
      height: 80rpx;
      padding: 0 $spacing-sm;
      background-color: $background-color;
      border: 1rpx solid $border-color;
      border-radius: $border-radius-full;
      font-size: $font-size-sm;
      color: $text-primary;
    }
  }

  .send-button {
    @include flex(row, center, center);
    background-color: $primary-color;
    border-radius: $border-radius-full;
    padding: $spacing-xs $spacing-lg;
    height: 80rpx;

    .send-text {
      font-size: $font-size-xs;
      font-weight: $font-weight-semibold;
      color: $text-light;
    }
  }
}
</style>
