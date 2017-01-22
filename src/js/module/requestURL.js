/**
 * URL常用方法
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
var stringUtil = require("./string_util")
module.exports = {

	createURL: function(url, parameter) {
		var urlresult = url || '';
		for(var p in parameter) {
			if(typeof(parameter[p]) !== "function") {
				var key = p,
					value = parameter[p];

				var oldpara = this.getParameter(key, urlresult),
					newPara = key + "=" + encodeURIComponent(value);
				if(!stringUtil.isEmpty(oldpara)) {
					//链接里已经有此参数了，替换它吧
					urlresult = urlresult.replace(key + "=" + oldpara, newPara);
				} else {
					if(urlresult.indexOf("?") != -1) {
						urlresult += "&";
					} else {
						urlresult += "?";
					}
					urlresult += newPara;
				}

			}
		}
		return urlresult;
	},
	/**
	 * 
	 * @param {Object} name,参数名
	 * @param {Object} findStr,要查找的字符串,默认为当前页面链接地址
	 */
	getParameter: function(name, findStr) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");

		if(!stringUtil.isEmpty(findStr)) {
			findStr = findStr.indexOf("?") != -1 ? findStr.substr(findStr.indexOf("?") + 1) : findStr;
		}

		var searchStr = findStr || window.location.search.substr(1);

		var r = searchStr.match(reg);
		if(r != null) return decodeURIComponent(r[2]);
		return "";
	}

};