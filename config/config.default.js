/* eslint valid-jsdoc: "off" */

'use strict';

const Op = require('sequelize').Op;		// 定义sequelize的运算符

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
	/**
	 * built-in config
	 * @type {Egg.EggAppConfig}
	 **/
	const config = exports = {};

	// use for cookie sign key, should change to your own and keep security
	config.keys = appInfo.name + '_';

	// 在这里添加中间件,执行顺序为数组顺序
	config.middleware = [ 'token' , 'params'   , 'responseBody'];

	// 安全策略设置
	config.security = {
		csrf: {
			enable: false, 		// 开关功能配置
			ignoreJSON: true 	// 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
		},
		//白名单，指定前端地址
		// domainWhiteList: ["http://localhost:8080"],
		// domainWhiteList: '*',
	};
	
	// 跨域配置
	config.cors = {
		origin:'*',
		allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
	};

	// 数据库配置
	config.sequelize = {
		dialect: 'mysql', // support: mysql, mariadb, postgres, mssql
		database: 'main',
		host: '127.0.0.1',
		port: '3306',
		username: 'root',
		password: '355369',
		timezone:'+08:00',
		define:{
			freezeTableName: true,		// Model 对应的表名将与model名相同
			// timestamps: false,			//去掉默认的添加时间和更新时间
			// createdAt:'created_at',
			// updatedAt:'updated_at',
		},
		// 使用默认运算符别名
		operatorsAliases: {
			$eq: Op.eq,
			$ne: Op.ne,
			$gte: Op.gte,
			$gt: Op.gt,
			$lte: Op.lte,
			$lt: Op.lt,
			$not: Op.not,
			$in: Op.in,
			$notIn: Op.notIn,
			$is: Op.is,
			$like: Op.like,
			$notLike: Op.notLike,
			$iLike: Op.iLike,
			$notILike: Op.notILike,
			$regexp: Op.regexp,
			$notRegexp: Op.notRegexp,
			$iRegexp: Op.iRegexp,
			$notIRegexp: Op.notIRegexp,
			$between: Op.between,
			$notBetween: Op.notBetween,
			$overlap: Op.overlap,
			$contains: Op.contains,
			$contained: Op.contained,
			$adjacent: Op.adjacent,
			$strictLeft: Op.strictLeft,
			$strictRight: Op.strictRight,
			$noExtendRight: Op.noExtendRight,
			$noExtendLeft: Op.noExtendLeft,
			$and: Op.and,
			$or: Op.or,
			$any: Op.any,
			$all: Op.all,
			$values: Op.values,
			$col: Op.col
		}
	};

	// jwt配置 
	config.jwt = {
		secret: 'sqm'
	};

	// 路由白名单
	config.tokenWL = ['/', '/login']

	// add your user config here
	const userConfig = {
		// myAppName: 'egg',
	};

	return {
		...config,
		...userConfig,
	};

};

