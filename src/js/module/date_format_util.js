/**
 * 日期格式化工具
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = (function($) {
	var returnResult = {},
		stringUtil = require("./string_util");

	/**
	 * 将时间错转换为格式化时间，返回字符串
	 *
	 * @param {Object}
	 *            timeStamp:时间错
	 * @param {Object}
	 *            formatstr:格式(yyyy-MM-dd HH:mm:ss等)
	 */
	returnResult.timeFormat = function(timeStamp, formatstr) {
		if(!stringUtil.isEmpty(timeStamp))
			if(formatstr == "yyyy-MM-dd hh:mm:ss.S") {
				var dateStr = new Date(parseInt(timeStamp)).Format(formatstr).toLocaleString();
				if(dateStr.length == 21) {
					dateStr += "00";
				} else if(dateStr.length == 22) {
					dateStr += "0";
				}
				return dateStr;
			} else {
				return new Date(parseInt(timeStamp)).Format(formatstr).toLocaleString();
			}
		else
			return "";
	};
	Date.prototype.Format = function(fmt) {
		var o = {
			"M+": this.getMonth() + 1, //月份   
			"d+": this.getDate(), //日   
			"h+": this.getHours(), //小时   
			"m+": this.getMinutes(), //分   
			"s+": this.getSeconds(), //秒   
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度   
			"S": this.getMilliseconds() //毫秒   
		};
		if(/(y+)/.test(fmt))
			fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for(var k in o)
			if(new RegExp("(" + k + ")").test(fmt))
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	};

	//字符串转日期格式，strDate要转为日期格式的字符串
	returnResult.getDate = function(strDate) {
		var date = eval('new Date(' + strDate.replace(/\d+(?=-[^-]+$)/,
			function(a) {
				return parseInt(a, 10) - 1;
			}).match(/\d+/g) + ')');
		return date;
	};
	return returnResult;
})(mui);