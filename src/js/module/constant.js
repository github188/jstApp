/**
 * 常量定义
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = (function($) {

	// 提示消息汇总
	window.APPwarn = {
		"mobile": {
			"none": "请输入手机号码",
			"err": "请输入正确的手机号码"
		},
		"checkcode": {
			"none": "请输入短信验证码",
			"times": "验证码错误次数超过限制，请重新申请",
			"err": "验证码错误，请核实后重试"
		},
		"password": {
			"none": "请输入密码",
			"len": "登录密码不能少于8位，请重新输入",
			"req": "密码必须包含字数字和字母，请重新输入",
			"easy": "密码过于简单",
			"nlen": "新登录密码不能少于8位，请重新输入",
			"nreq": "新密码必须包含字数字和字母，请重新输入",
			"neasy": "新密码过于简单",
			"oerr": "原登录密码错误",
		},
		"paypassword": {
			"none": "请输入支付密码",
			"same": "两次密码输入不一致，请重新输入",
			"err": "支付密码必须是6位数字"
		},
		"bankcard": {
			"none": "请输入银行卡号",
			"err": "请输入正确的银行卡号码",
		},
		"name": {
			"none": "请输入持卡人姓名",
			"err": "请输入正确的持卡人姓名"
		},
		"ident": {
			"none": "请输入证件号码",
			"err": "请输入正确的证件号码"
		},
		"carddate": {
			"none": "请选择信用卡有效期",
		},
		"safecode": {
			"none": "请输入卡背面末三位数字",
			"err": "请输入正确的信用卡安全码"
		}
	};

	var returnResult = {},
		pathName = window.document.location.pathname,
		protocolText = location.protocol + "//";
	returnResult.rootPath = pathName.substring(0, pathName.substr(1).indexOf('/page/') + 1);
	returnResult.base = protocolText + location.host + returnResult.rootPath + "/";

	returnResult.imgSpacename = ''; //图片空间
	returnResult.deceleration = $.os.ios ? 0.0015 : 0.00045; //上下拉阻尼系数0.003:0.0009

	//APP接口请求地址====TEST:http://10.101.130.8:8082/------DEV:http://10.101.130.212:18085/------Production:http://123.58.60.66:18091/
	returnResult.httpServer = "http://10.101.130.8:8082/";

	//收银台前置接口请求地址====TEST:http://10.101.130.8:8910/------DEV:http://10.101.130.30:18090/------Production:http://123.58.60.66:18090/
	returnResult.payBeforeHttpServer = "http://10.101.130.8:8910/";

	//商户DEMO接口请求地址====TEST:http://10.101.130.8:8911/------DEV:http://10.101.130.30:18090/------Production:http://123.58.60.66:18092/
	returnResult.cashCenterHttpServer = "http://10.101.130.8:8911/";

	returnResult.duration = $.os.ios ? 200 : 350; //Webview窗口动画的持续时间

	returnResult.moneySymbol = "¥"; //人民币符号
	return returnResult;
})(mui);