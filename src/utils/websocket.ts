/**
 * WebSocket 聊天管理器
 * 基于 websocket.md 文档实现
 */

import type {
  WSMessage,
  WSAuthMessage,
  WSAuthSuccessMessage,
  WSNewMessageData,
  WSNotificationData,
  WSSendMessage,
  WSJoinGroupMessage,
  WSLeaveGroupMessage,
  WSMarkReadMessage,
  WSStudentAuthUpdateData,
  WSVerifyProgressData,
} from "@/types/modules/chat";

type WebSocketEventCallback = (data?: any) => void;
type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

interface WebSocketConfig {
  url: string;
  token: string;
  heartbeatInterval?: number; // 心跳间隔，默认54秒
  reconnectInterval?: number; // 重连间隔，默认3秒
  maxReconnectAttempts?: number; // 最大重连次数，默认无限
}

class ChatWebSocket {
  private ws: any = null; // 使用 any 类型，因为浏览器 WebSocket 和小程序 SocketTask 接口不兼容
  private config: WebSocketConfig;
  private isAuthenticated = false;
  private status: WebSocketStatus = "disconnected";
  private heartbeatTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private messageQueue: WSMessage[] = []; // 消息队列（未认证时缓存消息）

  // 事件监听器
  private listeners: Map<string, Set<WebSocketEventCallback>> = new Map();

  constructor(config: WebSocketConfig) {
    this.config = {
      heartbeatInterval: 54000, // 54秒
      reconnectInterval: 3000, // 3秒
      maxReconnectAttempts: Infinity,
      ...config,
    };
  }

