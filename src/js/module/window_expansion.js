/**
 * 自定义窗口方法扩展
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = (function($) {
	var returnResult = {},
		stringUtil = require("./string_util"),
		local = require("./localStorage"),
		requestURL = require("./requestURL");
	returnResult.waiting = null;

	/**
	 * 显示等待框
	 */
	window.showWaiting = function() {

		if(returnResult.hasShowWait) {
			//加这个判断是为了防止有多个请求一起，会显示多个等待框
			return;
		}

		returnResult.hasShowWait = true;

//		if($.os.plus && !returnResult.waiting) {
//
//			try {
//				returnResult.waiting = plus.nativeUI.showWaiting("加载中,请稍候...", {
//					padlock: true
//				});
//			} catch(e) {
//				//TODO handle the exception
//			}
//
//		} else {

			var d1 = document.createElement("div");
			d1.className = "win-mask-wait";
			d1.id = "winloadmak";
			document.body.appendChild(d1);

			var d2 = document.createElement("div");
			d2.className = 'ui-load mui-loading';
			d2.id = "winloaditem";
			d2.align = "center";
			d2.innerHTML = '<div class="mui-spinner"></div>';
			//			d2.innerHTML = '<div class="mui-spinner"></div><div class="waitText">加载中,请稍候...</div>';

			document.body.appendChild(d2);

			var sh = document.documentElement.scrollHeight;
			var screenHeight = document.documentElement.clientHeight;
			d1.style.height = Math.max(sh, screenHeight) + "px";
			d2.style.top = (screenHeight - d2.scrollHeight) / 2 + "px";
			returnResult.mask = true;
//		}
	};

	/**
	 * 关闭等待框
	 */
	window.closeWaiting = function() {
		returnResult.hasShowWait = false;
		if($.os.plus && returnResult.waiting) {
			returnResult.waiting.close();
			returnResult.waiting = null;
		}
		var wm = document.getElementById("winloadmak");
		var wi = document.getElementById("winloaditem");
		wm && document.body.removeChild(wm);
		wi && document.body.removeChild(wi);
		returnResult.mask = false;
	};

	/**
	 * 创建遮罩层
	 * @param {Object} callback：遮罩层关闭之后回调
	 * @param {Object} isCloseMask:点击遮罩层是否关闭弹窗，true表示不关闭
	 */
	returnResult.createMask = function(callback, isCloseMask) {
		var element = document.createElement('div');
		element.classList.add("mui-backdrop");
		element.addEventListener($.EVENT_MOVE, $.preventDefault);
		element.addEventListener('tap', function() {
			if(!isCloseMask) {
				createmMask.close();
			}
		});
		var createmMask = [element];
		createmMask._show = false;
		createmMask.show = function() {
			returnResult.mask = true;
			createmMask._show = true;
			element.setAttribute('style', 'opacity:1');
			document.body.appendChild(element);
			return createmMask;
		};
		createmMask._remove = function() {
			if(createmMask._show) {
				createmMask._show = false;
				element.setAttribute('style', 'opacity:0');
				$.later(function() {
					var body = document.body;
					element.parentNode === body && body.removeChild(element);
				}, 350);
			}
			return createmMask;
		};
		createmMask.close = function() {

			returnResult.mask = false;

			if(callback) {
				callback();
				createmMask._remove();
			} else {
				createmMask._remove();
			}
		};
		return createmMask;
	};

	/**
	 * 
	 * @param {Object} openURL 要打开的链接地址如test.html
	 * @param {Object} id 给要打开的链接一个命名如test.html,不要带特殊字符
	 * @param {Object} param 参数如{username:"MAX"}
	 * @param {Object} styles 新开窗口的样式如顶部top:"44 px",非APP环境不用转此参数
	 * @param {Object} show 动画效果等
	 * @param {Object} needEncodeURI :URI是否需要编码
	 */
	window.openWindow = function(openURL, id, param, styles, show, needEncodeURI) {
		if(stringUtil.isEmpty(openURL)) {
			return;
		}

		var id = id || openURL;

		var param = param || {};

		var openurl = requestURL.createURL(openURL, param);

		if($.os.plus) {
			if(constant.base.indexOf("file://") != -1) {
				openurl = openurl.replace(constant.rootPath, '');
			} else {
				openurl = openurl.replace(constant.rootPath + "/", constant.base);
			}
		}
		if(needEncodeURI) {
			openurl = encodeURI(openurl);
		}

		console.log("openWindow:" + openurl);

		sessionStorage.removeItem("goback");

		var open = function() {
			$.openWindow(openurl, id, {
				styles: styles,
				extras: param,
				show: show
			});
		};

		if($.os.plus) {
			$.plusReady(open);
		} else {
			open();
		}

	};

	/**
	 * 页面左上角返回事件处理
	 */
	returnResult.back = function() {

		if($.os.plus) {
			return;
		}

		if(history.length < 2) {
			openWindow(constant.rootPath + "/page/home/index.html", "index.html");
		} else {
			window.history.go(-1);
		}
	};

	document.addEventListener('touchmove', function(e) {
		if(returnResult.mask)
			e.preventDefault();
	}, false);
	return returnResult;
})(mui);