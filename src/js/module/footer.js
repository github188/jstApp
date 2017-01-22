/**
 * 底部导航初始化
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./mui_expansion");
module.exports = (function($) {
	var self = {},
		constant = require("./constant"),
		navs = ["首页", "我的"], //菜单标题
		urls = ["page/home/index.html", "page/account/account.html"], //菜单链接
		FOOTER_MENU_ID = "footerMenu",
		FOOTER_ITEM_CLASS = "footer-item",

		/**
		 * 高亮显示
		 */
		currentShow = function() {
			var href = window.location.href;
			var actived = false;
			for(var i = 0; i < urls.length; i++) {
				if(href.indexOf(urls[i]) != -1) {
					actived = true;
					$("#nav-".concat(i)).addClass("active");
					break;
				}
			}
			if(!actived) {
				$("#nav-0").addClass("active");
			}

		},

		/**
		 * 添加事件监听
		 */
		bindEvent = function() {
			$("#".concat(FOOTER_MENU_ID)).on("tap", "." + FOOTER_ITEM_CLASS, function() {
				var httpurl = constant.base + $(this).data("href");
				var index = $(this).data("index");
				openWindow(httpurl);
			});

		};

	self.addMenuHTML = function() {

		//创建ul标签
		var footer = document.createElement("footer");
		footer.id = FOOTER_MENU_ID;
		footer.className = "footer-bottom";
		//循环创建标签  添加底部导航
		for(var i = 0; i < navs.length; i++) {
			var section = document.createElement("section"),
				divclass = FOOTER_ITEM_CLASS;
			section.id = "nav-" + i;
			section.className = FOOTER_ITEM_CLASS.concat(" nav-" + i);
			section.setAttribute("data-href", urls[i]);
			section.setAttribute("data-index", i);

			section.innerHTML = '<i class="footer-icon"></i><div class="footer-text">{{footerText}}</div>'.replace("{{footerText}}", navs[i]);

			footer.appendChild(section);
		}
		document.body.appendChild(footer);

	};

	self.init = function() {

		if($.os.plus) {

			//APP环境下面，导航页面不需要距底部有距离
			$(".mui-content").css("padding-bottom", "0");

		} else {
			this.addMenuHTML();
			currentShow();
		}

		bindEvent();

	};

	return self;
})(mui);