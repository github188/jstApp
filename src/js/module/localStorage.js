/**
 * localStorage操作
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
var stringUtil = require("./string_util");
//	crypto = require("./crypto");
module.exports = {

	setItem: function(vkey, value) {

		if(!stringUtil.isEmpty(vkey)) {
//			window.localStorage.setItem(crypto.encrypt(vkey), crypto.encrypt(value));
			
			window.localStorage.setItem(vkey, value);
		}

	},
	getItem: function(vkey) {
//		var keyTmp = crypto.encrypt(vkey);
		var resultStr = '';
		if(!stringUtil.isEmpty(vkey)) {
//			resultStr = crypto.decrypt(window.localStorage.getItem(keyTmp));
			
			resultStr = window.localStorage.getItem(vkey);
		}

		return resultStr;
	},
	removeItem: function(vkey) {
//		!stringUtil.isEmpty(vkey) && window.localStorage.removeItem(crypto.encrypt(vkey));
		
		!stringUtil.isEmpty(vkey) && window.localStorage.removeItem(vkey);
	},
	clear: function() {
		window.localStorage.clear();
	}
};