/**
 * 公共引用，JS模块或入口都依赖此文件，涉及到大部分页面需用到
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */

require("./mui_expansion");

//常量定义
window.constant = require("./constant");

//字符串工具
window.stringUtil = require("./string_util");

//URL常用方法
window.requestURL = require("./requestURL");

//存储
window.local = require("./localStorage");

//自定义窗口方法扩展
window.winExp = require("./window_expansion");

//HTTP请求操作
window.httpClient = require("./http_client");

//登录信息设置获取
window.login = require("./login_module");

/**
 * 加载执行，初始化等
 * @param {Object} $
 */
(function($) {
	var self = {},

		//设置页面HTML属性fontsize
		setFontsize = function() {
			var docEl = document.documentElement,
				clientWidth = docEl.clientWidth;
			if(!clientWidth) return;
			var fontsize = Math.min(clientWidth, 640) / 16;
			docEl.style.fontSize = this.fontSize = fontsize + 'px';
			docEl.setAttribute('fontsize', fontsize);
		},
		//初始化执行
		_init = function() {

			setFontsize();

			//判断非APP环境，弹窗口提示移步至APP
//			if(!$.os.plus) {
//				alert("请移步至APP操作");
//				$.openWindow("http://fir.im/jieshunpa");
//			}

		};
	_init();

})(mui);