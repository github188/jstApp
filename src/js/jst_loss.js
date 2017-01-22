/**
 * 捷顺通卡挂失
 * version:1.0.1
 * created by Fizz/gangheng.huang@jieshun.cn
 */
require("./module/public_module");

(function($) {
	var checkident = true; // 是否校验证件号码
	var identres = false; // 证件号码是否合法
	var nameEle = $("#loss-user");
	var codeEle = $("#loss-code");
	var passwordEle = $("#loss-passkey");
	var codewarnClass = $(".loss-warn");
	var gopwbtnEle = $("#loss-gopw");
	var lossbtnClass = $(".loss-btn");

	var tcstageEle = $("#tc-stage");
	var tccloseClass = $(".tc-close");
	var tcshowClass = $(".tc-show");
	var tcpwbtnEle = $("#tc-pwinfo");
	var tcpwboxEle = $("#tc-tellpw");
	var tcidentEle = $("#tc-identbtn");
	var tccreEle = $("#tc-credentials");

	var InputValidators = require("./module/input_validators");

	var main = {
		//初始化执行
		init: function() {
			var self = this;
			self.bindEvent();
		},
		// 事件绑定
		bindEvent: function() {
			var self = this;
			// 校验必填项
			nameEle.bind("input", function() {
				self.validate();
			});
			codeEle.bind("input", function() {
				self.validate();
			});
			passwordEle.bind("input", function() {
				self.validate();
			});
			// 检测证件号码合法性
			codeEle.bind("input", function() {
				if(this.value.length == 18 && checkident) {
					self.validate();
					if(identres) {
						codewarnClass.addClass("none");
					} else {
						codewarnClass.removeClass("none");
					}
				}
			});
			// 确定挂失
			lossbtnClass.bind("tap", function() {
				if(!$(this).hasClass("click-orange")) {
					return false;
				}
				$.alert("调用挂失接口", "提示", "我知道了");
			});
			// 去找回密码
			gopwbtnEle.bind("tap", function() {
				openWindow("jst_forget.html");
			});
			// 弹出密码提示
			tcpwbtnEle.bind("tap", function() {
				self.showPwInfo();
			});
			// 弹出证件选择框
			tcidentEle.bind("tap", function() {
				self.showCredentials();
			});
			// 选择证件类型
			$("#tc-credentials li").bind("tap", function() {
				tcidentEle.html($(this).html());
				if($(this).attr("data-type") == "01") {
					checkident = true;
				} else {
					checkident = false;
					codewarnClass.addClass("none");
				}
			});
			// 关闭所有弹窗
			tccloseClass.bind("tap", function() {
				tcshowClass.addClass("none");
				document.removeEventListener('touchmove', self.bwDefault, false);
			});
		},
		// 校验
		validate: function() {
			var nameVal = nameEle.val();
			var codeVal = codeEle.val();
			var passwordVal = passwordEle.val();
			var isAble = InputValidators.getInputValidators();
			var validators = InputValidators.getInputValidators();
			isAble.addValidator('isNoEmpty', nameEle, null, nameVal);
			isAble.addValidator('isNoEmpty', codeEle, null, codeVal);
			isAble.addValidator('isNoEmpty', passwordEle, null, passwordVal);
			validators.addValidator("isValidIdentityCode", codeEle, null, codeVal);
			var result = validators.check();
			var isAbleres = isAble.check();
			if(!result) {
				identres = true;
			} else {
				identres = false;
			}
			if(!isAbleres) {
				lossbtnClass.addClass("click-orange fc-orange line-orange");
				lossbtnClass.removeClass("fc-gray-878787 line-gray");
			} else {
				lossbtnClass.addClass("fc-gray-878787 line-gray");
				lossbtnClass.removeClass("click-orange fc-orange line-orange");
			}
			//return isAbleres;
		},
		// 密码提示框
		showPwInfo: function() {
			var self = this;
			tcstageEle.removeClass("none");
			tcpwboxEle.removeClass("none");
			document.addEventListener('touchmove', self.bwDefault, false); // 阻止滑动屏幕
		},
		// 证件选择框
		showCredentials: function() {
			var self = this;
			tcstageEle.removeClass("none");
			tccreEle.removeClass("none");
			document.addEventListener('touchmove', self.bwDefault, false); // 阻止滑动屏幕
		},
		// 阻止浏览器默认行为
		bwDefault: function(e) {
			e.preventDefault();
		},
	}
	main.init();
})(mui);