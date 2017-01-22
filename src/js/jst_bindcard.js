/**
 *jst 绑卡
 * version:1.0.1
 * created by aj/chengjun.zhu@jieshunpay.cn
 * 1.app前置绑卡接口

http://10.101.130.224:8085/app/rest/bindCard?cardNo=8807550010000033749&password=033749&userId=

2.app前置充值接口

http://10.101.130.224:8085/app/rest/jstrecharge?cardNo=8807550010000033749&totalFee=1&notifyUrl=
 */
require("./module/public_module");
(function($) {
	var cardNoEle = $("#cardNo"), //捷顺通卡号
		cardPwdEle = $("#cardPwd"), //卡密码
		cardNoErrorTipsEle = $("#cardNoErrorTips"), //卡号输入错误提示
		confirmBtnEle = $("#confirmBtn"), //确认
		unknowPwdEle = $("#unknowPwd"), //忘记密码了
		checked = {
			num: false,
			pwd: false
		},

		userid = login.getUserId(true),

		userOpenId = "", //记录openId
		data = {},
		bindSuccess = false, //是否绑定成功了

		///////////入参
		isadd = requestURL.getParameter("isadd"), //1表示未绑定过卡
		fromPageId = requestURL.getParameter("fromPageId"),
		main = {
			//初始化
			init: function() {
				var self = this;
				self.bindEvent();
			},

			//事件监听
			bindEvent: function() {

				//卡号输入事件
				cardNoEle.bind("input", function() {
					var rule = /^[0-9]*$/;
					var numLen = $(this).val().length;
					var numVal = $(this).val();
					var val = "";
					for(var i = 0; i < numLen; i++) {
						if(rule.test(numVal[i])) {
							if(i >= 19) {
								val = val.substring(0, 19);
							} else {
								val = val.concat(numVal[i]);
							}
						}
					}
					if(numLen >= 6) {
						if(val.substring(0, 6) != "880755") {
							cardNoErrorTipsEle.html("请输入正确的卡号");
						} else {
							cardNoErrorTipsEle.html("");
							if(numLen >= 19) {
								checked.num = true;
							} else {
								checked.num = false;
							}
						}
					}
					if(numLen <= 0) {
						cardNoErrorTipsEle.html("");
					}
					$(this).val(val);
					$(".card-num").html(val);
					if(checked.num && checked.pwd) {
						confirmBtnEle.addClass("btnOn");
					} else {
						confirmBtnEle.removeClass("btnOn");
					}
				});

				//密码输入
				cardPwdEle.bind("input", function() {
					if($(this).val().length >= 6) {
						$(this).val($(this).val().substring(0, 6));
						checked.pwd = true;
					} else {
						checked.pwd = false;
					}

					if(checked.num && checked.pwd) {
						confirmBtnEle.addClass("btnOn");
					} else {
						confirmBtnEle.removeClass("btnOn");
					}
				});

				//不知道卡密码
				unknowPwdEle.bind("tap", function() {
					$.confirm($("#forgetPwdConfirm").html(), "捷顺通卡卡密码", ["知道了"], null, 'div');
				});

				//确定按钮点击事件
				confirmBtnEle.bind("tap", function() {
					if($(this).hasClass("btnOn")) {
						main.sendMes();
					}
				});

				$.back = function() {
					if($.os.plus) {

						$.plusReady(function() {

							if("1" == isadd && !bindSuccess) {
								//首次绑卡，如果没有成功，就关闭卡管理页面，直接回到首页
								$.fire(require("./module/webview_opr").getLaunchWebview(), "changeTab", {
									toIndex: 1
								});
							} else {
								//刷新卡管理页面
								$.fire(plus.webview.getWebviewById(fromPageId), "bindSuccess");
							}
							plus.webview.currentWebview().close();
						});
					} else {
						winExp.back();
					}
				};
			},
			//发送请求
			sendMes: function() {
				var requestParam = {
					userId: userid,
					cardCode: cardNoEle.val(), //卡号
					password: cardPwdEle.val() //密码
				}
				postData("app/rest/bindCard", requestParam, function(data) {
					var data = data;
					if(data.resType == "00") {
						bindSuccess = true;
						$.toast("绑卡成功");

						$.back();
					} else {
						$.toast(data.msgContent);
					}

				});
			}
		};
	main.init();

})(mui);