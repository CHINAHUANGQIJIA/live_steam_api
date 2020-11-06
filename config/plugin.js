"use strict";

/** @type Egg.EggPlugin */
module.exports = {
  // 跨域的配置
  cors: {
    enable: true,
    package: "egg-cors",
  },
  // 数据库的配置插件
  sequelize: {
    enable: true,
    package: "egg-sequelize",
  },
  // 参数校验
  valparams: {
    enable: true,
    package: "egg-valparams",
  },
  // redis缓存插件
  redis: {
    enable: true,
    package: "egg-redis",
  },
  // jwt加密鉴权
  jwt: {
    enable: true,
    package: "egg-jwt",
  },
  // socket.io安装和通讯
  io: {
    enable: true,
    package: "egg-socket.io",
  },
  nunjucks: {
    enable: true,
    package: "egg-view-nunjucks",
  },
};
