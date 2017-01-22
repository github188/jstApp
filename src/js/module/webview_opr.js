/**
 * webview操作
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./mui_expansion");
module.exports = {
	closeLanuchOther: function(currentWebview, closeTimeout) {

		mui.plusReady(function() {

			// 获取所有Webview窗口
			var wvs = plus.webview.all(),
				closeTimeout = closeTimeout || 500,
				currentWeb = currentWebview || require("./webview_opr").getLaunchWebview(),
				lauchWeb = require("./webview_opr").getLaunchWebview(),
				appLanuch = plus.webview.getLaunchWebview();

			var closeW = function() {
				for(var i = 0; i < wvs.length; i++) {
					var wvsitem = wvs[i];

					console.log(wvsitem.id);
					if(wvsitem.parent()) {
						console.log("-----parent-----" + wvsitem.parent().id);
					}

					if(wvsitem != appLanuch && wvsitem.parent() != appLanuch && wvsitem != lauchWeb && wvsitem.parent() != lauchWeb && wvsitem != currentWeb && wvsitem.parent() != currentWeb) {
						wvsitem.close("none");
						console.log(wvsitem.id + " already closed");
					}
				}
			};

			setTimeout(closeW, closeTimeout);
		});

	},

	/**
	 * 获取启动页的WEBVIEW，当加载远程启动文件时，将启动WEB设置为lanuch.html
	 */
	getLaunchWebview: function() {
		var lanuchWeb = plus.webview.getWebviewById("lanuch.html"),
			returnWeb;
		if(lanuchWeb) {
			returnWeb = lanuchWeb;
		} else {
			returnWeb = plus.webview.getLaunchWebview();
		}
		return returnWeb;
	}
};