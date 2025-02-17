'use strict';

const crypto = require('crypto-js');

const Controller = require('egg').Controller;

class UserController extends Controller {

	main = this.service.user;

	/**
	 * @author sqm
	 * @description 获取某一用户信息
	 * @param {String} id 账号
	 * @backDes 
	 */	
	async read() {
		const { ctx } = this;
		const { params, helper, state } = ctx;
		let id = params.id
		if (!id) {
			id = state?.userInfo?.id || ''
		}
		const result = await this.main.read(id);
		if(!result){
			helper.fail('查询失败');
			return false;
		}
		helper.success('查询成功',result);
	};

	/**
	 * @author sqm
	 * @description 创建用户
	 * @param {String} username 用户名称
	 * @param {String} password 用户密码
	 * @param {String} email 用户邮箱
	 * @param {String} tel 用户电话
	 * @param {String} des 用户描述
	 * @backDes 
	 */	
	async create() {
		const { ctx } = this;
		const { params , helper } = ctx;
		const salt = helper.randomStr(8);
		const password = crypto.MD5(params.password + salt).toString();
 		const { id , username } = await this.main.create(params.username, password,{
			salt,
			email: params.email,
			tel: params.tel,
			des: params.des
		});
		helper.info('添加成功',{ id , username });
	};

	/**
	 * @author sqm
	 * @description 删除用户
	 * @param {String} id 账号
	 * @backDes 
	 */	
	async delete() {
		const { ctx } = this;
		const { params , helper } = ctx
		const result =  await this.main.del(params.id);
		if(!result){
			helper.fail('删除失败');
			return false;
		}
		helper.success('删除成功',result);
	};

	/**
	 * @author sqm
	 * @description 更新用户
	 * @param {String} id 账号
	 * @param {String} username 用户名称
	 * @param {String} password 用户密码
	 * @param {String} email 用户邮箱
	 * @param {String} tel 用户电话
	 * @param {String} des 用户描述
	 * @backDes 
	 */	
	async update() {
		const { ctx } = this;
		const { params , helper } = ctx;
		const result =  await this.main.update(params.id,{
			username: params.username,
			password: params.password,
			email: params.email,
			tel: params.tel,
			des: params.des
		});
		if(!result){
			helper.fail('更新失败');
			return false;
		}
		helper.success('更新成功',result);
	};

	/**
	 * @author sqm
	 * @description 获取用户列表,支持模糊查询
	 * @param {Number} page 用户列表页码
	 * @param {Number} pagesize 用户列表每页大小
	 * @param {String} key 查询的关键字
	 * @param {String} query 需要查询的内容
	 * @backDes 
	 */	
	async getList() {
		const { ctx } = this;
		const { params , helper } = ctx;
		const result = await this.main.getList(params.page,params.pagesize,params.key || 'id',params.query || '');
		helper.success('',result);
	};

	/**
	 * @author sqm
	 * @description 设置某一用户权限
	 * @param {String} id 账号
	 * @param {String} power 权限
	 * @backDes 
	 */	
	async setPower(){
		const { ctx } = this;
		const { params , helper } = ctx;
		const result = await this.main.setPower(params.id,params.power);
		if(!result){
			helper.fail('更新失败');
			return false;
		}
		helper.success('更新成功',result);
	};

	/**
     * @author sqm
     * @description 邮箱验证码
     * @param {String} email 邮箱地址
     * @backDes 
     */
	async emailVerify() {
		const { ctx, app } = this;
		const { helper,params } = ctx;
		const text = helper.randomStr();
		const res = await helper.sendMail({
			email: params.email,
			subject: '验证码',
			text: `您的验证码为: ${text}`,
			html: null
		})
		if(res) {
			await app.redis.set(params.email, text, 'Ex', '1800'); // 设置验证码30分钟过期
			helper.info('发送成功', { type: 'success' });
		} else {
			helper.info('发送失败');
		}
	}

	/**
	 * @author sqm
	 * @description 邮箱验证码设置用户信息
	 * @param {String} email 邮箱
	 * @param {String} password 用户密码
	 * @param {String} verification 验证码
	 * @backDes 
	 */
	async emailSetUser() {
		const { ctx, app } = this;
		const { helper, params } = ctx;
		const verification = await app.redis.get(params.email);
		if ((verification || '').toLowerCase() !== (params.verification || '').toLowerCase()) {
			helper.info('失败！验证码错误');
			return false
		}
		const main = this.service.user;
		let { count, rows } = await main.getList(1, 10, 'email', params.email);
		if (count === 0) {
			const salt = helper.randomStr(8);
			const password = crypto.MD5(params.password + salt).toString();
			const { id } = await main.create(params.email, password,{
				salt,
				email: params.email
			});
			helper.info(`创建成功，账号为${id}`, { type: 'success' });
			await app.redis.del(params.email)
		} else {
			const salt = helper.randomStr(8);
			const password = crypto.MD5(params.password + salt).toString();
			const flag = await main.update(rows[0].id, {
				password: password,
				salt,
				email: params.email
			});
			if (flag) {
				helper.info('修改密码成功', { type: 'success' });
				await app.redis.del(params.email)
			} else {
				helper.info('修改密码失败');
			}
		}
	}

}

module.exports = UserController;
