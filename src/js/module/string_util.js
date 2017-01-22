/**
 * 字符串操作
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = (function($) {
	var returnResult = {};
	/**
	 * 判断是否为空,为空返回true
	 * @param {Object} target
	 */
	returnResult.isEmpty = function(target) {
		var typeoft = typeof(target);
		if(typeoft === "string") {
			target = target.trim();
			return target == "undefined" || target === "" || target == "\"\"" || target == "\'\'" || target == "null";
		}
		if(typeoft === "object") {
			return $.isEmptyObject(target);
		}
		return target === null || target === undefined;
	};

	/**
	 * 生成随机字符串
	 * @param {Object} length长度
	 */
	returnResult.randomString = function(length) {
		var str = '';
		for(; str.length < length; str += Math.random().toString(36).substr(2));
		return str.substr(0, length);
	};

	// 是否是网址
	returnResult.isURL = function(str) {
		//return !!str.match(/(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g);
		var strRegex = '^((https|http|ftp|rtsp|mms|file)?://)' +
			'(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?' //ftp的user@ 
			+
			'(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184 
			+
			'|' // 允许IP和DOMAIN（域名） 
			+
			'([0-9a-z_!~*\'()-]+.)*' // 域名- www. 
			+
			'([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名 
			+
			'[a-z]{2,6})' // first level domain- .com or .museum 
			+
			'(:[0-9]{1,4})?' // 端口- :80 
			+
			'((/?)|' // a slash isn't required if there is no file name 
			+
			'(/[0-9a-z_!~*\'().;?:@&=+$,%#-]+)+/?)$';
		var re = new RegExp(strRegex);
		//re.test() 
		if(re.test(str)) {
			return(true);
		} else {
			return(false);
		}
	};

	/**
	 * 返回多个相同字符
	 * @param {Object} n
	 */
	String.prototype.repeat = function(n) {
		return new Array(n + 1).join(this);
	}

	/**
	 * 处理字符串只显示一部分
	 * @param {Object} options
	 */
	returnResult.infoProtectDeal = function(options) {
		var options = $.extend({
			targetStr: "", //目标字符串
			keepStart: 0, //需保留前几位
			keepEnd: 0, //需保留后几位
			cipherLen: 0 //显示多少个*
		}, options);

		var returnStr = "";
		if(!returnResult.isEmpty(options.targetStr)) {
			if(options.keepStart > options.targetStr.length) {
				//前面要保留的数量已超过最大长度
				returnStr = options.targetStr;
			} else {

				var remainLen = options.targetStr.length - options.keepStart; //去掉前面保留的位数之后，还有多少位

				if(options.keepEnd > remainLen) {
					//后面要保留的位数已超过还剩余的位数
					returnStr = options.targetStr;
				} else {
					var remainCipherLen = options.targetStr.length - options.keepStart - options.keepEnd; //去掉前后保留之后，还有多少个字符需要*
					if(options.cipherLen > 0) {
						//有自定义显示多个*
						remainCipherLen = options.cipherLen;
					}

					returnStr = options.targetStr.slice(0, options.keepStart).concat("*".repeat(remainCipherLen)).concat(options.targetStr.slice(-options.keepEnd));
				}

			}
		}
		return returnStr;

	};

	/**
	 * 百分数转成小数，并保留两位
	 */
	returnResult.PercenttoPoint = function(str) {
		var num = str.replace("%", "");
		num = parseFloat(num) / 100;
		return parseFloat(num.toFixed(2));
	};

	/**
	 * 字符串格式化(加空格)
	 * type为手机号码或捷顺通卡号码
	 */
	returnResult.FormatNumber = function(str, type) {
		var t = "";
		switch(type) {
			case "mobile":
				for(var n = 0; n < str.length; ++n) {
					n == 3 || n == 7 ? t += " " + str[n] : t += str[n];
				}
				break;
			case "jstcard":
				for(var n = 0; n < str.length; ++n) {
					n == 6 ? t += " " + str[n] : t += str[n];
				}
				break;
		}
		return t;
	};

	/**
	 * 判断数组是否包含某元素
	 */
	returnResult.isInArray = function(arr, str) {
		var self = this;
		var t = false;
		for(var i = 0; i < arr.length; i++) {
			if(arr[i] == str) {
				t = true;
				break;
			}
		}
		return t;
	};
	return returnResult;
})(mui);