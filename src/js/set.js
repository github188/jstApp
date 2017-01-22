/**
 * 设置
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./module/public_module");
(function($) {
	var viewApi, view, fromPageId, payPassword = require("./module/pay_password"),
		userId = login.getUserId(true),
		main = {
			//初始化执行
			init: function() {
				var self = this;

				self.initView();

				$.init();
				//初始化单页view
				viewApi = $('#app').view({
					defaultPage: "#setMainView"
				});
				view = viewApi.view;

				self.bindEvent();
			},

			initView: function() {

				// 显示修改/重置支付密码入口
				if(login.getLoginInfo() && login.getLoginInfo().isPaypwd == 1 && login.getLoginInfo().certification >= 1) {
					$("#resetpayPwdCell").removeClass("mui-hidden");
				}

				$.plusReady(function() {
					fromPageId = plus.webview.currentWebview().fromPageId;
				});
			},

			//绑定事件监听
			bindEvent: function() {
				var self = this;

				//处理view的后退与webview后退
				var oldBack = $.back;
				$.back = function() {
					if(viewApi.canBack()) { //如果view可以后退，则执行view的后退
						viewApi.back();
					} else { //执行webview后退
						oldBack();
					}
				};

				$(".page-href").bind("tap", function() {
					var href = $(this).data("href");
					if(!stringUtil.isEmpty(href)) {
						if(!stringUtil.isURL(href)) {
							href = constant.rootPath + href;
						}
						openWindow(href);
					}
				});

				/**
				 * 修改支付密码
				 */
				$("#updatePayPwd").bind("tap", function() {

					//验证密码后，输入新密码
					var updatePwd = function(oldPwd) {
						payPassword.updatePwd({
							userId: userId,
							headerTitle: "设置支付密码",
							oldPwd: oldPwd,
							successCallback: function() {
								$.toast("修改支付密码成功");
							}
						});
					};

					//验证支付密码
					payPassword.validatePwd({
						userId: userId,
						showForgetPwd: false,
						headerTitle: "记得支付密码",
						inputTitle: "请输入原密码",
						successCallback: updatePwd
					});

				});

				/**
				 * 重置支付密码
				 */
				$("#resetPayPwd").bind("tap", function() {
					var href = constant.rootPath + "/page/account/forget_pay_pwd.html";
					openWindow(href);
				});

				/**
				 * 退出登录
				 */
				$(".logout").bind("tap", function() {

					login.logout();

					var href = constant.rootPath + "/page/home/login.html";
					openWindow(href, href, {
						"isFromSetting": "Y"
					});

					if($.os.plus) {
						//APP环境下，要关闭设置WEBVIEW
						var currentWeb = plus.webview.currentWebview();
						setTimeout(function() {
							currentWeb.close("none")
						}, constant.duration + 200);

						//通知个人中心页，已经退出登录了
						$.fire(plus.webview.getWebviewById(fromPageId), "logout");
					}
				});

			}
		};
	main.init();

})(mui);
//end