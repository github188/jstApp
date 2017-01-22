/**
 *jst 绑卡成功
 * version:1.0.1
 * created by aj/chengjun.zhu@jieshunpay.cn
 */
require("./module/public_module");

(function($) {
	var restextEle = $("#busrestext");
	var resimgEle = $("#resimgbox");
	var newcanalClass = $(".busnewcanal");
	var newtextClass = $("#newcardtext");
	var ressureClass = $(".result-sure");
	var bindcardEle = $("#bindthiscard");
	var resabtnEle = $("#resabtn");
	var main = {
		//初始化执行
		init: function() {
			var self = this;
			self.showImgInfo(requestURL.getParameter("res"));
			self.showBtnInfo(requestURL.getParameter("newcard"));
			self.bindEvent();
		},
		showImgInfo: function(type) {
			switch(type) {
				case "01":
					restextEle.html("支付成功！");
					resimgEle.html('<img src="../../img/icon/micon_6.png" />');
					//			$(".rescontext").addClass("none");
					//			$(".rescontext").eq(0).removeClass("none");
					break;
				case "02":
					restextEle.html("支付失败~");
					resimgEle.html('<img src="../../img/icon/micon_7.png" />');
					//			$(".rescontext").addClass("none");
					//			$(".rescontext").eq(1).removeClass("none");
					break;
			}
		},
		showBtnInfo: function(type) {
			switch(type) {
				case "02":
					newcanalClass.removeClass("none");
					newtextClass.html(requestURL.getParameter("card").substr(-4));
					ressureClass.removeClass("padtop-50");
					break;
				default:
			}
		},
		bindEvent: function() {
			resabtnEle.bind("tap", function() {

				if($.os.plus) {
					//显示首页
					$.plusReady(function() {
						$.fire(require("./module/webview_opr").getLaunchWebview(), "changeTab", {
							toIndex: 1
						});

						require("./module/webview_opr").getLaunchWebview().show("slide-in-right", constant.duration);
					});

				} else {
					var href = constant.rootPath + "/page/account/account.html";
					openWindow(href);
				}

			});
		},
	};
	main.init();

})(mui);