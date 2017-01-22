/**
 * 支付结果页,目前版本还没有支付结果页，这个页面暂时作为中转
 * 现在出现场景是在APP环境下银联支付WAP之后，会跳至这个页面
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./module/public_module");
(function($, window, document) {

	var main = {
		init: function() {
			var self = this;
			self.plusReady();
		},

		plusReady: function() {

			if($.os.plus) {
				$.plusReady(function() {
					plus.webview.currentWebview().close();
				});
			} else {
				//跳至个人中心
				var href = constant.rootPath + "/page/home/index.html";
				openWindow(href, href);
			}

		}
	};
	main.init();

})(mui, window, document);
//end