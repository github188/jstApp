/**
 * 模拟数字密码键盘
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 * 用法：require("./keyboard_pwd").show({
					pwdLen: 6, //密码长度
					inputTitle: "请输入支付密码", //标题
					secondPwd: false, //是否需要两步密码确认
					secondInputTitle: "请再次确认支付密码",
					inputCompleteClose: false, //输完密码之后是否需要关闭输入界面
					closeDestruction: false, //关闭键盘时是否销毁对象
					showForgetPwd: true, //是否显示忘记密码了
					doneCallback:function(){},//输完密码之后的回调
					beforeKeyItemShow:function(){}//数字键盘弹出之前的回调
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

		KEYBOARD_PANEL = "keyboard-panel",
		FIRST_INPUT_BOX = "first-input-box",
		SECOND_INPUT_BOX = "second-input-box",
		ICON_CLOSE = "icon-close",
		CLASS_TRANSITIONING = 'transitioning',
		KEYBORAD_BOTTOM = "keyboard-bottom",

		forgetPwdHtml = '<div class="forget-pwd">忘记密码？</div>',
		inputBoxHtmlTpl = '<div class="input-box {{boxClass}}"><div class="title {{hasCloseBtnClass}}">{{boxTitle}}</div><div class="pwd-box {{boxClass}}"><p class="pwd-item"></p><p class="pwd-item"></p><p class="pwd-item"></p><p class="pwd-item"></p><p class="pwd-item"></p><p class="pwd-item"></p></div>{{forgetPwdHtml}}</div>',
		keyHtmlTpl = '<section class="keyboard-view {{panelClass}}"><a class="icon-close"></a>{{inputBox}}<div class="keyboard-bottom active"><div class="keyboard-box"><p class="item" val="1"><span>1</span> <span class="en"></span></p><p class="item" val="2"><span>2</span> <span class="en">ABC</span></p><p class="item" val="3"><span>3</span> <span class="en">DEF</span></p><p class="item" val="4"><span>4</span> <span class="en">GHI</span></p><p class="item" val="5"><span>5</span> <span class="en">JKL</span></p><p class="item" val="6"><span>6</span> <span class="en">MNO</span></p><p class="item" val="7"><span>7</span> <span class="en">PQRS</span></p><p class="item" val="8"><span>8</span> <span class="en">TUX</span></p><p class="item" val="9"><span>9</span> <span class="en">WXYZ</span></p><p class="item up" val="-2"><span>&or;</span></p><p class="item" val="0"><span>0</span></p><p class="item back" val="-1"><span>⇐</span></p></div></div></section>',
		stringUtil = require("./string_util"),
		winExp = require("./window_expansion"),
		keyboardPanel = {
			init: function(options) {
				this.options = $.extend({
					pwdLen: 6, //密码长度
					inputTitle: "请输入支付密码", //标题
					secondPwd: false, //是否需要两步密码确认
					secondInputTitle: "请再次确认支付密码",
					inputCompleteClose: false, //输完密码之后是否需要关闭输入界面
					closeDestruction: false, //关闭键盘时是否销毁对象
					showForgetPwd: true //是否显示忘记密码了
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

				$(".keyboard-view").remove();

				var inputBoxHtml = inputBoxHtmlTpl.replace(/{{boxClass}}/g, FIRST_INPUT_BOX).replace("{{boxTitle}}", this.options.inputTitle) +
					(this.options.secondPwd ? inputBoxHtmlTpl.replace(/{{boxClass}}/g, SECOND_INPUT_BOX).replace("{{boxTitle}}", this.options.secondInputTitle) : "");

				//是否显示忘记密码了
				var _forgetPwdHtml = "";
				if(this.options.showForgetPwd) {
					_forgetPwdHtml = forgetPwdHtml;
				}

				inputBoxHtml = inputBoxHtml.replace(/{{forgetPwdHtml}}/g, _forgetPwdHtml);

				if(this.wrapper && this.wrapper[0]) {
					inputBoxHtml = inputBoxHtml.replace(/{{hasCloseBtnClass}}/g, "");
					this.wrapper.html(keyHtmlTpl.replace("{{inputBox}}", inputBoxHtml));
					$("." + ICON_CLOSE).hide();
				} else {
					//没指定添加到哪个元素，直接添加至BODY，且指定为弹窗方式，左上角显示关闭铵钮
					inputBoxHtml = inputBoxHtml.replace(/{{hasCloseBtnClass}}/g, "title-close");

					var panel = $.dom(keyHtmlTpl.replace("{{inputBox}}", inputBoxHtml).replace("{{panelClass}}", KEYBOARD_PANEL));
					document.body.appendChild(panel[0]);
					this.wrapper = $(panel[0]);
					$("." + ICON_CLOSE).show();
				}

				var inputBoxH = $(".input-box")[0].offsetHeight,
					keyItemH = $("." + KEYBORAD_BOTTOM)[0].offsetHeight,
					wrapperH = this.wrapper[0].offsetHeight;

//				this.wrapper.css({
//					height: (inputBoxH + keyItemH) + "px"
//				})

				this.firstInput = $(".input-box." + FIRST_INPUT_BOX);
				this.secondInput = $(".input-box." + SECOND_INPUT_BOX);

				this._initEvent();

			},

			//绑定事件
			_initEvent: function() {

				var self = this;

				/**
				 * 忘记密码了
				 */
				$(".forget-pwd").addEventListener("tap", function() {

					self.panelMask.close();

					var href = constant.rootPath + "/page/account/forget_pay_pwd.html";
					openWindow(href);
				});

				/**
				 * 数字键盘点击事件
				 */
				self.wrapper.on("tap", ".item", function() {
					var $this = $(this),
						val = $this.attr("val");

					if(!stringUtil.isEmpty(val)) {
						var pwdBoxLastIndex = 0,
							inputClass = "";
						if(0 == self.activeInputIndex) {
							//当前正在输入第一个界面
							inputClass = "." + FIRST_INPUT_BOX + ".pwd-box .pwd-item";
						} else {
							inputClass = "." + SECOND_INPUT_BOX + ".pwd-box .pwd-item";
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
									$.toast("两次密码输入不一致");
									self._reset();
								}

							}

						}
					}
				});

				/**
				 * 密码输入框点击事件，弹起键盘
				 */
				self.wrapper.on("tap", ".pwd-box", function() {
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
				$("." + ICON_CLOSE).addEventListener("tap", function() {
					self.panelMask.close();
				});

			},

			/**
			 * 输入完毕了
			 */
			_inputComplete: function() {
				if(this.options.inputCompleteClose) {
					this.panelMask.close();
				}

				this.options.doneCallback && this.options.doneCallback(this._getPassword());
			},

			//显示数字键盘
			_showKeyItem: function() {

				$("." + KEYBORAD_BOTTOM).addClass("active");
			},

			//显示数字键盘
			_hideKeyItem: function() {
				$("." + KEYBORAD_BOTTOM).removeClass("active");
			},

			//重置密码输入
			_reset: function() {
				$(".pwd-box .pwd-item").removeClass("active");
				this.inputPwd[0] = this.inputPwd[1] = "";
				$(".input-box").removeClass("back").removeClass("active");
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

			//显示密码支付面板
			_showWrapper: function() {

				var self = this;

				self.panelMask = winExp.createMask(function() {
					self._reset();

					if(self.options.closeDestruction) {
						$("." + KEYBOARD_PANEL).remove();
					} else {
						$("." + KEYBOARD_PANEL).removeClass("active");
					}
				});

				self.panelMask.show();
				self._showKeyItem();
				$("." + KEYBOARD_PANEL).addClass("active");
			},

			//隐藏密码支付面板
			_closeWrapper: function() {
				this.panelMask.close();
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
			keyboardPanel.init(options);
		}

		keyboardPanel._showWrapper();
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