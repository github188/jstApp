/**
 * 登录信息设置获取
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = (function($) {
	var returnResult = {},
		stringUtil = require("./string_util"),
		local = require("./localStorage");

	/**
	 * 跳转至登录页面
	 * @param {Object} goLogin:没有登录的情况是否跳转至登录页,true为跳
	 */
	returnResult.gotoLogin = function(goLogin, webviewParam) {
		if(goLogin) {
			//缓存里没有登录信息，跳转至登录页面

			var href = constant.rootPath + '/page/home/login.html',
				param = webviewParam || {},
				gotoLoginPage = function() {
					openWindow(href, href, param, null, {
						aniShow: "slide-in-bottom",
						duration: constant.duration
					});
				};

			if($.os.plus) {

				//APP环境需传当前WEBVIEWID到登录页，登录成功之后再刷新本页，查询余额等
				$.plusReady(function() {
					param.fromPageId = plus.webview.currentWebview().id;
					gotoLoginPage();
				});
			} else {
				gotoLoginPage();
			}
			return;
		}
	};
	/**
	 * 登陆验证
	 * uid用户编号，successdo验证成功后返回新的用户信息
	 */
	returnResult.updateUserInfo = function(uid, successdo) {

		uid = uid || login.getUserId(false);

		if(stringUtil.isEmpty(uid)) {
			return;
		}

		postData("app/rest/getMemberInfo", {
			"usrLgName": uid
		}, function(data) {
			if(data.resType == "00") {
				var usrObj = data.selUsersInfoListBeans[0];

				successdo && successdo(usrObj);

				login.setLoginInfo(usrObj);
			}

		}, null, {
			requestType: "get"
		});

	};

	/**
	 * 保存登录用户ID
	 */
	returnResult.setUserId = function(userid) {

		if(!stringUtil.isEmpty(userid)) {

			local.setItem("userId", userid);

			//			sessionStorage.UserId = userid;
		}

	};

	/**
	 * 获取登录用户ID
	 * @param {Object} goLogin:没有登录的情况是否跳转至登录页,true为跳
	 */
	returnResult.getUserId = function(goLogin) {

		var userid = local.getItem("userId");
		if(stringUtil.isEmpty(userid)) {
			returnResult.gotoLogin(goLogin);
			return null;
		}
		return userid;
	};

	/**
	 * 保存登录信息
	 * @param {Object} loginJson
	 */
	returnResult.setLoginInfo = function(loginJson) {

		if(!stringUtil.isEmpty(loginJson)) {

			local.setItem("userInfo", JSON.stringify(loginJson));

			//			sessionStorage.accuserinfo = JSON.stringify(loginJson);
		}

	};

	/**
	 * 获取登录信息
	 * @param {Object} goLogin:没有登录的情况是否跳转至登录页,true为跳
	 */
	returnResult.getLoginInfo = function(goLogin) {
		var returnInfo = local.getItem("userInfo");

		if(stringUtil.isEmpty(returnInfo)) {
			returnResult.gotoLogin(goLogin);
			return null;
		}

		return JSON.parse(returnInfo);

	};

	/**
	 * 保存登录用户用户名和密码，为了更新TOKEN,用户密码其实不能保存至本地，留下了安全隐患，不得已而为之
	 * @param {Object} userName:用户名
	 * @param {Object} pwd：密码
	 */
	returnResult.setLoginParameter = function(userName, pwd) {

		if(stringUtil.isEmpty(userName)) {
			return;
		}

		var loginParameter = {
			userName: userName,
			pwd: pwd
		};

		local.setItem("loginParameter", JSON.stringify(loginParameter));

	};

	/**
	 * 获取登录用户用户名和密码
	 */
	returnResult.getLoginParameter = function() {
		var returnInfo = local.getItem("loginParameter");

		if(stringUtil.isEmpty(returnInfo)) {
			return null;
		}

		return JSON.parse(returnInfo);

	};

	/**
	 * 判断是否已经登录
	 * 如果没有登录返回false
	 */
	returnResult.isLogin = function() {
		return !stringUtil.isEmpty(returnResult.getUserId())
	};

	/**
	 * 退出登录
	 */
	returnResult.logout = function(goLogin) {

		postData("app/rest/member/loginOut", {}, function() {}, null, {
			showWait: false,
			errorToast: false
		});

		local.clear();

		//		if($.os.plus) {
		//
		//			$.plusReady(function() {
		//				plus.oauth.getServices(function(services) {
		//					for(var i in services) {
		//						var service = services[i];
		//						//微信
		//						if(service.id == "weixin") {
		//							service.logout(function(event) {});
		//							break;
		//						}
		//					}
		//				}, function(e) {});
		//			});
		//		}

		//设置手动退出标识
		local.setItem("manualLogin", 1);

		//通知首页退出登录了
		$.plusReady(function() {
			$.fire(require("./webview_opr").getLaunchWebview(), "logout");
		});

		if(goLogin) {
			var href = constant.rootPath + "/page/home/login.html";
			openWindow(href);
			return;
		}
	};

	return returnResult;
})(mui);