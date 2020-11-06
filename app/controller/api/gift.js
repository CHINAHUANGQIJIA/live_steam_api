"use strict";

const Controller = require("egg").Controller;
const await = require("await-stream-ready/lib/await");

class GiftController extends Controller {
  async list() {
    let { ctx, app } = this;

    let rows = await app.model.Gift.findAll({});
    ctx.apiSuccess(rows);
  }
}
module.exports = GiftController;
