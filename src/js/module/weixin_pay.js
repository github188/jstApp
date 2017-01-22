/**
 * 微信支付
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = (function($) {
	require("./window_expansion");
	require("./http_client");
	var returnResult = {},
		stringUtil = require("./string_util"),
		constant = require("./constant");

	// 微信签名数据
	returnResult.wxsigndata = {};
	// 支付交易流水号			
	// 微信js api支付
	returnResult.onBridgeReady = function() {

		WeixinJSBridge.invoke(
			'getBrandWCPayRequest', {
				"appId": returnResult.wxsigndata.appId,
				"timeStamp": returnResult.wxsigndata.timeStamp,
				"nonceStr": returnResult.wxsigndata.nonceStr,
				"package": returnResult.wxsigndata.package1,
				"signType": returnResult.wxsigndata.signType,
				"paySign": returnResult.wxsigndata.paySign
			},
			function(res) {
				if(res.err_msg == "get_brand_wcpay_request:ok") {
					returnResult.paySuccessCallBack && returnResult.paySuccessCallBack(returnResult.responseData);
				} else if(res.err_msg == "get_brand_wcpay_request:cancel") {
					if(returnResult.payCancel) {
						returnResult.payCancel(returnResult.orderNo);
					} else {
						$.toast('用户取消支付');
					}

				} else if(res.err_msg == "get_brand_wcpay_request:fail") {
					returnResult.payFailCallBack && returnResult.payFailCallBack(res.err_msg);
				};
			}
		);
	};

	/**
	 * 成功回调
	 * @param {Object} result
	 */
	returnResult.paySuccess = function(result) {
		var doneCode = result.resType;
		var mess = result.msg;
		returnResult.responseData = result;
		if(doneCode == "00") {
			returnResult.wxsigndata = result; // 支付签名数据

			returnResult.wxPwdPanelShowedCallback && returnResult.wxPwdPanelShowedCallback(returnResult.responseData);

			// 微信JS API支付
			if(typeof WeixinJSBridge == "undefined") {
				if(document.addEventListener) {
					document.addEventListener('WeixinJSBridgeReady', returnResult.onBridgeReady, false);
				} else if(document.attachEvent) {
					document.attachEvent('WeixinJSBridgeReady', returnResult.onBridgeReady);
					document.attachEvent('onWeixinJSBridgeReady', returnResult.onBridgeReady);
				}
			} else {
				returnResult.onBridgeReady();
			}
		} else {

			if(returnResult.payFailCallBack) {
				returnResult.payFailCallBack(returnResult.responseData);
			} else {
				$.toast(mess);
			}
		}
	};

	/**
	 * 支付失败回调
	 */
	returnResult.payFail = function() {

		if(returnResult.payFailCallBack) {
			returnResult.payFailCallBack();
		} else {
			$.toast("支付遇到问题,请重试");
		}

	};

	//API
	/**
	 * 发起微信支付
	 * @param {Object} method:支付接口.DO
	 * @param {Object} params:请求参数
	 * @param {Object} paySuccess:支付成功回调
	 * @param {Object} payFail:支付失败回调
	 * @param {Object} payCancel:中断支付回调
	 * @param {Object} wxPwdPanelShowedCallback:微信密码输入框调起来后回调
	 */
	returnResult.pay = function(options) {

		var options = options || {},
			method = options.method,
			params = options.params;

		if(stringUtil.isEmpty(method)) {
			$.toast("请求URL为空");
			return;
		}

		returnResult.paySuccessCallBack = options.paySuccess;
		returnResult.payFailCallBack = options.payFail;
		returnResult.payCancel = options.payCancel;
		returnResult.wxPwdPanelShowedCallback = options.wxPwdPanelShowedCallback;
		postData(method, params, returnResult.paySuccess, true, true, returnResult.payFail);
	};

	return returnResult;
})(mui);