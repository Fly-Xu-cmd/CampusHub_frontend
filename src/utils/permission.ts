import { useUserStore } from "@/store/user";

// 1. 白名单：不需要登录就能访问的页面路径
const whiteList = [
  "/", // 根路径
  "/pages/home/index",
  "/pages/home/detail",
  "/pages/home/publicProfile",
  "/pages/login/index",
  "/pages/register/index",
  "/pages/selectTags/index", // 注册后的标签选择
  "/pages/profile/index",
  "/pages/publish/index",
  "/pages/ticket/index", // 用户个人中心
  // '/pages/message/message', // 如果消息列表允许游客看，就加上
];

// 2. 需要拦截的 API 列表
const interceptList = ["navigateTo", "redirectTo", "reLaunch", "switchTab"];

export default function initPermission() {
  // 遍历监听所有路由方法
  interceptList.forEach((key) => {
    uni.addInterceptor(key, {
      invoke(args) {
        // args.url 是跳转的目标路径，例如 "/pages/profile/profile?id=1"
        const url = args.url.split("?")[0]; // 去掉参数，只拿路径

        // === 核心逻辑 1：判断是否在白名单 ===
        // 如果在白名单中，直接放行 (return true)
        if (whiteList.includes(url)) {
          return true;
        }

        // === 核心逻辑 2：检查登录状态 ===
        const userStore = useUserStore();

        // 如果已登录，放行
        if (userStore.isAuthenticated) {
          return true;
        }

        // === 核心逻辑 3：未登录拦截 ===
        console.log("⛔ 路由守卫：未登录，拦截跳转 ->", url);

        // A. 终止原来的跳转
        // return false 会阻止 uni-app 执行原本的路由逻辑

        // B. 跳转到登录页，并携带“重定向地址”
        // 注意：如果是 switchTab 跳转（如点底部的“我的”），args.url 是不带参数的
        // 我们把目标页面 encode 一下传给登录页
        const redirect = encodeURIComponent(args.url);

        uni.navigateTo({
          url: `/pages/login/index?redirect=${redirect}`,
        });

        return false;
      },
      fail(err) {
        console.error("路由拦截报错:", err);
      },
    });
  });
}
