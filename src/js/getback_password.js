/**
 * 找回密码
 */
require("./module/public_module");
(function($) {

	var mobile = "", //手机号

		mobileEle = $("#mobile"),
		newPwdEle = $("#newPwd"),
		confirmBtnEle = $("#confirmBtn"),
		smsCodeEle = $("#smsCode"), //验证码输入框
		getCodeBtnEle = $("#getCodeBtn"), //获取短信验证码铵钮

		mobileErrorTipEle = $("#mobileErrorTip"), //手机号错误提示
		smsCodeErrorTipEle = $("#smsCodeErrorTip"), //验证码错误提示
		newPwdErrorTipEle = $("#newPwdErrorTip"), //新密码错误提示
		mobileLen = 11,
		pwdLimit = 8,
		pwdMax = 18,
		smsCodeMax = 6, //验证码最大长度
		InputValidators = require("./module/input_validators"),
		main = {
			//初始化执行
			init: function() {
				var self = this;

				self.bindEvent();
				self.initView();
			},

			initView: function() {

				if(login.isLogin()) {
					mobile = login.getLoginInfo().mobile;
					$("#mobileText").html("请输入".concat(stringUtil.infoProtectDeal({
						targetStr: mobile,
						keepStart: 3,
						keepEnd: 4
					})).concat("收到的验证码"));

					getCodeBtnEle.removeClass("disabled");
					mobileEle.attr("minlength", 0);
					$.trigger(getCodeBtnEle[0], "tap");
				} else {
					$("#mobileText").hide();
					$(".input-mobile").removeClass("mui-hidden");
				}

			},

			//验证输入项是否合规
			validate: {

				/**
				 * 验证手机号
				 */
				validateMobile: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', mobileErrorTipEle, APPwarn.mobile.none, mobileEle.val()); // 验证是否为空
					validators.addValidator('isValidMobile', mobileErrorTipEle, APPwarn.mobile.err, mobileEle.val()); // 验证是否为手机号码
					return this.check(validators, mobileErrorTipEle);
				},

				/**
				 * 验证短信验证码
				 */
				validateSmsCode: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', smsCodeErrorTipEle, APPwarn.checkcode.none, smsCodeEle.val());
					validators.addValidator('isValidSmsCode', smsCodeErrorTipEle, APPwarn.checkcode.err, smsCodeEle.val());
					return this.check(validators, smsCodeErrorTipEle);
				},

				/**
				 * 验证新密码
				 */
				validateNewPwd: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', newPwdErrorTipEle, APPwarn.password.none, newPwdEle.val()); // 验证是否为空
					validators.addValidator('isErrorLenPwd', newPwdErrorTipEle, APPwarn.password.len, newPwdEle.val());
					validators.addValidator('isValidPwd', newPwdErrorTipEle, APPwarn.password.req, newPwdEle.val());
					validators.addValidator('isEasyPwd', newPwdErrorTipEle, APPwarn.password.easy, newPwdEle.val());
					return this.check(validators, newPwdErrorTipEle);
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
					return this.validateSmsCode() || this.validateNewPwd();
				}
			},

			/**
			 * 是否启用确认铵钮可点击
			 */
			enabledConfirmBtn: function() {

				/**
				 * 监听所有输入框，判断输入长度是否足够启用确认铵钮
				 */
				$("body").on("input", "input", function() {

					var flag = true; //先设置成禁用
					$("input").each(function() {

						var inputVal = $(this).val(),
							minlength = $(this).attr("minlength") || 0;

						if(inputVal.length < minlength) {

							//如果输入的长度满足最小长度，则将铵钮置为可点击
							flag = false;
							return;
						}
					});

					if(flag) {
						confirmBtnEle.removeClass("disabled");
					} else {
						confirmBtnEle.addClass("disabled");
					}

				});
			},

			//绑定事件监听
			bindEvent: function() {
				var self = this;

				InputValidators.limitInputLength(mobileEle, mobileLen, "number");
				InputValidators.limitInputLength(newPwdEle, pwdMax);
				InputValidators.limitInputLength(smsCodeEle, smsCodeMax);
				self.enabledConfirmBtn();

				// 检查输入的手机号码是否合法
				mobileEle.bind("input", function() {
					var realvalue = mobile = this.value;
					if(mobileLen == realvalue.length) {
						//用户输完11位之后，验证
						if(!self.validate.validateMobile()) {
							//验证通过了，将获取验证码铵钮打开
							getCodeBtnEle.removeClass("disabled");
						} else {
							getCodeBtnEle.addClass("disabled");
						}
					} else {
						mobileErrorTipEle.removeClass("error").html("");
					}
				});

				// 检查输入的验证码是否合法
				smsCodeEle.bind("input", function() {

					if(smsCodeMax == this.value.length) {
						//用户输完之后，验证
						self.validate.validateSmsCode();
					} else {
						smsCodeErrorTipEle.removeClass("error").html("");
					}

				});

				// 检查输入的密码是否合法
				newPwdEle.bind("input", function() {
					if(pwdLimit < this.value.length) {
						//用户输完之后，验证
						self.validate.validateNewPwd();
					} else {
						newPwdErrorTipEle.removeClass("error").html("");
					}

					if(stringUtil.isEmpty($(this).val())) {

						$(this.parentNode).find(".mui-icon.mui-icon-eye").hide();
					} else {
						//输入不为空的时候，把可见图标显示出来
						$(this.parentNode).find(".mui-icon.mui-icon-eye").show();
					}
				});

				/**
				 * 获取验证码
				 */
				getCodeBtnEle.addEventListener("tap", function() {

					if($(this).hasClass("disabled")) {
						return;
					}
					//调用接口发送短信
					postData("app/rest/message/msgSend", {
						mobile: mobile,
						mark: "1"
					}, function(data) {
						if(data.resType == "00") {
							var rkey = data.rkey; //短信跟踪码
							smsCodeEle.attr("rkey", rkey);
						} else {
							$.toast(data.msgContent);
						}
						require("./module/common_util").timeDown(getCodeBtnEle);
					}, null, {
						requestType: "get"
					});

				});

				// 提交重置密码请求
				confirmBtnEle.bind("tap", function() {

					if($(this).hasClass("disabled")) {
						return;
					}

					if(self.validate.checkAll()) {
						return false;
					}

					var cpw = {
						usrLgName: mobile,
						nUsrpwd: require("./module/crypto").encryptPwd(newPwdEle.val()),
						pwdType: 1,
						verifyNum: smsCodeEle.val(),
						rkey: smsCodeEle.attr("rkey")
					};

					postData("app/rest/member/resetPwd", cpw, function(data) {
						if(data.resType == "00") {
							$.toast("找回密码成功，请重新登录");
							login.logout(false);

							var href = constant.rootPath + "/page/home/login.html";
							openWindow(href);

							if($.os.plus) {
								//APP环境，关闭本WEBVIEW，返回至登录页

								setTimeout(function() {
									require("./module/webview_opr").closeLanuchOther(plus.webview.getWebviewById(href));
								}, 500);
							}
						} else {
							$.toast(data.msgContent);
						}
					});

				});
			}
		};
	main.init();

})(mui);
//end