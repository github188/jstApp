/**
 * 捷顺通卡挂失
 * version:1.0.1
 * created by Fizz/gangheng.huang@jieshun.cn
 */
require("./module/public_module");

(function($) {
	var carryClass = $(".reset-carry");
	var memoryClass = $(".reset-memory");
	var setPwd = require("./module/keyboard_pwd");
	var main = {
		//初始化执行
		init: function() {
			var self = this;
			self.bindEvent();
		},
		// 事件绑定
		bindEvent: function() {
			var self = this;
			// 记得密码重置
			carryClass.bind("tap", function() {
				setPwd.show({
					withInit: true,
					secondPwd: true,
					showForgetPwd: false,
					inputTitle: "请输入原卡密码",
					secondInputTitle: "请输入新的卡密码",
					doneCallback: function(){
//						console.log("a")
					}
				});
			});
			// 不记得密码重置
			memoryClass.bind("tap", function() {
				openWindow("jst_forget.html");
			});
		},

	}
	main.init();
})(mui);