/**
 * 账户主页
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./module/public_module");
(function($) {

	var balanceEle = $("#balance"), //我的余额显示
		mobileEle = $("#mobile"), //手机号显示
		loginBtnEle = $("#loginBtn"), //登录铵钮
		rechargeEle = $("#recharge"),
		withdrawEle = $("#withdraw"),
		unloginElements = $('.mui-content .unlogin'), //未登录时显示为灰的元素
		userid = login.getUserId(false),

		payPassword = require("./module/pay_password"),
		main = {
			//初始化执行
			init: function() {

				require("./module/footer").init();

				$.init({
					swipeBack: false //关闭右滑关闭功能
				});

				var self = this;
				self.bindEvent();

				if(login.isLogin()) {
					unloginElements.removeClass("unlogin");
					self.getUserInfoData();
				}

			},

			//获取用户基本数据
			getUserInfoData: function() {
				login.updateUserInfo(userid, function(res) {
					main.getBalanceData(res.acctId);
					mobileEle.html(stringUtil.infoProtectDeal({
						targetStr: res.mobile,
						keepStart: 3,
						keepEnd: 4
					}));
				});
			},
			/**
			 * 获取余额等信息
			 * @param {Object} acctId:用户ID
			 */
			getBalanceData: function(acctId) {
				if(!stringUtil.isEmpty(acctId)) {

					postData("app/rest/getAccountInfo", {
						"acctMarkNo": acctId
					}, function(data) {
						if(data.resType == "00") {
							balanceEle.html((data.balance / 100).toFixed(2));
							unloginElements.removeClass("unlogin");
						} else {
							$.toast(data.msgContent);
						}
					}, null, {
						requestType: "get"
					});
				}
			},

			/**
			 * 退出登录了
			 */
			logout: function() {
				unloginElements.addClass("unlogin");
				balanceEle.html("0.00");
				mobileEle.html("暂无数据");
			},

			//绑定事件监听
			bindEvent: function() {
				var self = this;

				$(".page-href").bind("tap", function() {

					if(!login.isLogin()) {
						login.gotoLogin(true);
						return false;
					}

					var href = $(this).data("href"),
						param = {};
					if(!stringUtil.isEmpty(href)) {
						if(!stringUtil.isURL(href)) {
							href = constant.rootPath + href;
						}
						if($.os.plus) {
							param.fromPageId = plus.webview.currentWebview().id;
						}
						openWindow(href, href, param);
					}
				});

				/**
				 * 充值，提现跳转
				 * @param {Object} type：1充值，2提现
				 */
				var gotoPage = function(type) {

					if(!login.isLogin()) {
						login.gotoLogin(true);
						return false;
					}

					if(login.getLoginInfo().certification == 0) {

						$.toast("请先绑定银行卡");

						setTimeout(function() {

							var href = constant.rootPath + '/page/account/account_bindcard.html',
								param = {
									bindType: 1,
									toPage: 1 == type ? "recharge" : "withdraw",
									fromPage: "account"
								},
								gotoBindPage = function() {
									openWindow(href, href, param);
								};
							if($.os.plus) {

								//APP环境需传当前WEBVIEWID
								$.plusReady(function() {
									param.fromPageId = plus.webview.currentWebview().id;
									gotoBindPage();
								});
							} else {
								gotoBindPage();
							}

						}, 1000);

					} else if(login.getLoginInfo().isPaypwd == 0) {

						$.toast("您未设置支付密码，为了账户安全，请先设置支付密码");

						payPassword.setPayPwd({
							userId: userid
						});
					} else {
						var href = constant.rootPath + "/page/account/" + (1 == type ? "account_recharge.html" : "account_withdraw.html");
						openWindow(href);
					}
				};

				//充值
				rechargeEle.bind("tap", function() {
					gotoPage(1);
				});

				//提现
				withdrawEle.bind("tap", function() {
					gotoPage(2);
				});

				/**
				 * 登录
				 */
				loginBtnEle.bind("tap", function() {
					login.gotoLogin(true);
				});

				//WEBVIEW自定义事件------------------------Begin---------------------------

				//登录成功之后刷新数据
				window.addEventListener('refreshData', function(event) {
					console.log(plus.webview.currentWebview().id + " refreshData--event");
					userid = login.getUserId(false);
					unloginElements.removeClass("unlogin");
					self.getUserInfoData();
				});

				//退出登录了
				window.addEventListener('logout', function(event) {
					console.log(plus.webview.currentWebview().id + " logout--event");
					self.logout();
				});

				//WEBVIEW自定义事件------------------------End---------------------------

			}
		};
	main.init();

})(mui);
//end