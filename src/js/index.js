/**
 * 首页
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./module/public_module");
(function($) {

	main = {
		//初始化执行
		init: function() {		
			var self = this;
			require("./module/footer").init();
			
			self.bindEvent();
			
		},
		//事件绑定
		bindEvent:function(){
			$(".page-href").bind("tap", function() {

				if(!login.isLogin()) {
					login.gotoLogin(true);
					return false;
				}

				var href = $(this).data("href"),
					param = {};
				if(!stringUtil.isEmpty(href)) {
					if(!stringUtil.isURL(href)) {
						href = constant.rootPath + href;
					}
					if($.os.plus) {
						param.fromPageId = plus.webview.currentWebview().id;
					}
					openWindow(href, href, param);
				}
			});
			
			
		}
	};
	main.init();

})(mui);
//end