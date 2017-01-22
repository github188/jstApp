/**
 * 模拟数字密码键盘
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 * 用法：require("./keyboard_pwd").show({
 					withInit:true,//是否直接初始化
 					headerTitle: "支付密码", //标题
					pwdLen: 6, //密码长度
					inputTitle: "请输入支付密码", //标题
					secondPwd: false, //是否需要两步密码确认
					secondInputTitle: "请再次确认支付密码",
					inputCompleteClose: false, //输完密码之后是否需要关闭输入界面
					closeDestruction: false, //关闭键盘时是否销毁对象
					showForgetPwd: true, //是否显示忘记密码了
					doneCallback:function(){},//输完密码之后的回调
					beforeKeyItemShow:function(){},//数字键盘弹出之前的回调
					beforeback:function(){},//返回之前的回调
					forgetPwdFromPage: "" //忘记密码跳转到重新绑卡找回密码，接着再跳转到原场景
				})
 */
require("./mui_expansion");

module.exports = (function($) {
	$.dom = function(str) {
		if(typeof(str) !== 'string') {
			if((str instanceof Array) || (str[0] && str.length)) {
				return [].slice.call(str);
			} else {
				return [str];
			}
		}
		if(!$.__create_dom_div__) {
			$.__create_dom_div__ = document.createElement('div');
		}
		$.__create_dom_div__.innerHTML = str;
		return [].slice.call($.__create_dom_div__.childNodes);
	};
	var returnResult = {},

		KEYBOARD_PANEL = ".popup-pay-view", //整个密码输入面板
		HEADER = ".p-p-header", //头部
		HEADER_TITLE = ".p-p-header-title", //头标题
		INPUT_BOX = ".p-p-input-box", //上半部分六个格子及输入提示
		FIRST_INPUT_BOX = ".first-input-box", //第一次输入面板
		SECOND_INPUT_BOX = ".second-input-box", //第二次输入面板
		ICON_BACK = ".p-p-back", //返回
		KEYBORAD_BOTTOM = ".p-p-keyboard-bottom", //键盘
		FIRST_INPUT_TIP = ".first-input-tip", //第一次输入提示
		ERROR_TIP = ".p-p-error-tip", //输入错误提示
		SECOND_INPUT_TIP = ".second-input-tip", //第二次输入提示
		FORGET_PWD = ".p-p-forget-pwd", //忘记密码了
		KEY_ITEM = ".p-p-key-item", //键盘
		PWD_BOX = " .p-p-pwd-box", //六位密码格子面板
		PWD_ITEM = " .p-p-pwd-item", //密码小格子

		stringUtil = require("./string_util"),
		winExp = require("./window_expansion"),
		keyboardPanel = {
			init: function(options) {
				this.options = $.extend({
					mask: false, //是否需要遮罩
					ready: function() {}, //初始化完毕回调
					pwdLen: 6, //密码长度
					headerTitle: "支付密码", //标题
					inputTitle: "请输入支付密码", //标题
					secondPwd: false, //是否需要两步密码确认
					secondInputTitle: "请再次确认支付密码",
					inputCompleteClose: false, //输完密码之后是否需要关闭输入界面
					closeDestruction: false, //关闭键盘时是否销毁对象
					showForgetPwd: true, //是否显示忘记密码了
					forgetPwdFromPage: "" //忘记密码跳转到重新绑卡找回密码，接着再跳转到原场景
				}, options);
				this.wrapper = this.options.wrapper;
				this.inputPwd = ["", ""];
				this._init();
			},

			//初始化
			_init: function() {
				this._initElements();
				this.activeInputIndex = 0; //当前正在输入第一个界面密码
			},

			//创建DOM
			_initElements: function() {

				var self = this,
					_create = function(res) {
						$(KEYBOARD_PANEL).remove();
						var panel = $.dom(res);

						if(self.options.mask) {
							//设置了需要遮罩，那就弄成半屏显示 
							$(panel[0]).addClass("fixheight");
						} else {
							$(panel[0]).addClass("fullscreen");
						}

						if(self.wrapper && self.wrapper[0]) {
							self.wrapper[0].appendChild(panel[0]);
						} else {
							//没指定添加到哪个元素，直接添加至BODY，且指定为弹窗方式，左上角显示关闭铵钮
							document.body.appendChild(panel[0]);
							self.wrapper = $(panel[0]);
						}

						$(FIRST_INPUT_TIP).html(self.options.inputTitle);
						$(SECOND_INPUT_TIP).html(self.options.secondInputTitle);

						if(!stringUtil.isEmpty(self.options.headerTitle)) {
							$(HEADER_TITLE).html(self.options.headerTitle);
						} else {
							$(HEADER).remove();
						}

						if(self.options.showForgetPwd) {
							//显示忘记密码了
							$(FORGET_PWD).show();
						}

						if(!self.options.secondPwd) {
							//是否需要两步确认
							$(SECOND_INPUT_BOX).remove();
						}

						self.firstInput = $(INPUT_BOX.concat(FIRST_INPUT_BOX));
						self.secondInput = $(INPUT_BOX.concat(SECOND_INPUT_BOX));
						self._initEvent();

						self.options.ready && self.options.ready();
					};

				postData("page/module/popup_pay_password.html", {}, _create, null, {
					requestType: "get",
					dataType: "html",
					localResource: true
				});

			},

			//绑定事件
			_initEvent: function() {

				var self = this;

				/**
				 * 忘记密码了
				 */
				self.wrapper.on("tap", FORGET_PWD, function() {

					self._closeWrapper();

					if("pay" == self.options.forgetPwdFromPage) {
						//如果是在支付页面点击的忘记密码，则要将支付链接临时保存至LOCAL
						local.setItem("payUrlTmp", location.href);
					}

					var href = constant.rootPath + "/page/account/forget_pay_pwd.html";
					openWindow(href, href, {
						fromPage: self.options.forgetPwdFromPage
					});
				});

				/**
				 * 数字键盘点击事件
				 */
				self.wrapper.on("tap", KEY_ITEM, function() {
					var $this = $(this),
						val = $this.attr("val");

					if(!stringUtil.isEmpty(val)) {
						var pwdBoxLastIndex = 0,
							inputClass = "";
						if(0 == self.activeInputIndex) {
							//当前正在输入第一个界面
							inputClass = FIRST_INPUT_BOX + PWD_BOX + PWD_ITEM;
						} else {
							inputClass = SECOND_INPUT_BOX + PWD_BOX + PWD_ITEM;
						}
						pwdBoxLastIndex = $(inputClass + ".active").length

						var inputVal = self.inputPwd[self.activeInputIndex];
						if("-1" == val) {
							//删除输入
							if(inputVal && inputVal.length > 0) {
								inputVal = self.inputPwd[self.activeInputIndex] = inputVal.substr(0, inputVal.length - 1);
								$(inputClass + ":nth-child(" + (pwdBoxLastIndex) + ")").removeClass("active");
							}

						} else if("-2" == val) {
							self._hideKeyItem();
						} else {

							if(inputVal.length >= self.options.pwdLen) {
								return;
							}
							$(ERROR_TIP).html("");

							//输入密码，把密码值记录起来
							inputVal = self.inputPwd[self.activeInputIndex] += "" + val;
							var nextActive = $(inputClass + ":nth-child(" + (pwdBoxLastIndex + 1) + ")");
							nextActive.addClass("active");
						}

						$this.addClass("active");
						setTimeout(function() {
							$this.removeClass("active");
						}, 100);

						if(inputVal.length == self.options.pwdLen) {
							//输入完成,判断输入的是第几个界面的密码

							if(0 == self.activeInputIndex) {
								//第一个界面的密码输完了，是否需要再次确认输入密码
								if(self.options.secondPwd) {
									//跳至第二个确认密码输入界面
									self.firstInput.addClass("back");
									self.secondInput.addClass("active");
									self.activeInputIndex = 1;
								} else {
									//不需要再次确认密码，就回调完成
									self._inputComplete();
								}
							} else {
								//确认密码都输完了，判断两次密码是否一样

								if(self.inputPwd[0] == self.inputPwd[1]) {
									//两次密码一样，回调吧
									self._inputComplete();
								} else {
									$(ERROR_TIP).html("两次密码输入不一致");
									self._reset();
								}

							}

						}
					}
				});

				/**
				 * 密码输入框点击事件，弹起键盘
				 */
				self.wrapper.on("tap", PWD_BOX, function() {
					//让所有input失去焦点，这样键盘才会隐藏下去，暂时没找到更好的解决办法
					$("input").each(function() {
						this.blur();
					});

					if(typeof self.options.beforeKeyItemShow === 'function') {
						if(self.options.beforeKeyItemShow() === false) {
							return;
						}
					}

					self._showKeyItem();
				});

				//左上角关闭事件
				self.wrapper.on("tap", ICON_BACK, function() {

					if(typeof self.options.beforeback === 'function') {
						if(self.options.beforeback() === false) {
							return;
						}
					}

					self._closeWrapper();
				});

			},

			/**
			 * 输入完毕了
			 */
			_inputComplete: function() {
				this.options.doneCallback && this.options.doneCallback(this._getPassword());
				if(this.options.inputCompleteClose) {
					this._closeWrapper();
				}
			},

			//显示数字键盘
			_showKeyItem: function() {

				$(KEYBORAD_BOTTOM).addClass("active");
			},

			//显示数字键盘
			_hideKeyItem: function() {
				$(KEYBORAD_BOTTOM).removeClass("active");
			},

			//重置密码输入
			_reset: function() {
				$(PWD_BOX.concat(PWD_ITEM)).removeClass("active");
				this.inputPwd[0] = this.inputPwd[1] = "";
				$(INPUT_BOX).removeClass("back").removeClass("active");
				this.activeInputIndex = 0;
			},

			//获取输入密码
			_getPassword: function() {

				var result = "";

				if(this.options.secondPwd && this.inputPwd[0] == this.inputPwd[1]) {

					if(this.inputPwd[0] == this.inputPwd[1]) {
						//两次密码一致
						result = this.inputPwd[0];
					} else {
						result = "";
					}

				} else {
					result = this.inputPwd[0];
				}

				return result;
			},

			/**
			 * 删除输入面板
			 */
			_disponse: function() {
				var self = this;
				self._reset();

				if(self.options.closeDestruction) {
					$(KEYBOARD_PANEL).remove();
				} else {
					$(KEYBOARD_PANEL).removeClass("active");
				}
			},

			//显示密码支付面板
			_showWrapper: function() {

				var self = this;

				if(self.options.mask) {
					self.panelMask = winExp.createMask(function() {
						self._disponse();
					});

					self.panelMask.show();
				}
				$("input").each(function() {
					this.blur();
				});
				self._showKeyItem();
				$(KEYBOARD_PANEL).addClass("active");
			},

			//隐藏密码支付面板
			_closeWrapper: function() {
				var self = this;

				if(self.panelMask) {
					self.panelMask.close();
				} else {
					self._disponse();
				}

			}

		};

	//API

	/**
	 * 初始化密码输入框
	 * @param {Object} option:doneCallback输入完成之后的回调,beforeShow显示键盘之前回调
	 */
	returnResult.init = function(options) {
		keyboardPanel.init(options);
	};

	/**
	 * 显示密码输入面板
	 * @param {Object} doneCallback:输完密码之后的回调
	 */
	returnResult.show = function(options) {
		var options = options || {};
		if(options.withInit) {
			options.closeDestruction = true;
			options.ready = function() {
				//				setTimeout(function() {
				keyboardPanel._showWrapper();
				//				}, 300);

			};
			keyboardPanel.init(options);
		} else {
			keyboardPanel._showWrapper();
		}
	}

	/**
	 * 隐藏密码输入面板
	 */
	returnResult.hide = function() {
		keyboardPanel._closeWrapper();
	}

	/**
	 * 显示键盘
	 */
	returnResult.showKeyItem = function() {
		keyboardPanel._showKeyItem();
	}

	/**
	 * 隐藏键盘
	 */
	returnResult.hideKeyItem = function() {
		keyboardPanel._hideKeyItem();
	}

	/**
	 * 清除已输入密码
	 */
	returnResult.clear = function() {
		keyboardPanel._reset();
	};

	/**
	 * 获取输入的密码
	 */
	returnResult.getPwd = function() {
		return keyboardPanel._getPassword();
	};

	return returnResult;
})(mui);