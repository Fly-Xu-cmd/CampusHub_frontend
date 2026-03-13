WebSocket 聊天接口文档

📡 连接信息

连接地址

推荐方式（合并模式）：
ws://192.168.10.9/ws

连接配置

- 协议: WebSocket
- 最大消息大小: 512KB
- 心跳间隔: 54秒（服务端主动发送 ping）
- 连接超时: 60秒（无心跳则断开）
- 允许跨域: 是

---

🔐 认证流程

重要:
连接建立后，必须先发送认证消息，否则其他操作会返回
401 错误。

1. 建立连接

const ws = new WebSocket('ws://localhost:8003/ws');

2. 发送认证消息

ws.onopen = () => {
ws.send(JSON.stringify({
type: 'auth',
message_id: generateUUID(), // 唯一消息ID
timestamp: Date.now(),
data: {
token: 'your-jwt-token' // JWT Token
}
}));
};

3. 接收认证结果

ws.onmessage = (event) => {
const msg = JSON.parse(event.data);

    if (msg.type === 'auth_success') {
      console.log('认证成功');
    } else if (msg.type === 'auth_failed') {
      console.log('认证失败:', msg.data);
    }

};

---

📨 消息格式

基础消息结构

所有消息都遵循以下 JSON 格式：

interface WSMessage {
type: string; // 消息类型
message_id: string; // 消息ID（用于去重和确认）
timestamp: number; // 时间戳（毫秒）
data?: any; // 消息数据（可选）
}

---

📤 客户端 → 服务端消息

1. 心跳 (ping)

{
type: 'ping',
message_id: 'uuid',
timestamp: 1234567890
}

2. 认证 (auth)

{
type: 'auth',
message_id: 'uuid',
timestamp: 1234567890,
data: {
token: 'jwt-token-string'
}
}

3. 发送消息 (send_message)

{
type: 'send_message',
message_id: 'uuid',
timestamp: 1234567890,
data: {
group_id: 'group-123', // 群聊ID
msg_type: 1, // 1-文字, 2-图片
content: '消息内容', //
文本内容（msg_type=1时）
image_url: 'https://...' //
图片URL（msg_type=2时）
}
}

4. 加入群聊 (join_group)

{
type: 'join_group',
message_id: 'uuid',
timestamp: 1234567890,
data: {
group_id: 'group-123'
}
}

5. 离开群聊 (leave_group)

{
type: 'leave_group',
message_id: 'uuid',
timestamp: 1234567890,
data: {
group_id: 'group-123'
}
}

6. 标记已读 (mark_read)

{
type: 'mark_read',
message_id: 'uuid',
timestamp: 1234567890,
data: {
group_id: 'group-123',
message_id: 'msg-456'
}
}

---

服务端 → 客户端消息

1. 心跳响应 (pong)

{
type: 'pong',
message_id: 'uuid',
timestamp: 1234567890
}

2. 认证成功 (auth_success)

{
type: 'auth_success',
message_id: 'uuid',
timestamp: 1234567890
}

3. 认证失败 (auth_failed)

{
type: 'auth_failed',
message_id: 'uuid',
timestamp: 1234567890,
data: {
code: 401,
message: '认证失败原因'
}
}

4. 新消息 (new_message)

{
type: 'new_message',
message_id: 'uuid',
timestamp: 1234567890,
data: {
message_id: 'msg-123',
group_id: 'group-456',
sender_id: 789,
sender_name: '张三',
msg_type: 1, // 1-文字, 2-图片
content: '消息内容',
image_url: '',
created_at: 1234567890
}
}

5. 系统通知 (notification)

{
type: 'notification',
message_id: 'uuid',
timestamp: 1234567890,
data: {
notification_id: 'notif-123',
type: 'system',
title: '通知标题',
content: '通知内容',
created_at: 1234567890
}
}

6. 错误消息 (error)

{
type: 'error',
message_id: 'uuid',
timestamp: 1234567890,
data: {
code: 400,
message: '错误描述'
}
}

7. 消息确认 (ack)

{
type: 'ack',
message_id: 'uuid',
timestamp: 1234567890,
data: {
message_id: 'original-msg-id',
success: true
}
}

