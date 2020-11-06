"use strict";

const Controller = require("egg").Controller;

class ManagerController extends Controller {
  // 创建管理员表单
  async create() {
    const { ctx } = this;
    await ctx.render("admin/manager/create.html");
  }
  // 创建管理员逻辑
  async save() {
    const { ctx, app } = this;

    ctx.validate({
      username: {
        type: "string",
        required: true,
        desc: "管理员账户",
      },
      password: {
        type: "string",
        required: true,
        desc: "密码",
      },
    });

    let { username, password } = ctx.request.body;

    if (
      await app.model.Manager.findOne({
        where: {
          username,
        },
      })
    ) {
      return ctx.apiFail("该管理员已存在");
    }

    let manager = await app.model.Manager.create({
      username,
      password,
    });

    ctx.apiSuccess(manager);
  }
}

module.exports = ManagerController;
