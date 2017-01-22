/**
 * 修改密码
 */
require("./module/public_module");
(function($) {

	var oldPwdEle = $("#oldPwd"),
		newPwdEle = $("#newPwd"),
		confirmBtnEle = $("#confirmBtn"),

		oldPwdErrorTipEle = $("#oldPwdErrorTip"), //原密码错误提示
		newPwdErrorTipEle = $("#newPwdErrorTip"), //新密码错误提示

		pwdLimit = 8,
		pwdMax = 18,
		userid = login.getUserId(true),
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
				 * 验证原密码
				 */
				validateOldPwd: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', oldPwdErrorTipEle, APPwarn.password.none, oldPwdEle.val()); // 验证是否为空
					validators.addValidator('isErrorLenPwd', oldPwdErrorTipEle, APPwarn.password.len, oldPwdEle.val());
					return this.check(validators, oldPwdErrorTipEle);
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
					return this.validateOldPwd() || this.validateNewPwd();
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

				InputValidators.limitInputLength(oldPwdEle, pwdMax);
				InputValidators.limitInputLength(newPwdEle, pwdMax);
				self.enabledConfirmBtn();

				// 检查输入的密码是否合法
				oldPwdEle.bind("input", function() {
					if(pwdLimit < this.value.length) {
						//用户输完之后，验证
						self.validate.validateOldPwd();
					} else {
						oldPwdErrorTipEle.removeClass("error").html("");
					}
				});

				// 检查输入的新密码是否合法
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

				// 提交
				confirmBtnEle.bind("tap", function() {

					if($(this).hasClass("disabled")) {
						return;
					}

					if(self.validate.checkAll()) {
						return false;
					}

					var cpw = {
						usrLgName: userid,
						usrPwd: require("./module/crypto").encryptPwd(oldPwdEle.val()),
						pwdType: 1,
						nUsrpwd: require("./module/crypto").encryptPwd(newPwdEle.val())
					};

					postData("app/rest/member/changePwd", cpw, function(data) {
						if(data.resType == "00") {
							$.toast("修改成功,请重新登录");
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
							oldPwdEle.val("");
							newPwdEle.val("");

						}
					});

				});
			}
		};
	main.init();

})(mui);
//end