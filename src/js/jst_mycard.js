/**
 *jst 卡管理
 * version:1.0.1
 * created by aj/chengjun.zhu@jieshunpay.cn
 */
require("./module/public_module");
(function($) {

	var usercode = "",
		userOpenId = "ohd71t450Rm7ghVY-NryPGa-ve9A",
		resultData = [], //存放卡列表信息
		asMain = "", //记录触发设置主卡的元素
		operType = "", //操作类型
		change = "", //记录正常卡的class名
		keyBoradPwd = require("./module/keyboard_pwd"),
		popupPayPassword = require("./module/popup_pay_password"),
		userId = login.getUserId(true),
		cardState = "00", //卡状态
		btnArray = [],
		mes = "",
		title = " ",
		main = {
			//初始化
			init: function() {
				var self = this;
				self.swipe();
				self.getCardList();
				self.bindEvent();
				popupPayPassword.init({
					headerTitle: "捷顺通卡密码",
					inputTitle: "请输入捷顺通卡密码",
					showForgetPwd: false,
					inputCompleteClose: true,
					doneCallback: self.inputPwdComplete
				});

			},
			//轮播图
			swipe: function() {
				document.querySelector('.mui-slider').addEventListener('slide', function(e) {
					asMain = e.detail.slideNumber + 1;
					usercode = resultData[asMain - 1].bankCardCode;
					if($(".card-list").eq(asMain).hasClass("gs-list") || $(".card-list").eq(asMain).hasClass("yc-list")) {
						//						$(".acc-btn").addClass("acc-ycbtn");
						//						$("#loss").addClass("ds-none");
						//						$("#reset").addClass("ds-none");
					} else {
						//						$(".acc-btn").removeClass("acc-ycbtn");
						//						$("#loss").removeClass("ds-none");
						//						$("#reset").removeClass("ds-none");
					}
					main.checkBalance();
				});
			},
			//获取卡列表
			getCardList: function() {
				var dataParem = {
						"userId": userId
					},
					href = "",
					html1 = "",
					html2 = "",
					listHtml = "",
					navHtml = "",
					state = { //记录不同状态卡的效果
						cardBg: "", //卡背景
						setMain: "", //设为主卡
						billColor: "", //账单按钮颜色
						stateLogo: "", //状态标志
					};
				postData("app/rest/userBindBkCards", dataParem, function(data) {
					if(data.resType == "00") {

						//获取列表成功
						var cardList = data.bindBkCardList,
							cardListLen = (cardList && cardList.length) || 0,
							hasBindFlag = false, //是否绑定了捷顺通卡
							jstCardList = new Array();

						//有绑卡
						for(var i = 0; i < cardListLen; i++) {
							if(cardList[i].bankCardType == "04") {
								hasBindFlag = true;
								jstCardList.push(cardList[i]);
							}
						}

						if(hasBindFlag) {
							resultData = jstCardList;
							//有绑多张捷顺通卡
							var count = 1;

							for(var j = 0; j < jstCardList.length; j++) {

								var cardNoText = stringUtil.infoProtectDeal({
									targetStr: jstCardList[j].bankCardCode,
									keepEnd: 4,
									cipherLen: 9
								});

								if(jstCardList.length == 1) {
									//只有绑一张捷顺通卡
									$("#oneCard").removeClass("mui-hidden").find(".one-num").html('****** '.concat(cardNoText));
									$("#slider").addClass("mui-hidden"); //隐藏轮播
								} else {

									if(count == 1) {
										state.cardBg = "zc-list1";
									} else if(count == 2) {
										state.cardBg = "zc-list2";
										count = 0;
									}
									//绑定了多张卡 
									listHtml += '<div class="mui-slider-item"><div class="card-list {{cardBg}}"><div class="card-num">****** {{cardNoText}}</div><div class="card-state {{stateLogo}}"></div><div class="card-bill {{billColor}}">账单></div></div></div>'
										.replace("{{cardBg}}", state.cardBg)
										.replace("{{cardNoText}}", cardNoText)
										.replace("{{stateLogo}}", state.stateLogo)
										.replace("{{billColor}}", state.billColor);

									//轮播的第一张和最后一张，为了循环
									var duplicateHtml = '<div class="mui-slider-item mui-slider-item-duplicat"><div class="card-list {{cardBg}}"><div class="card-num">****** {{cardNoText}}</div><div class="card-state {{stateLogo}}"></div><div class="card-bill {{billColor}}">账单></div></div></div>'
										.replace("{{cardBg}}", state.cardBg)
										.replace("{{cardNoText}}", cardNoText)
										.replace("{{stateLogo}}", state.stateLogo)
										.replace("{{billColor}}", state.billColor);

									if(j == jstCardList.length - 1) {
										html1 = duplicateHtml;

									} else if(j == 0) {
										html2 = duplicateHtml;
									}

									if(j == 0) {
										navHtml = '<div class="mui-indicator mui-active"></div>'
									} else {
										navHtml += '<div class="mui-indicator"></div>'
									}
									count++;

									$("#oneCard").addClass("mui-hidden");
								}

							}

							listHtml = html1 + listHtml + html2;
							$("#slider").find(".mui-slider-group").html(listHtml);
							$("#slider").find(".mui-slider-indicator").html(navHtml);

							usercode = jstCardList[0].bankCardCode;
							main.checkBalance();
						} else {

							var _confirm = function() { //没绑捷顺通卡
								$.confirm("您尚未绑定捷顺通卡", "提示", ["绑卡", "取消"], function(e) {
									if(e.index == 1) {
										$.back();
									} else {

										var href = constant.rootPath + '/page/jst/jst_bindcard.html',
											param = {
												isadd: 1
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
									}
								});
							};

							if($.os.plus) {
								$.plusReady(_confirm);
							} else {
								_confirm();
							}

						}

					} else { //获取列表失败
						$.toast("卡列表获取失败");
					}

				});
			},
			//查询余额
			checkBalance: function() {
				var url = "app/rest/balancejstCard",
					dataParams = {
						cardCode: usercode
					};
				postData(url, dataParams, function(data) {
					if(data.errCode == "0000") {
						$("#acctBal").html(data.data.acctBal / 100);
					}

				}, null, {
					requestType: "GET"
				});
			},
			//事件绑定
			bindEvent: function() {

				var self = this;

				//充值按钮事件
				$(".acc-btn").bind("tap", function() {
					if($(this).hasClass("acc-ycbtn")) {
						return;
					} else {
						var href = constant.rootPath + "/page/jst/jst_cardrecharge.html?card=" + usercode + "&state=" + cardState;
						openWindow(href);
					}
				});
				//解绑事件
				$("#unbind").bind("tap", function() {
					operType = "unbind";
					main.alertBox();
				});
				//挂失事件
				$("#loss").bind("tap", function() {
					operType = "loss";
					main.alertBox();
				});
				//重置密码事件
				$("#reset").bind("tap", function() {
					operType = "reset";
				});
				//绑卡按钮事件
				$(".bindcard").bind("tap", function() {

					var href = constant.rootPath + '/page/jst/jst_bindcard.html',
						param = {},
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
				})

				//WEBVIEW自定义事件------------------------Begin---------------------------

				//绑定成功了，刷新列表
				window.addEventListener('bindSuccess', function(event) {

					console.log(plus.webview.currentWebview().id + " bindSuccess--event " + JSON.stringify(event.detail));

					self.getCardList();
				});

				//WEBVIEW自定义事件------------------------End---------------------------
			},
			//设为主卡成功操作
			toMainOper: function() {
				var len = $(".card-list").length;
				$(".as-main").eq(asMain).addClass("ds-none");
				$(".card-list").eq(asMain).addClass("zc-main");
				$(".card-state").eq(asMain).addClass("state-main");
				if(asMain == 1) {
					$(".as-main").eq(len - 1).addClass("ds-none");
					$(".card-list").eq(len - 1).addClass("zc-main");
					$(".card-state").eq(len - 1).addClass("state-main");
				} else if(asMain == len - 2) {
					$(".as-main").eq(0).addClass("ds-none");
					$(".card-list").eq(0).addClass("zc-main");
					$(".card-state").eq(0).addClass("state-main");
				}
				for(var i = 0; i < len; i++) {
					if($(".card-list").eq(i).hasClass("zc-main")) {
						if($(".card-list").eq(i).hasClass("zc-list1")) {
							$(".card-list").eq(i).removeClass("zc-list1");

						} else if($(".card-list").eq(i).hasClass("zc-list2")) {
							$(".card-list").eq(i).removeClass("zc-list2");;
						} else {
							$(".card-list").eq(i).removeClass("zc-main");
							$(".card-list").eq(i).addClass(change);
							$(".as-main").eq(i).removeClass("ds-none");
							$(".card-state").eq(asMain).removeClass("state-main");
						}
					}
				}

			},
			//弹出框
			alertBox: function() {

				if(operType == "setmain") {
					btnArray = ["取消", "确定"];
					mes = "设置尾号" + usercode.substring(15) + "的捷顺通卡为主卡？";
				} else if(operType == "unbind") {
					btnArray = ["确定", "取消"];
					mes = "解绑后无法继续享受线上充值、线上快速查询等便捷功能。您确认要继续吗？";
					//					console.log(operType)
				} else if(operType == "loss") {
					btnArray = ["确定", "取消"];
					mes = "进行挂失操作后，您卡片内的金额将被冻结，保障您的资金安全，您确认要挂失吗？";
				} else if(operType == "reset") {

				}
				mui.confirm(mes, title, btnArray, function(e) {
					if(e.index == 0) {
						if(operType == "setmain") {

						} else if(operType == "unbind") {
							//console.log(operType);
							popupPayPassword.show();
						} else if(operType == "loss") {
							//							console.log(operType);
						} else if(operType == "reset") {

						}
					} else {
						if(operType == "setmain") {
							//							console.log(operType);

							//main.toMainOper();
						} else if(operType == "unbind") {

						} else if(operType == "loss") {

						} else if(operType == "reset") {

						}
					}
				})
			},
			//解绑密码输入操作
			inputPwdComplete: function(pwd) {
				operType = "errForUnbind";
				if(6 > pwd.length) {
					$.toast("请输入支付密码");
					return;
				}

				var postParam = {
					userId: login.getUserId(),
					cardCode: usercode,
					password: pwd
				};
				postData("app/rest/unbindCard", postParam, function(data) {
					mes = data.errMsg;
					if(data.resCode == "0000") {
						$.toast("解绑成功");

						if($.os.plus) {
							//显示首页
							$.plusReady(function() {
								$.fire(require("./module/webview_opr").getLaunchWebview(), "changeTab", {
									toIndex: 1
								});

								require("./module/webview_opr").getLaunchWebview().show("slide-in-right", constant.duration);
							});

						} else {
							var href = constant.rootPath + "/page/account/account.html";
							openWindow(href);
						}

					} else {
						$.toast(mes);
					}

				}, null, {
					requestType: "POST"
				});
			}
		};
	main.init();

})(mui);