<template>
  <CommonLayout headerType="none" padding="0 0">
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
    >
      <!-- 加载更多提示 -->
      <view
        class="load-more"
        v-if="hasMore && !loadingHistory"
        @click="loadHistoryMessages()"
      >
        <text>加载更多消息</text>
      </view>
      <view class="load-more loading" v-if="loadingHistory">
        <text>加载中...</text>
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
  </CommonLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getGroupInfo, getGroupHistory } from "@/api/message/router";
import { getWebSocket, initWebSocket } from "@/utils/websocket";
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

// 初始化 WebSocket
const initWS = () => {
  const token = uni.getStorageSync("accessToken");
  if (!token) {
    uni.showToast({ title: "未登录", icon: "none" });
    return;
  }

  const wsUrl = import.meta.env.VITE_WS_URL || "ws://192.168.10.9/ws";
  const ws = initWebSocket({
    url: wsUrl,
    token: token,
  });

  // 监听认证成功
  ws.on("authenticated", () => {
    console.log("WebSocket 认证成功");
    ws.joinGroup(groupId);
    loadHistoryMessages();
  });

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
});
</script>

<style scoped lang="scss">
@use "@/styles/variables.scss" as *;
@use "@/styles/mixins.scss" as *;

/* 顶部导航栏 */
.chat-header {
  @include flex(row, space-between, center);
  padding: $spacing-lg;
  background-color: $surface-color;
  border-bottom: 1rpx solid $border-color;
  height: 120rpx;
  position: sticky;
  top: 0;
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

/* 聊天消息区域 */
.chat-content {
  flex: 1;
  padding: $spacing-md;
  background-color: $background-color;
  min-height: calc(100vh - 120rpx - 240rpx);

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
      @include flex(row-reverse, flex-start, flex-start);

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

/* 底部输入区域 */
.chat-input {
  @include flex(row, flex-start, center);
  padding: $spacing-md;
  background-color: $surface-color;
  border-top: 1rpx solid $border-light;
  height: 150rpx;

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
