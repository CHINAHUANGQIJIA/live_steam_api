"use strict";

const await = require("await-stream-ready/lib/await");
const live = require("../../model/live");
const Controller = require("egg").Controller;

class NspController extends Controller {
  async test() {
    const { ctx, app } = this;
    console.log("11111111111111");
    let message = ctx.args[0];
    console.log(message);
    const socket = ctx.socket;
    const id = socket.id;
    socket.emit(id, "来自后端的消息");
  }
  //验证token
  async checkToken(token) {
    const { ctx, app, service, helper } = this;
    const socket = ctx.socket;
    const id = socket.id;

    if (!token) {
      //通知前端 没有访问该接口的权限
      socket.emit(id, ctx.helper.parseMsg("error", "您没有权限访问该接口"));
      return false;
    }

    let user = {};
    try {
      user = ctx.checkToken(token);
    } catch (error) {
      let fail =
        error.name === "TokenExprieError"
          ? "token已过期！请重新获取令牌"
          : "Token 令牌不合法！";
      socket.emit(id, ctx.header.parseMsg("error", fail));
      return false;
    }
    return user;
  }

  //进入直播间
  async joinLive() {
    console.log("请求了11111111111111111111111111111111111111111111111111");
    const { ctx, app, service, helper } = this;
    const nsp = app.io.of("/");

    //接收参数
    const message = ctx.args[0] || {};

    //当前连接
    const socket = ctx.socket;
    console.log("socket" + socket);
    const id = socket.id;

    let { live_id, token } = message;
    console.log("message" + message);
    let user = await this.checkToken(token);
    console.log("1111111123213");
    if (!user) {
      return;
    }
    let msg = await service.live.checkStatus(live_id);
    console.log("msg" + msg);
    if (msg) {
      socket.emit(id, ctx.helper.parseMsg("error", msg));
      return;
    }

    const room = "live_" + live_id;
    socket.join(room);
    const rooms = [room];
    let list = await service.cache.get("userList_" + room);
    list = list ? list : [];
    list = list.filter((item) => item.id !== user.id);
    list.unshift({
      id: user.id,
      name: user.username,
      avatar: user.avatar,
    });
    service.cache.set("userList_" + room, list);

    nsp.adapter.clients(room, (err, clients) => {
      nsp.to(room).emit("online", {
        clients,
        action: "join",
        user: {
          id: user.id,
          name: user.username,
          avatar: user.avatar,
        },
        data: list,
      });
    });

    let liveUser = await app.model.LiveUser.findOne({
      where: {
        user_id: user.id,
        live_id,
      },
    });
    if (!liveUser) {
      app.model.LiveUser.create({
        user_id: user.id,
        live_id,
      });
      let live = await service.live.exist(live_id);
      if (live) {
        live.increment({
          look_count: 1,
        });
      }
    }
  }

  //离开直播间
  async leaveLive() {
    const { ctx, app, service, helper } = this;
    const nsp = app.io.of("/");
    //接收参数
    const message = ctx.args[0] || {};

    //当前连接
    const socket = ctx.socket;
    const id = socket.id;

    let { live_id, token } = message;
    //验证用户token
    let user = await this.checkToken(token);
    if (!user) {
      return;
    }

    //验证当前直播间是否存在或是否处于直播中
    let msg = await service.live.checkStatus(live_id);
    console.log("msg" + msg);
    if (msg) {
      socket.emit(
        id,
        ctx.helper.parseMsg("error", msg, {
          notoast: true,
        })
      );
      return;
    }

    const room = "live_" + live_id;
    socket.join(room);
    const rooms = [room];
    let list = await service.cache.get("userList_" + room);
    if (list) {
      list = list.filter((item) => item.id !== user.id);
      service.cache.set("userList_" + room, list);
    }
    console.log(list);

    nsp.adapter.clients(room, (err, clients) => {
      nsp.to(room).emit("online", {
        clients,
        action: "join",
        user: {
          id: user.id,
          name: user.username,
          avatar: user.avatar,
        },
        data: list,
      });
    });
  }

  //直播间发送弹幕
  async comment() {
    const { ctx, app, service, helper } = this;
    const nsp = app.io.of("/");

    //接收参数
    const message = ctx.args[0] || {};

    //当前连接
    const socket = ctx.socket;
    const id = socket.id;

    let { live_id, token, data } = message;
    if (!data) {
      socket.emit(id, ctx.helper.parseMsg("error", "评论内容不能为空"));
      return;
    }
    //验证用户token
    let user = await this.checkToken(token);
    if (!user) {
      return;
    }

    //验证当前直播间是否存在或是否处于直播中
    let msg = await service.live.checkStatus(live_id);
    console.log("msg" + msg);
    if (msg) {
      socket.emit(id, ctx.helper.parseMsg("error", msg));
      return;
    }

    const room = "live_" + live_id;
    //推送消息到直播间
    nsp.to(room).emit("comment", {
      user: {
        id: user.id,
        name: user.nickname || user.username,
        avatar: user.avatar,
      },
      id: ctx.randomString(10),
      content: data,
    });
    //生成一条comment数据
    app.model.Comment.create({
      contnet: data,
      live_id,
      user_id: user.id,
    });
  }

  async gift() {
    const { ctx, app, service, helper } = this;
    const nsp = app.io.of("/");

    //接收参数
    const message = ctx.args[0] || {};

    //当前连接
    const socket = ctx.socket;
    const id = socket.id;

    let { live_id, token, gift_id } = message;

    //验证用户token
    let user = await this.checkToken(token);
    if (!user) {
      return;
    }

    //验证当前直播间是否存在或是否处于直播中
    let msg = await service.live.checkStatus(live_id);
    console.log("msg" + msg);
    if (msg) {
      socket.emit(id, ctx.helper.parseMsg("error", msg));
      return;
    }

    const room = "live_" + live_id;

    //验证礼物是否存在
    let gift = await app.model.Gift.findOne({
      where: {
        id: gift_id,
      },
    });

    if (!gift) {
      socket.emit(id, ctx.helper.parseMsg("error", "该礼物不存在"));
      return;
    }

    //当前用户金币是否不足
    if (user.coin < gift.coin) {
      socket.emit(id, ctx.helper.parseMsg("error", "金币不足，请先充值"));
      return;
    }

    //扣除金币
    let user1 = await app.model.User.findOne({
      where: {
        id: user.id,
      },
    });
    // await user.save()
    user1.coin -= gift.coin;
    user1.save();

    //写入礼物记录表
    app.model.LiveGift.create({
      live_id,
      user_id: user.id,
      gift_id,
    });

    //直播间总金币数+1
    let live = await app.model.Live.findOne({
      where: {
        id: live_id,
      },
    });
    live.coin += gift.coin;
    live.save();

    //推送到消息直播间
    nsp.to(room).emit("gift", {
      avatar: user.avatar,
      username: user.nickname || user.username,
      gift_name: gift.name,
      gift_image: gift.image,
      gift_coin: gift.coin,
      num: 1,
    });
  }
}

module.exports = NspController;
