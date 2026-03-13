import { defineStore } from "pinia";

export const useChatStore = defineStore("chat", {
  state: () => ({
    // 当前正在查看的群聊ID
    currentGroupId: "" as string,
  }),

  getters: {
    // 是否正在查看某个群聊
    isViewingGroup: (state) => (groupId: string) => {
      return state.currentGroupId === groupId;
    },
  },

  actions: {
    // 设置当前正在查看的群聊
    setCurrentGroup(groupId: string) {
      this.currentGroupId = groupId;
    },

    // 清除当前群聊（退出群聊页面时调用）
    clearCurrentGroup() {
      this.currentGroupId = "";
    },

    // 清除指定群聊的未读消息计数
    clearGroupUnread(groupId: string) {
      try {
        const UNREAD_STORAGE_KEY = "group_unread_messages";
        const data = uni.getStorageSync(UNREAD_STORAGE_KEY);
        if (data) {
          const unreadObj = JSON.parse(data);
          if (unreadObj[groupId]) {
            unreadObj[groupId] = 0;
            uni.setStorageSync(UNREAD_STORAGE_KEY, JSON.stringify(unreadObj));
            console.log(`[ChatStore] 已清除群聊 ${groupId} 的未读消息`);
          }
        }
      } catch (error) {
        console.error("[ChatStore] 清除未读消息失败:", error);
      }
    },
  },
});
