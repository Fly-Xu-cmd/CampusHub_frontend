export interface SystemState {
  statusBarHeight: number; // 状态栏高度
  navBarHeight: number; // 导航栏高度 (不含状态栏)
  customBarHeight: number; // 总高度 (状态栏 + 导航栏)
  menuButtonInfo: UniApp.GetMenuButtonBoundingClientRectRes | null; // 胶囊信息
  safeAreaInsetsBottom: number; // 【新增】底部安全区域高度
  windowWidth: number; // 【新增】屏幕宽度 (做响应式布局可能用到)
  capsuleWidth: number; // 默认胶囊宽度 (微信默认约87px)
  capsuleRight: number; // 默认胶囊右边距
}
