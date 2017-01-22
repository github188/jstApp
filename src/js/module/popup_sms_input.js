/**
 * 短信验证码输入
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 * 用法：require("./module/popup_sms_input").show({
 					withInit:false,//是否直接初始化并显示，如设置为FALSE，请先调用init 
					smsSended: false, //是否已经发送短信
					headerTitle: "", //标题
					mobile: "", //要获取短信的手机号
					inputCompleteClose: false, //输完验证码之后是否需要关闭输入界面
					getCodeCallback: function() {},//获取验证码回调
					doneCallback: function() {}//输完后的回调
				});
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

		PANEL_CLASS = ".popup-sms-panel", //弹出框的CLASS
		PANEL_HEADER = ".popup-sms-panel .header", //头部元素
		PANEL_TITLE_CLASS = ".p-s-p-header-title", //标题
		INPUT_TITLE_CLASS = ".p-s-p-input-title", //已发送手机号提示
		SMS_CODE_INPUT_CLASS = ".p-s-p-smscode-input", //验证码输入框
		GET_CODE_BTN_CLASS = ".p-s-p-get-code-btn", //获取验证码CLASSNAME
		INPUT_TIPS_CLASS = ".p-s-p-input-tips", //验证码错误提示
		CONFIRM_BTN = ".p-s-p-confirm-btn", //输入完成铵钮

		stringUtil = require("./string_util"),
		InputValidators = require("./input_validators"),
		commonUtil = require("./common_util"),
		smsPanel = {
			init: function(options) {
				this.options = $.extend({
					smsSended: false, //是否已经发送短信
					headerTitle: "输入验证码", //标题
					mobile: "", //要获取短信的手机号
					inputCompleteClose: false, //输完验证码之后是否需要关闭输入界面
					smsCodeMaxLength: 6 //短信验证码长度
				}, options);
				this.inputValue = "";
				this._init();
			},

			//初始化
			_init: function() {
				this._initElements();
			},

			//创建DOM
			_initElements: function() {

				var self = this,
					_create = function(res) {
						$(PANEL_CLASS).remove();
						var panel = $.dom(res);

						//没指定添加到哪个元素，直接添加至BODY，且指定为弹窗方式，左上角显示关闭铵钮
						document.body.appendChild(panel[0]);

						self._initEvent();

						self.options.ready && self.options.ready();
					};

				postData("page/module/popup_sms_input.html", {}, _create, null, {
					requestType: "get",
					dataType: "html",
					localResource: true
				});

			},

			//绑定事件
			_initEvent: function() {

				var self = this;

				InputValidators.limitInputLength($(SMS_CODE_INPUT_CLASS), 6, "number");

				/**
				 * 获取验证码
				 */
				$(PANEL_CLASS).on("tap", GET_CODE_BTN_CLASS, function() {

					var $this = $(this);

					if($this.hasClass("disabled")) {
						return;
					}

					if(stringUtil.isEmpty(self.options.mobile)) {
						$.toast("手机号为空");
						return;
					}

					if(typeof self.options.getCodeCallback === 'function') {
						//获取验证码的接口不一样，这儿判断如果有自定义的方法，就回调
						self.options.getCodeCallback($this);
					} else {
						//调用接口发送短信
						postData("app/rest/message/msgSend", {
							mobile: self.options.mobile,
							mark: "1"
						}, function(data) {
							if(data.resType == "00") {
								$.toast("验证码已发送");
							} else {
								$.toast(data.msgContent);
							}
							commonUtil.timeDown($this);
						}, null, {
							requestType: "get"
						});
					}

				});

				// 检查输入的验证码是否合法
				$(PANEL_CLASS).on("input", SMS_CODE_INPUT_CLASS, function() {

					if(self.options.smsCodeMaxLength == this.value.length) {
						//用户输完之后，验证
						self.validate.validateSmsCode();
						$(CONFIRM_BTN).removeClass("disabled");
					} else {
						$(INPUT_TIPS_CLASS).removeClass("error").html("");
						$(CONFIRM_BTN).addClass("disabled");
					}

				});

				/**
				 * 右上角关闭
				 */
				$(PANEL_CLASS).on("tap", ".back", function() {
					self._close();
				});

				/**
				 * 确认
				 */
				$(PANEL_CLASS).on("tap", CONFIRM_BTN, function() {

					var $this = $(this);

					if($this.hasClass("disabled")) {
						return false;
					}

					if(self.validate.checkAll()) {
						return false;
					}

					self._inputComplete();

				});

			},

			//验证输入项是否合规
			validate: {

				/**
				 * 验证短信验证码
				 */
				validateSmsCode: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', $(INPUT_TIPS_CLASS), APPwarn.checkcode.none, $(SMS_CODE_INPUT_CLASS).val());
					validators.addValidator('isValidSmsCode', $(INPUT_TIPS_CLASS), APPwarn.checkcode.err, $(SMS_CODE_INPUT_CLASS).val());
					return this.check(validators, $(INPUT_TIPS_CLASS));
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
					return this.validateSmsCode();
				}
			},

			/**
			 * 输入完毕了
			 */
			_inputComplete: function() {
				if(this.options.inputCompleteClose) {
					this._close();
				}

				this.options.doneCallback && this.options.doneCallback($(SMS_CODE_INPUT_CLASS).val());
			},

			/**
			 * 显示弹出框
			 */
			_show: function(options) {

				var self = this;

				self.options = $.extend(self.options, options);

				//设置标题
				if(!stringUtil.isEmpty(self.options.headerTitle)) {
					$(PANEL_TITLE_CLASS).html(self.options.headerTitle);
				} else {
					$(PANEL_HEADER).remove();
				}

				//显示手机号
				$(INPUT_TITLE_CLASS).html(stringUtil.isEmpty(this.options.mobile) ? "请输入短信验证码" : "请输入手机{{mobileText}}收到的短信验证码".replace("{{mobileText}}", stringUtil.infoProtectDeal({
					targetStr: this.options.mobile,
					keepStart: 3,
					keepEnd: 4
				})));

				if(this.options.smsSended) {
					commonUtil.timeDown($(GET_CODE_BTN_CLASS));
				}
				$(PANEL_CLASS).removeClass("hidden").addClass("mui-active");
			},

			/**
			 * 关闭弹出框
			 */
			_close: function() {
				this._clear();

				if($(PANEL_CLASS).length > 0) {
					$(PANEL_CLASS).removeClass("mui-active").addClass("hidden");
					commonUtil.stopTimeDown($(GET_CODE_BTN_CLASS));
				}

			},

			/**
			 * 清除输入
			 */
			_clear: function() {
				$(SMS_CODE_INPUT_CLASS).length > 0 && $(SMS_CODE_INPUT_CLASS).val("");
			}

		};

	//API

	/**
	 * 初始化面板
	 * @param {Object} options
	 */
	returnResult.init = function(options) {
		smsPanel.init(options);
	}

	/**
	 * 显示验证码输入面板
	 * @param {Object} doneCallback:输完验证码之后的回调
	 */
	returnResult.show = function(options) {

		var options = options || {};
		if(options.withInit) {
			options.ready = function() {
				smsPanel._show();
			};
			smsPanel.init(options);
		}

		smsPanel._show(options);

	}

	/**
	 * 隐藏验证码输入面板
	 */
	returnResult.hide = function() {
		smsPanel._close();
	}

	/**
	 * 清除验证码
	 */
	returnResult.clear = function() {
		smsPanel._clear();
	}

	return returnResult;
})(mui);