---

💡 完整示例代码

class ChatWebSocket {
constructor(url, token) {
this.url = url;
this.token = token;
this.ws = null;
this.isAuthenticated = false;
}

    // 生成唯一消息ID
    generateMessageId() {
      return

`${Date.now()}-${Math.random().toString(36).substr(2,
   9)}`;
}

    // 连接
    connect() {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket 连接已建立');
        this.authenticate();
      };

      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        this.handleMessage(msg);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket 连接已关闭');
        this.isAuthenticated = false;
        // 可以实现重连逻辑
      };
    }

    // 认证
    authenticate() {
      this.send('auth', {
        token: this.token
      });
    }

    // 发送消息
    send(type, data = null) {
      const message = {
        type,
        message_id: this.generateMessageId(),
        timestamp: Date.now()
      };

      if (data) {
        message.data = data;
      }

      this.ws.send(JSON.stringify(message));
    }

    // 处理接收到的消息
    handleMessage(msg) {
      switch (msg.type) {
        case 'auth_success':
          this.isAuthenticated = true;
          console.log('认证成功');
          break;

        case 'auth_failed':
          console.error('认证失败:', msg.data);
          break;

        case 'new_message':
          this.onNewMessage(msg.data);
          break;

        case 'notification':
          this.onNotification(msg.data);
          break;

        case 'error':
          console.error('服务器错误:', msg.data);
          break;

        case 'pong':
          // 心跳响应
          break;

        case 'ack':
          console.log('消息已确认:', msg.data);
          break;
      }
    }

    // 加入群聊
    joinGroup(groupId) {
      this.send('join_group', { group_id: groupId });
    }

    // 离开群聊
    leaveGroup(groupId) {
      this.send('leave_group', { group_id: groupId });
    }

    // 发送文字消息
    sendTextMessage(groupId, content) {
      this.send('send_message', {
        group_id: groupId,
        msg_type: 1,
        content: content
      });
    }

    // 发送图片消息
    sendImageMessage(groupId, imageUrl) {
      this.send('send_message', {
        group_id: groupId,
        msg_type: 2,
        image_url: imageUrl
      });
    }

    // 标记已读
    markRead(groupId, messageId) {
      this.send('mark_read', {
        group_id: groupId,
        message_id: messageId
      });
    }

    // 心跳
    ping() {
      this.send('ping');
    }

    // 断开连接
    disconnect() {
      if (this.ws) {
        this.ws.close();
      }
    }

    // 新消息回调（需要自定义）
    onNewMessage(data) {
      console.log('收到新消息:', data);
    }

    // 通知回调（需要自定义）
    onNotification(data) {
      console.log('收到通知:', data);
    }

}

// 使用示例
const chat = new
ChatWebSocket('ws://localhost:8003/ws',
'your-jwt-token');
chat.connect();

// 认证成功后
setTimeout(() => {
chat.joinGroup('group-123');
chat.sendTextMessage('group-123', 'Hello World!');
}, 1000);

---

⚠️ 注意事项

1. 认证必须: 连接后必须先发送 auth
   消息，否则其他操作会返回 401 错误
2. 消息ID唯一性: 每条消息的 message_id
   应该是唯一的，用于去重和确认
3. 心跳机制: 服务端每 54 秒会发送
   ping，客户端应保持连接活跃
4. 消息大小限制: 单条消息不超过 512KB
5. 群聊管理: 发送消息前需要先 join_group
6. 错误处理: 监听 error 类型消息，处理各种错误情况
7. 重连机制: 建议实现断线重连逻辑

---

🔧 错误码说明
┌────────┬────────────────────┐
│ 错误码 │ 说明 │
├────────┼────────────────────┤
│ 400 │ 消息格式错误 │
├────────┼────────────────────┤
│ 401 │ 未授权，需要先认证 │
├────────┼────────────────────┤
│ 403 │ 权限不足 │
├────────┼────────────────────┤
│ 404 │ 资源不存在 │
├────────┼────────────────────┤
│ 500 │ 服务器内部错误 │
└────────┴────────────────────┘

---
