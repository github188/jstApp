/**
 * 支付密码操作：设置，修改等
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 * 用法：require("./pay_password").setPayPwd({
					userId:"",//用户ID
					inputCompleteClose: true, //输完密码之后是否需要关闭输入界面
					successCallback:function(){},//成功回调
					failCallback:function(type:-1密码错误，其它为系统出错){}//失败回调
				})
 */

module.exports = (function($) {
	require("./http_client");
	var returnResult = {},
		login = require("./login_module"),
		popupPayPassword = require("./popup_pay_password"),
		payPwdObj = {
			init: function(options) {
				this.options = $.extend({
					inputCompleteClose: true //输完密码之后是否需要关闭输入界面
				}, options);
			},

			//验证支付密码
			_validatePwd: function() {
				var self = this;

				popupPayPassword.show($.extend({
					withInit: true,
					doneCallback: self._requestValidatePwd.bind(self) //输完密码后的回调
				}, self.options));
			},

			//设置支付密码
			_setPwd: function() {
				var self = this;
				popupPayPassword.show($.extend({
					withInit: true,
					secondPwd: true,
					showForgetPwd: false,
					inputTitle: "设置支付密码",
					doneCallback: self._requestSetPwd.bind(self) //输完密码后的回调
				}, self.options));
			},

			/**
			 * 修改支付密码
			 * @param {Object} oldPwd:旧密码
			 */
			_updatePwd: function(oldPwd) {
				var self = this;
				self.oldPwd = oldPwd || "";
				popupPayPassword.show($.extend({
					withInit: true,
					secondPwd: true,
					showForgetPwd: false,
					inputTitle: "设置新密码",
					secondInputTitle: "再次输入新密码",
					doneCallback: self._requestUpdatePwd.bind(self) //输完密码后的回调
				}, self.options));
			},

			/**
			 * 重置支付密码
			 */
			_resetPwd: function() {
				var self = this;
				popupPayPassword.show($.extend({
					withInit: true,
					secondPwd: true,
					showForgetPwd: false,
					inputTitle: "新支付密码",
					doneCallback: self._requestResetPwd.bind(self) //输完密码后的回调
				}, self.options));
			},

			//请求设置密码
			_requestSetPwd: function(pwd) {
				var self = this;
				postData("app/rest/member/setPwd", {
					"usrLgName": self.options.userId,
					"nUsrpwd": require("./crypto").encryptPwd(pwd),
					"pwdType": 3
				}, function(data) {
					data.pwd = pwd;
					self._requestSuccess(data);
				});
			},

			//请求修改密码
			_requestUpdatePwd: function(pwd) {
				var self = this;
				postData("app/rest/member/changePwd", {
					"usrLgName": self.options.userId,
					"usrPwd": require("./crypto").encryptPwd(self.oldPwd),
					"nUsrpwd": require("./crypto").encryptPwd(pwd),
					"pwdType": 2
				}, function(data) {
					self._requestSuccess(data);
				})
			},

			//请求重置支付密码
			_requestResetPwd: function(pwd) {
				var self = this;
				postData("app/rest/member/resetPwd", {
					"usrLgName": self.options.userId,
					"nUsrpwd": require("./crypto").encryptPwd(pwd),
					"pwdType": 2
				}, function(data) {
					self._requestSuccess(data);
				})
			},

			/**
			 * 请求成功之后回调
			 * @param {Object} data
			 */
			_requestSuccess: function(data) {
				var self = this;
				if(data.resType == "00") {

					if(self.options.successCallback) {
						//设置成功 ，回调
						self.options.successCallback(data.pwd);

						if(self.options.inputCompleteClose) {
							self._closeWrapper();
						}

						//更新用户缓存信息
						login.updateUserInfo();
					} else {
						//没回调，默认跳转至账户主页
						//登录成功了，跳至账户主页

						if($.os.plus) {
							//显示首页
							$.plusReady(function() {
								$.fire(require("./webview_opr").getLaunchWebview(), "changeTab", {
									toIndex: 1
								});

								require("./webview_opr").getLaunchWebview().show("slide-in-right", constant.duration);
							});

						} else {
							var href = constant.rootPath + "/page/account/account.html";
							openWindow(href);
						}
					}

				} else {
					$.toast(data.msgContent);
					self.options.failCallback && self.options.failCallback();
				}

			},

			//请求验证支付密码
			_requestValidatePwd: function(pwd) {
				var self = this;
				postData("app/rest/member/checkPwd", {
					"userId": self.options.userId,
					"password": require("./crypto").encryptPwd(pwd)
				}, function(data) {
					if(data.resType == "00") {
						if(self.options.inputCompleteClose) {
							self._closeWrapper();
						}
						self.options.successCallback && self.options.successCallback(pwd);
					} else {
						$.toast(data.msgContent);
						popupPayPassword.clear();
						if(data.resCode == "MB300002") {
							//密码错误，失败回调
							self.options.failCallback && self.options.failCallback(-1);
						}
					}
				})
			},

			//隐藏密码支付面板
			_closeWrapper: function() {
				popupPayPassword.hide();
			}

		};

	//API

	/**
	 * 设置支付密码
	 * @param {Object} option:successCallback设置成功的回调,failCallback设置失败回调
	 */
	returnResult.setPayPwd = function(options) {
		payPwdObj.init(options);
		payPwdObj._setPwd();
	};

	//验证支付密码
	returnResult.validatePwd = function(options) {
		payPwdObj.init(options);
		payPwdObj._validatePwd();
	};

	/**
	 * 修改支付密码
	 * @param {Object} oldPwd:旧密码
	 */
	returnResult.updatePwd = function(options) {

		payPwdObj.init(options);
		payPwdObj._updatePwd(options.oldPwd || "");
	};

	/**
	 * 重置支付密码
	 */
	returnResult.resetPwd = function(options) {
		payPwdObj.init(options);
		payPwdObj._resetPwd();
	};

	/**
	 * 隐藏密码输入面板
	 */
	returnResult.hide = function() {
		payPwdObj._closeWrapper();
	}

	return returnResult;
})(mui);