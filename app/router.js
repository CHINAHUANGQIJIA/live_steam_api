"use strict";
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller, io } = app;
  router.get("/test", controller.admin.test.page);
  // sorket路由配置测试
  // io.of('/').route('test', io.controller.nsp.test);
  //新增管理员
  router.get("/admin/manager/create", controller.admin.manager.create);
  router.post("/admin/manager", controller.admin.manager.save);
  // 进入直播间
  io.of("/").route("gift", io.controller.nsp.gift);
  router.get("/api/gift/list", controller.api.gift.list);
  io.of("/").route("joinLive", io.controller.live.joinLive);
  // 离开直播间
  io.of("/").route("leaveLive", io.controller.live.leaveLive);
  // 发送弹幕
  io.of("/").route("comment", io.controller.live.comment);
  router.get("/", controller.home.index);
  // 用户注册
  router.post("/api/reg", controller.api.user.reg);
  // 账号密码登录
  router.post("/api/login", controller.api.user.login);
  // 微信登录
  router.post("/api/wxLogin", controller.api.user.wxLogin);
  // 发送验证码
  router.post("/api/sendcode", controller.api.sms.sendCode);
  // 手机验证码登录
  router.post("/api/phoneLogin", controller.api.user.phoneLogin);
  // 获取当前用户信息
  router.get("/api/user/info", controller.api.user.info);
  // 用户退出登录
  router.post("/api/logout", controller.api.user.logout);
  // 创建直播间
  router.post("/api/live/create", controller.api.live.save);
  // 修改直播间状态
  router.post("/api/live/changstatus", controller.api.live.changeStatus);
  // 直播间列表
  router.get("/api/live/list/:page", controller.api.live.list);
  // 查看指定直播
  router.get("/api/live/read/:id", controller.api.live.read);
};
