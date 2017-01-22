/**
 * 输入框验证策略
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = (function($) {
	var mobileTest = /^1[3|4|5|8|7|9][0-9]\d{8}$/,
		smsCodeTest = /^[0-9]{6}$/, // 短信验证码
		passwordTest = /^(?![^A-Za-z]+$)(?![^0-9]+$)[\x21-\x7E]{6,20}$/, // 密码
		safecodeTest = /^[0-9]{3}$/, // 信用卡安全码
		nameTest = /^[\u4e00-\u9fa5]*$/, // 用户姓名
		emailTest = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/,
		blkey = ["0123", "1234", "2345", "3456", "4567", "5678", "6789", "9876", "8765", "7654", "6543", "5432", "4321", "3210", "0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999", "abcd", "bcde", "cdef", "defg", "efgh", "fghi", "ghij", "hijk", "ijkl", "jklm", "klmn", "lmno", "mnop", "nopq", "opqr", "pqrs", "qrst", "rstu", "stuv", "tuvw", "uvwx", "vwxy", "wxyz", "zyxw", "yxwv", "xwvu", "wvut", "vuts", "utsr", "tsrq", "srqp", "rqpo", "qpon", "ponm", "onml", "nmlk", "mlkj", "lkji", "kjih", "jihg", "ihgf", "hgfe", "gfed", "fedc", "edcb", "dcba", "ABCD", "BCDE", "CDEF", "DEFG", "EFGH", "FGHI", "GHIJ", "HIJK", "IJKL", "JKLM", "KLMN", "LMNO", "MNOP", "NOPQ", "OPQR", "PQRS", "QRST", "RSTU", "STUV", "TUVW", "UVWX", "VWXY", "WXYZ", "ZYXW", "YXWV", "XWVU", "WVUT", "VUTS", "UTSR", "TSRQ", "SRQP", "RQPO", "QPON", "PONM", "ONML", "NMLK", "MLKJ", "LKJI", "KJIH", "JIHG", "IHGF", "HGFE", "GFED", "FEDC", "EDCB", "DCBA", "aaaa", "bbbb", "cccc", "dddd", "eeee", "ffff", "gggg", "hhhh", "iiii", "jjjj", "kkkk", "llll", "mmmm", "nnnn", "oooo", "pppp", "qqqq", "rrrr", "ssss", "tttt", "uuuu", "vvvv", "wwww", "xxxx", "yyyy", "zzzz", "AAAA", "BBBB", "CCCC", "DDDD", "EEEE", "FFFF", "GGGG", "HHHH", "IIII", "JJJJ", "KKKK", "LLLL", "MMMM", "NNNN", "OOOO", "PPPP", "QQQQ", "RRRR", "SSSS", "TTTT", "UUUU", "VVVV", "WWWW", "XXXX", "YYYY", "ZZZZ"],
		identityCity = {
			11: "北京",
			12: "天津",
			13: "河北",
			14: "山西",
			15: "内蒙古",
			21: "辽宁",
			22: "吉林",
			23: "黑龙江 ",
			31: "上海",
			32: "江苏",
			33: "浙江",
			34: "安徽",
			35: "福建",
			36: "江西",
			37: "山东",
			41: "河南",
			42: "湖北 ",
			43: "湖南",
			44: "广东",
			45: "广西",
			46: "海南",
			50: "重庆",
			51: "四川",
			52: "贵州",
			53: "云南",
			54: "西藏 ",
			61: "陕西",
			62: "甘肃",
			63: "青海",
			64: "宁夏",
			65: "新疆",
			71: "台湾",
			81: "香港",
			82: "澳门",
			91: "国外 "
		},
		factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2], //加权因子
		parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2]; //校验位
	//输入验证器
	function InputValidators() {
		this.validators = [];
		this.strategies = {};
	};

	/**
	 * 限制输入框的输入值长度
	 * @param {Object} element
	 * @param {Object} length
	 * @param {Object} type限制类型
	 */
	this.limitInputLength = function(element, length, type) {
		if($.isArray(element)) {
			element = element[0];
		}

		element.addEventListener("input", function() {
			if("number" == type) {
				if(!/^\d+$/.test(this.value.replace(/\D/g, ""))) {
					this.value = /^\d+/.exec(this.value);
				}
			}

			var target = this.value;
			if(target.length > length) {
				this.value = target.substr(0, length);
			}
		});
	};

	//添加验证方法
	//参数:
	//  rule: 验证策略字符串
	//  element: 被验证的dom元素
	//  errMsg: 验证失败时显示的提示信息
	//  value: 被验证的值
	InputValidators.prototype.addValidator = function(rule, element, errMsg, value) {
		var that = this;
		var ruleElements = rule.split(":");
		this.validators.push(function() {
			var strategy = ruleElements.shift();
			var params = ruleElements;
			params.unshift(value);
			params.unshift(errMsg);
			params.unshift(element);
			return that.strategies[strategy].apply(that, params);
		});
	};
	//添加验证策略函数
	//参数:
	//  name: 策略名称
	//  strategy: 策略函数
	InputValidators.prototype.addValidationStrategy = function(name, strategy) {
		this.strategies[name] = strategy;
	};
	//从策略对象导入验证策略函数
	//参数:
	//  strategies: 包含各种策略函数的对象
	InputValidators.prototype.importStrategies = function(strategies) {
		for(var strategyName in strategies) {
			this.addValidationStrategy(strategyName, strategies[strategyName]);
		}
	};
	//验证失败时，将相关的错误信息打包返回
	//参数:
	//  element: dom元素
	//   errMsg: 验证失败时的提示消息
	//    value: 被验证的值
	InputValidators.prototype.buildInvalidObj = function(element, errMsg, value) {
		return {
			'value': value,
			'element': element,
			'errMsg': errMsg
		};
	};
	//开始验证
	InputValidators.prototype.check = function() {
		for(var i = 0, validator; validator = this.validators[i++];) {
			var result = validator();
			if(result) {
				return result;
			}
		}
	};
	//验证策略对象，包含默认的验证策略函数
	var validationStrategies = {
		isNoEmpty: function(element, errMsg, value) {
			if(!value || value == "undefined" || value === "" || value == "\"\"" || value == "\'\'" || value == "null") {
				return this.buildInvalidObj(element, errMsg, value);
			}
		},
		//手机号是否合法
		isValidMobile: function(element, errMsg, value) {
			if(!(mobileTest.test(value))) {
				return this.buildInvalidObj(element, errMsg, value);
			}
		},
		//验证密码长度是否正确
		isErrorLenPwd: function(element, errMsg, value) {
			if(value.length < 8 || value.length > 18) {
				return this.buildInvalidObj(element, errMsg, value);
			}
		},
		//密码是否合法
		isValidPwd: function(element, errMsg, value) {
			if(!(passwordTest.test(value))) {
				return this.buildInvalidObj(element, errMsg, value);
			}
		},
		//验证密码是否过于简单
		isEasyPwd: function(element, errMsg, value) {

			var result = true;
			for(var t = 0; t < blkey.length; t++) {
				if(value.indexOf(blkey[t]) != -1) {
					result = false;
					break;
				}
			}

			if(!result) {
				return this.buildInvalidObj(element, errMsg, value);
			}
		},
		//短信验证码是否合法
		isValidSmsCode: function(element, errMsg, value) {
			if(!(smsCodeTest.test(value))) {
				return this.buildInvalidObj(element, errMsg, value);
			}
		},
		//EMAIL
		isValidEmail: function(element, errMsg, value) {
			if(!(emailTest.test(value))) {
				return this.buildInvalidObj(element, errMsg, value);
			}
		},
		//银行卡
		isValidBankCardNo: function(element, errMsg, value) {
			if(value.length < 16 || value.length > 19) {
				return this.buildInvalidObj(element, errMsg, value);
			}
		},
		//信用卡背三位
		isValidSafeCode: function(element, errMsg, value) {
			if(!(safecodeTest.test(value))) {
				return this.buildInvalidObj(element, errMsg, value);
			}
		},
		//姓名
		isValidName: function(element, errMsg, value) {
			if(!(nameTest.test(value))) {
				return this.buildInvalidObj(element, errMsg, value);
			}
		},
		//身份证
		isValidIdentityCode: function(element, errMsg, value) {

			var pass = true;
			if(value.length == 15) {
				value = value.substring(0, 6) + "19" + value.substring(6, 15);
				var ovalue = value.split('');
				var osum = 0;
				for(var i = 0; i < 17; i++) {
					osum += ovalue[i] * factor[i];
				}
				value = value + (parity[osum % 11]).toString();
			}
			if(!value || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(value)) {
				pass = false; // 身份证号格式错误
			} else if(!identityCity[value.substr(0, 2)]) {
				pass = false; // 地址编码错误
			} else {
				//18位身份证需要验证最后一位校验位
				if(value.length == 18) {
					value = value.split('');
					var sum = 0;
					for(var i = 0; i < 17; i++) {
						sum += value[i] * factor[i];
					}
					if(parity[sum % 11] != value[17]) {
						pass = false; // 校验位错误
					}
				}
			}
			if(!pass) {
				return this.buildInvalidObj(element, errMsg, value);
			}

		},
		//捷顺通卡
		isJstCardCode: function(element, errMsg, value) {
			var pass = false;
			var codekey = value.substr(0, 6);
			var codelength = value.replace(/\D/g, "").length;
			if(codekey == "880755" && codelength == 19) {
				pass = true;
			}
			if(!pass) {
				return this.buildInvalidObj(element, errMsg, value);
			}
		},
	};

	this.getInputValidators = function() {
		var validators = new InputValidators();
		validators.importStrategies(validationStrategies);
		return validators;
	};

	return this;

})(mui);