  /**
   * 生成唯一消息ID
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 发送消息
   */
  private send(type: string, data?: any): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[WebSocket] 未连接，消息已加入队列");
      this.messageQueue.push({
        type,
        message_id: this.generateMessageId(),
        timestamp: Date.now(),
        data,
      });
      return false;
    }

    const message: WSMessage = {
      type,
      message_id: this.generateMessageId(),
      timestamp: Date.now(),
    };

    if (data !== undefined) {
      message.data = data;
    }

    try {
      this.ws.send(JSON.stringify(message));
      console.log("[WebSocket] 发送消息:", message);
      return true;
    } catch (error) {
      console.error("[WebSocket] 发送消息失败:", error);
      return false;
    }
  }

  /**
   * 连接 WebSocket
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn("[WebSocket] 已连接");
      return;
    }

    this.status = "connecting";
    this.emit("statusChange", this.status);

    try {
      // #ifdef H5
      this.ws = new WebSocket(this.config.url);
      // #endif

      // #ifndef H5
      // 小程序环境使用 uni.connectSocket
      this.ws = uni.connectSocket({
        url: this.config.url,
      });
      // #endif

      this.setupEventHandlers();
    } catch (error) {
      console.error("[WebSocket] 连接失败:", error);
      this.status = "error";
      this.emit("statusChange", this.status);
      this.handleReconnect();
    }
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    // #ifdef H5
    this.ws.onopen = () => {
      console.log("[WebSocket] 连接已建立");
      this.status = "connected";
      this.emit("statusChange", this.status);

      // 连接成功后立即认证
      this.authenticate();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("[WebSocket] 解析消息失败:", error);
      }
    };

    this.ws.onerror = (error: Event) => {
      console.error("[WebSocket] 错误:", error);
      this.status = "error";
      this.emit("statusChange", this.status);
    };

    this.ws.onclose = () => {
      console.log("[WebSocket] 连接已关闭");
      this.status = "disconnected";
      this.isAuthenticated = false;
      this.stopHeartbeat();
      this.emit("statusChange", this.status);

      // 尝试重连
      this.handleReconnect();
    };
    // #endif

    // #ifndef H5
    // 小程序环境
    this.ws.onOpen(() => {
      console.log("[WebSocket] 连接已建立");
      this.status = "connected";
      this.emit("statusChange", this.status);
      this.authenticate();
    });

    this.ws.onMessage((event: any) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("[WebSocket] 解析消息失败:", error);
      }
    });

    this.ws.onError((error: any) => {
      console.error("[WebSocket] 错误:", error);
      this.status = "error";
      this.emit("statusChange", this.status);
    });

    this.ws.onClose(() => {
      console.log("[WebSocket] 连接已关闭");
      this.status = "disconnected";
      this.isAuthenticated = false;
      this.stopHeartbeat();
      this.emit("statusChange", this.status);
      this.handleReconnect();
    });
    // #endif
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: WSMessage): void {
    console.log("[WebSocket] 收到消息:", message);

    switch (message.type) {
      case "auth_success":
        this.isAuthenticated = true;
        this.emit("authenticated");
        // 发送队列中的消息
        this.flushMessageQueue();
        this.startHeartbeat();
        break;

      case "auth_failed":
        this.isAuthenticated = false;
        this.emit("authFailed", message.data);
        break;

      case "new_message":
        this.emit("newMessage", message.data);
        break;

      case "notification":
        this.emit("notification", message.data);
        break;

      case "error":
        this.emit("error", message.data);
        break;

      case "ack":
        this.emit("ack", message.data);
        break;

      case "pong":
        // 心跳响应，不做处理
        break;

      case "student_auth_update":
        // 学生认证状态更新
        this.emit("studentAuthUpdate", message.data);
        break;

      case "verify_progress":
        // 认证进度实时更新
        this.emit("verifyProgress", message.data);
        break;

      default:
        console.warn("[WebSocket] 未知消息类型:", message.type);
    }

    // 触发通用消息事件
    this.emit("message", message);
  }

  /**
   * 认证
   */
  private authenticate(): void {
    this.send("auth", {
      token: this.config.token,
    });
  }

  /**
   * 发送队列中的消息
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.ws?.send(JSON.stringify(message));
        } catch (error) {
          console.error("[WebSocket] 发送队列消息失败:", error);
        }
      }
    }
  }

  /**
   * 开始心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send("ping");
    }, this.config.heartbeatInterval) as unknown as number;
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 处理重连
   */
  private handleReconnect(): void {
    if (
      this.reconnectAttempts >= this.config.maxReconnectAttempts! &&
      this.config.maxReconnectAttempts !== Infinity
    ) {
      console.error("[WebSocket] 已达到最大重连次数");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `[WebSocket] ${this.config.reconnectInterval}ms 后进行第 ${this.reconnectAttempts} 次重连`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval) as unknown as number;
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isAuthenticated = false;
    this.status = "disconnected";
    this.messageQueue = [];
    this.reconnectAttempts = 0;
  }

  /**
   * 添加事件监听器
   */
  on(event: string, callback: WebSocketEventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * 移除事件监听器
   */
  off(event: string, callback: WebSocketEventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] 事件回调错误 (${event}):`, error);
        }
      });
    }
  }

  /**
   * 加入群聊
   */
  joinGroup(groupId: string): void {
    this.send("join_group", { group_id: groupId });
  }

  /**
   * 离开群聊
   */
  leaveGroup(groupId: string): void {
    this.send("leave_group", { group_id: groupId });
  }

  /**
   * 发送文字消息
   */
  sendTextMessage(groupId: string, content: string): void {
    this.send("send_message", {
      group_id: groupId,
      msg_type: 1,
      content,
    });
  }

  /**
   * 发送图片消息
   */
  sendImageMessage(groupId: string, imageUrl: string): void {
    this.send("send_message", {
      group_id: groupId,
      msg_type: 2,
      image_url: imageUrl,
    });
  }

  /**
   * 标记已读
   */
  markRead(groupId: string, messageId: string): void {
    this.send("mark_read", {
      group_id: groupId,
      message_id: messageId,
    });
  }

  /**
   * 获取连接状态
   */
  getStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * 是否已认证
   */
  isAuth(): boolean {
    return this.isAuthenticated;
  }
}

// 导出单例
let wsInstance: ChatWebSocket | null = null;

/**
 * 初始化 WebSocket 连接
 */
export const initWebSocket = (config: WebSocketConfig): ChatWebSocket => {
  if (wsInstance) {
    wsInstance.disconnect();
  }
  wsInstance = new ChatWebSocket(config);
  wsInstance.connect();
  return wsInstance;
};

/**
 * 获取 WebSocket 实例
 */
export const getWebSocket = (): ChatWebSocket | null => {
  return wsInstance;
};

/**
 * 销毁 WebSocket 连接
 */
export const destroyWebSocket = (): void => {
  if (wsInstance) {
    wsInstance.disconnect();
    wsInstance = null;
  }
};

export default ChatWebSocket;
