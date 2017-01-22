/**
 * 注册
 */
require("./module/public_module");
(function($) {

	var mobileEle = $("#mobile"),
		pwdEle = $("#pwd"),
		registerBtnEle = $("#registerBtn"), //输完手机号和验证码之后的确认铵钮
		smsCodeEle = $("#smsCode"), //验证码输入框
		getCodeBtnEle = $("#getCodeBtn"), //获取短信验证码铵钮
		confirmBtnEle = $("#confirmBtn"), //输完密码之后的确认按钮

		mobileErrorTipEle = $("#mobileErrorTip"), //手机号错误提示
		smsCodeErrorTipEle = $("#smsCodeErrorTip"), //验证码错误提示
		pwdErrorTipEle = $("#pwdErrorTip"), //密码错误提示

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
				 * 验证短信验证码
				 */
				validateSmsCode: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', smsCodeErrorTipEle, APPwarn.checkcode.none, smsCodeEle.val());
					validators.addValidator('isValidSmsCode', smsCodeErrorTipEle, APPwarn.checkcode.err, smsCodeEle.val());
					return this.check(validators, smsCodeErrorTipEle);
				},

				/**
				 * 验证密码
				 */
				validatePwd: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', pwdErrorTipEle, APPwarn.password.none, pwdEle.val()); // 验证是否为空
					validators.addValidator('isErrorLenPwd', pwdErrorTipEle, APPwarn.password.len, pwdEle.val());
					validators.addValidator('isValidPwd', pwdErrorTipEle, APPwarn.password.req, pwdEle.val());
					validators.addValidator('isEasyPwd', pwdErrorTipEle, APPwarn.password.easy, pwdEle.val());
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
					return this.validateMobile() || this.validateSmsCode() || this.validatePwd();
				}
			},

			//绑定事件监听
			bindEvent: function() {
				var self = this;

				InputValidators.limitInputLength(mobileEle, mobileLen + 2, "number");
				InputValidators.limitInputLength(pwdEle, pwdMax);
				InputValidators.limitInputLength(smsCodeEle, smsCodeMax);

				$(".page-href").bind("tap", function() {
					var href = $(this).data("href");
					if(!stringUtil.isEmpty(href)) {
						if(!stringUtil.isURL(href)) {
							href = constant.rootPath + href;
						}
						openWindow(href);
					}
				});

				// 检查输入的手机号码是否合法
				mobileEle.bind("input", function() {
					var realvalue = this.value.replace(/\D/g, "");
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
					$(this).val(stringUtil.FormatNumber(realvalue, "mobile")); // 手机号码格式化
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
				pwdEle.bind("input", function() {
					if(pwdLimit < this.value.length) {
						//用户输完之后，验证
						self.validate.validatePwd();
					} else {
						pwdErrorTipEle.removeClass("error").html("");
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

					var $this = $(this);

					if($this.hasClass("disabled")) {
						return;
					}

					if(self.validate.validateMobile()) {
						return false;
					}

					//调用接口发送短信
					postData("app/rest/message/msgSend", {
						mobile: mobileEle.val().replace(/\D/g, ""),
						mark: "1"
					}, function(data) {
						if(data.resType == "00") {
							var rkey = data.rkey; //短信跟踪码
							smsCodeEle.attr("rkey", rkey);
							require("./module/common_util").timeDown($this);
						} else {
							$.toast(data.msgContent);
						}
					}, null, {
						requestType: "get"
					});

				});

				/**
				 * 输完手机号和验证码之后，提交
				 */
				registerBtnEle.bind("tap", function() {

					if($(this).hasClass("disabled")) {
						return;
					}

					if(self.validate.checkAll()) {
						return false;
					}

					var regInfo = {
						code: mobileEle.val().replace(/\D/g, ""),
						password: require("./module/crypto").encryptPwd(pwdEle.val()),
						cerType: 1,
						verifyNum: smsCodeEle.val(),
						rkey: smsCodeEle.attr("rkey")
					};

					postData("app/rest/member/register", regInfo, function(data) {
						$.toast(data.msgContent);
						if(data.resType == "00") {

							if($.os.plus) {
								//APP环境，关闭本WEBVIEW，返回至登录页
								$.plusReady(function() {
									plus.webview.currentWebview().close("slide-out-left", constant.duration);
								});
							} else {
								var href = constant.rootPath + "/page/home/login.html";
								openWindow(href);
							}

						}
					});

				});
			}
		};
	main.init();

})(mui);
//end