/**
 * HTTP请求操作
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = (function($) {
	var returnResult = {},
		stringUtil = require("./string_util"),
		constant = require("./constant");

	require("./window_expansion");

	/**
	 * 创建公共请求参数
	 * @param {Object} pdata
	 */
	returnResult.createCommonParam = function(pdata) {
		var newPdata = {};

		var token = pdata.token || local.getItem("token"),
			userId = pdata.userId || login.getUserId(false),
			terminalType = pdata.terminalType || ($.os.ios || $.os.android) ? "M" : "P";

		if(!stringUtil.isEmpty(token)) {
			newPdata.token = token;
		}

		if(!stringUtil.isEmpty(userId)) {
			newPdata.userId = userId;
		}

		if(!stringUtil.isEmpty(terminalType)) {
			newPdata.terminalType = terminalType;
		}

		for(var p in pdata) {
			if(typeof(pdata[p]) !== "function") {
				var key = p,
					value = pdata[p];

				if(!stringUtil.isEmpty(value)) {
					newPdata[key] = value;
				}

			}
		}
		return newPdata;
	};

	/**
	 * 
	 * @param {Object} method:xxxxxx.do或http://xxx.xxx.xxx/xxx.do
	 * @param {Object} pdata:传参jsonobject
	 * @param {Object} success:请求成功回调方法名
	 * @param {Object} fail:请求失败回调方法名
	 * @param {Object} _options
	 */
	window.postData = function(method, pdata, success, fail, options) {

		if(stringUtil.isEmpty(method)) {
			$.toast("请求URL为空");
			return;
		}

		var _options = $.extend({
				showWait: true, //是否显示等待框,默认显示
				errorToast: true, //是否弹出错误提示,默认弹出
				timeout: 60000, //单位MS
				requestType: "post",
				dataType: "json",
				localResource: false,
				autoUpdateToken: 0, //是否自动更新TOKEN，0表示更新
				autoLogin: 0 //是否自动跳转至登录页,默认0表示跳转
			}, options),
			logRandomId = stringUtil.randomString(32),
			requestHttpUrl = "";

		if(_options.localResource) {
			//请求本地资源
			requestHttpUrl = method.indexOf(constant.base) != -1 ? method : constant.base.concat(method);
		} else {
			if(stringUtil.isURL(method)) {
				requestHttpUrl = method;
			} else {
				if(method.indexOf("jst-finance-cashdeskfront") != -1) {
					//请求收银台前置系统
					requestHttpUrl = constant.payBeforeHttpServer.concat(method);
				} else {
					//暂定默认请求APP前置系统
					requestHttpUrl = constant.httpServer.concat(method);
				}
			}
		}

		_options.showWait && showWaiting();
		var newParam = returnResult.createCommonParam(pdata);
		var successFunc = function(response, success) {

			//服务器返回响应，根据响应结果
			//			console.log(logRandomId + "--result-->" + JSON.stringify(response));

			if(response && $.isFunction(success)) {
				_options.showWait && closeWaiting();

				//统一处理TOKEN是否有效
				if(requestHttpUrl.indexOf("app/rest/member/login") == -1 && ("09" == response.resType || "08" == response.resType)) {

					var updateTokenfail = function() {
						if(0 == _options.autoLogin) {
							login.logout(true);
						}
						$.isFunction(fail) && fail();
					};

					if(_options.autoUpdateToken != 0) {
						updateTokenfail();
					} else {
						//TOKEN不对，检查是否登录了，如果登录了则更新TOKEN
						returnResult.updateToken(function(token) {
							//更新TOKEN成功了，重新发送请求

							pdata.token = token;

							postData(method, pdata, success, fail, options);
						}, function() {
							//更新TOKEN失败了，跳至登录页
							updateTokenfail();
						});
					}

					return;
				}

				if($.isFunction(success)) {
					success(response);
				} else {
					//					console.log(logRandomId + "--未设置成功回调函数");
				}

			} else {
				_options.errorToast && $.toast("加载数据出错,请重试");
				$.isFunction(fail) && fail();
				closeWaiting();
			}

		};
		var failFunc = function(fail, xhr, type, errorThrown) {
			//异常处理；
			//			console.log(logRandomId + "--result--> xhr: " + xhr + ",type: " + type + ",errorThrown: " + errorThrown);
			closeWaiting();
			$.isFunction(fail) && fail();
			//			if("abort" == type) {
			//				//用户中止了AJAX请求
			//				return;
			//			}

			_options.errorToast && $.toast("网络错误,请检查网络");

		};

		//		console.log(logRandomId + "--reuqest-->url: " + requestHttpUrl + ",param: " + JSON.stringify(newParam));
		$.ajax(requestHttpUrl, {
			//			xhrFields: {
			//				withCredentials: true //发送凭证请求（HTTP Cookies和验证信息）
			//			},
			//				headers: $.os.plus ? headers : null,
			data: newParam,
			dataType: _options.dataType, //服务器返回json格式数据
			type: _options.requestType, //HTTP请求类型
			timeout: _options.timeout, //超时时间
			success: function(data) {
				successFunc(data, success);
			},
			error: function(xhr, type, errorThrown) {
				failFunc(fail, xhr, type, errorThrown);
			}
		});

	};

	/**
	 * 更新TOKEN
	 * @param {Object} successCallback：成功回调
	 * @param {Object} failCallback:失败回调
	 */
	returnResult.updateToken = function(successCallback, failCallback) {
		var loginParameter = login.getLoginParameter("loginParameter");
		if(!login.isLogin() || !loginParameter) {
			//如果没有获取到登录信息，则直接失败
			failCallback && failCallback();
			return;
		}

		postData("app/rest/member/login", {
			mobile: loginParameter.userName,
			password: loginParameter.pwd
		}, function(data) {
			var token = data.token || "";
			if(data.resType == "00" && !stringUtil.isEmpty(token)) {

				login.setUserId(data.userId); // 记录用户账号(手机号码)，作为登录凭证
				local.setItem("token", token);
				successCallback && successCallback(token);

			} else {
				failCallback && failCallback();
			}

		}, function() {
			failCallback && failCallback();
		});
	};

	return returnResult;
})(mui);