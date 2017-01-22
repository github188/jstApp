/**
 * 捷顺通卡挂失
 * version:1.0.1
 * created by Fizz/gangheng.huang@jieshun.cn
 */
require("./module/public_module");

(function($) {
	var checkident = true; // 是否校验证件号码
	var jstacctres = false; // 证件号码是否合法
	var identres = false; // 证件号码是否合法
	var mynumEle = $("#loss-mynum");
	var carderrClass = $(".loss-carderr");
	var nameEle = $("#loss-user");
	var codeEle = $("#loss-code");
	var codewarnClass = $(".loss-warn");
	var gopwbtnEle = $("#loss-gopw");
	var lossbtnClass = $(".loss-btn");

	var tcstageEle = $("#tc-stage");
	var tccloseClass = $(".tc-close");
	var tcshowClass = $(".tc-show");
	var tcidentEle = $("#tc-identbtn");
	var tccreEle = $("#tc-credentials");

	var InputValidators = require("./module/input_validators");

	var main = {
		//初始化执行
		init: function() {
			var self = this;
			self.bindEvent();
			self.showCard(requestURL.getParameter("card"));
		},
		// 自动填写卡号
		showCard: function(code){
			if(!stringUtil.isEmpty(code)){
				mynumEle.val(stringUtil.FormatNumber(code,"jstcard"));
			}
		},
		// 事件绑定
		bindEvent: function() {
			var self = this;
			// 验证卡号合法性
			mynumEle.bind("input",function(){
				self.validate();
				this.value = stringUtil.FormatNumber(this.value.replace(/\D/g,""),"jstcard");
				if(this.value.replace(/\D/g,"").length == 19) {
					if(jstacctres) {
						carderrClass.addClass("none");
					} else {
						carderrClass.removeClass("none");
					}
				}
			});
			// 校验必填项
			nameEle.bind("input", function() {
				self.validate();
			});
			codeEle.bind("input", function() {
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
				$.alert("调用重置密码", "提示", "我知道了");
			});
			// 去找回密码
			gopwbtnEle.bind("tap", function() {
				openWindow("jst_forget.html");
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
			var mynumVal = mynumEle.val();
			var nameVal = nameEle.val();
			var codeVal = codeEle.val();
			var isAble = InputValidators.getInputValidators();
			var validJstcard = InputValidators.getInputValidators();
			var validIdent = InputValidators.getInputValidators();
			
			isAble.addValidator('isNoEmpty', mynumEle, null, mynumVal);
			isAble.addValidator('isNoEmpty', nameEle, null, nameVal);
			isAble.addValidator('isNoEmpty', codeEle, null, codeVal);
			validJstcard.addValidator("isJstCardCode", mynumEle, null, mynumVal);
			validIdent.addValidator("isValidIdentityCode", codeEle, null, codeVal);
			
			var isJstcardres = validJstcard.check();
			var isIdentres = validIdent.check();
			var isAbleres = isAble.check();
			if(!isJstcardres) {
				jstacctres = true;
			} else {
				jstacctres = false;
			}
			if(!isIdentres) {
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