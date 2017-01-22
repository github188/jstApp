/**
 * 登录
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./module/public_module");
(function($) {

	var isFromSetting = requestURL.getParameter("isFromSetting"), //是否从设置页面退出过来
		mobileEle = $("#mobile"),
		pwdEle = $("#pwd"),
		loginBtnEle = $("#loginBtn"),
		mobileErrorTipEle = $("#mobileErrorTip"),
		pwdErrorTipEle = $("#pwdErrorTip"),
		mobileLen = 11,
		pwdLimit = 6,
		pwdMax = 20,
		InputValidators = require("./module/input_validators"),
		main = {
			//初始化执行
			init: function() {
				var self = this;

				self.bindEvent();
			},

			//验证输入项是否合规
			validate: {

				/**
				 * 验证手机号
				 */
				validateMobile: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', mobileErrorTipEle, APPwarn.mobile.none, mobileEle.val().replace(/\D/g, "")); // 验证是否为空
					validators.addValidator('isValidMobile', mobileErrorTipEle, APPwarn.mobile.err, mobileEle.val().replace(/\D/g, "")); // 验证是否为手机号码
					return this.check(validators, mobileErrorTipEle);
				},

				/**
				 * 验证密码
				 */
				validatePwd: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', pwdErrorTipEle, APPwarn.password.none, pwdEle.val()); // 验证是否为空
					//					validators.addValidator('isErrorLenPwd', pwdErrorTipEle, APPwarn.password.len, pwdEle.val()); // 验证密码是否足够长度
					return this.check(validators, pwdErrorTipEle);
				},

				/**
				 * 开始验证
				 * @param {Object} validators
				 */
				check: function(validators, tipEle) {
					var result = validators.check();

					if(result) {
						result.element.addClass("error").html(result.errMsg);
					} else {
						tipEle && tipEle.removeClass("error").html("");
					}

					return result;
				},

				checkAll: function() {
					return this.validateMobile() || this.validatePwd();
				}
			},

			//绑定事件监听
			bindEvent: function() {
				var self = this;

				//限制输入长度
				InputValidators.limitInputLength(mobileEle, mobileLen + 2, "number"); //因为要格式化显示手机号，所以多了两个空格，长度变为13
				InputValidators.limitInputLength(pwdEle, pwdMax);

				// 检查输入的手机号码是否合法
				mobileEle.bind("input", function() {
					var realvalue = this.value.replace(/\D/g, "");
					if(mobileLen == realvalue.length) {
						//用户输完11位之后，验证
						self.validate.validateMobile();
					} else {
						mobileErrorTipEle.removeClass("error").html("");
					}
					$(this).val(stringUtil.FormatNumber(realvalue, "mobile")); // 手机号码格式化
				});

				// 检查输入的密码是否合法
				pwdEle.bind("input", function() {
					pwdErrorTipEle.removeClass("error").html("");
					if(stringUtil.isEmpty($(this).val())) {

						$(this.parentNode).find(".mui-icon.mui-icon-eye").hide();
					} else {
						//输入不为空的时候，把可见图标显示出来
						$(this.parentNode).find(".mui-icon.mui-icon-eye").show();
					}
				});

				//忘记密码，注册跳转
				$(".page-href").bind("tap", function() {
					var href = $(this).data("href");
					if(!stringUtil.isEmpty(href)) {
						if(!stringUtil.isURL(href)) {
							href = constant.rootPath + href;
						}
						openWindow(href);
					}
				});

				// 提交登陆信息
				loginBtnEle.bind("tap", function() {

					if($(this).hasClass("disabled")) {
						return;
					}

					if(self.validate.checkAll()) {
						return false;
					}

					var mobile = mobileEle.val().replace(/\D/g, ""),
						pwd = require("./module/crypto").encryptPwd(pwdEle.val());
					postData("app/rest/member/login", {
						mobile: mobile,
						password: pwd
					}, function(data) {
						var token = data.token || "";
						if(data.resType == "00") {
							if(stringUtil.isEmpty(token)) {
								$.toast("登录出错啦,获取TOKEN为空");
								return;
							}

							login.setUserId(data.userId); // 记录用户账号(手机号码)，作为登录凭证
							local.setItem("token", token);
							login.setLoginParameter(mobile, pwd);
							self.closeLoginPage();

						} else {

							$.toast(data.msgContent);

						}

					});

				});
				$.back = self.closeLoginPage;
			},

			/**
			 * 关闭登录页
			 */
			closeLoginPage: function() {
				if($.os.plus) {
					var fromPageId = plus.webview.currentWebview().fromPageId;
					console.log("login.fromPageId-->" + JSON.stringify(fromPageId));

					if(!stringUtil.isEmpty(fromPageId)) {
						//登录成功了
						if(login.isLogin()) {
							var param = plus.webview.currentWebview().param;
							$.fire(plus.webview.getWebviewById(fromPageId), "loginSuccess", param);
						} else {
							isFromSetting = "Y"; //跳转至首页
						}

					} else {
						if(login.isLogin()) { //没有指定从哪个页面跳过来的，更新个人中心数据
							$.fire(require("./module/webview_opr").getLaunchWebview(), "loginSuccess", {
								toIndex: 1
							});
						}

					}
					if(isFromSetting == "Y" && !login.isLogin()) {
						$.fire(require("./module/webview_opr").getLaunchWebview(), "changeTab", {
							toIndex: 0
						});
					}

					plus.webview.currentWebview().close();
				} else {
					//登录成功了，非APP环境，跳至首页
					var href = constant.rootPath + "/page/account/account.html";
					openWindow(href);

				}
			}
		};
	main.init();

})(mui);
//end