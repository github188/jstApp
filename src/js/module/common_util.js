/**
 * 常用判断方法等
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./mui_expansion");
module.exports = (function($) {
	var returnResult = {};
	/**
	 * 验证码倒计时
	 */
	returnResult.timeDown = function(o, t) {
		t = t || 90;
		if(t == 0) {
			$(o).removeAttr("disabled");
			$(o).removeClass("disabled");
			var tryText = "获取验证码";
			$(o).html(tryText);
		} else {
			$(o).attr("disabled", true);
			$(o).addClass("disabled");
			var tryText = "(" + t + "秒)重新获取";
			$(o).html(tryText);
			t--;
			returnResult.timeout = setTimeout(function() {
				returnResult.timeDown(o, t);
			}, 1000);
		}
	};

	/**
	 * 停止倒计时
	 * @param {Object} element
	 */
	returnResult.stopTimeDown = function(element) {
		$(element).removeAttr("disabled");
		$(element).removeClass("disabled");
		var tryText = "获取验证码";
		$(element).html(tryText);
		clearTimeout(returnResult.timeout);
	}

	return returnResult;
})(mui);