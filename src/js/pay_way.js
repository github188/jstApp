/**
 * 收银台页面
 *  version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./module/public_module");
(function($) {

	var amount = Number(requestURL.getParameter("amount")) || 0, //需付款金额回传参数
		orderName = requestURL.getParameter("orderName") || "", //订单名称
		busNo = requestURL.getParameter("busNo") || "", //内部订单号
		outTradeNo = requestURL.getParameter("outTradeNo") || "", //外部订单号
		userId = requestURL.getParameter("userId") || "", //会员ID
		merchantId = requestURL.getParameter("merchantId") || "", //商户ID
		sceneCode = requestURL.getParameter("sceneCode") || "", //场景码
		errorCode = requestURL.getParameter("errorCode") || "", //错误码
		errorMsg = requestURL.getParameter("errorMsg") || "", //错误提示
		resultPageUrl = requestURL.getParameter("resultPageUrl") || "", //支付成功之后的前端回调页面
		resultNoticeUrl = requestURL.getParameter("resultNoticeUrl") || "", //支付成功之后的后端回调地址，用于后端异步通知

		////////////////收银台入口元素
		mainViewSelectPayWayEle = $("#mainViewSelectPayWay"), //选择支付方式

		payMoneyEle = $(".pay-money-value"), //需付款金额
		payProNameEle = $(".pay-pro-name-value"), //需付款商品名称

		jstDefaultPayWayEle = $("#jstDefaultPayWay"), //捷顺通默认付款方式
		jstSelectPaywayEle = $("#jstSelectPayway"), //付款方式
		//		cartLimitEle = $(".cart-limit"), //默认付款方式的限额或余额
		confirmPayEle = $("#confirmPay"), //确认支付铵钮
		payWayDataListEle = $("#payWayDataList"), //支付方式数据列表

		paySuccessEle = $("#pay-success-box"),
		payFailEle = $("#pay-fail-box"),
		payBackPay = $("#pay-backpay"),
		viewApi, view, userInfo, currentView, defaultCardNo = "", //使用新卡支付的回传卡号
		payWayDataHtmlTpl = '<div class="card-cell {{disabledClass}}" id="item{{rid}}" rid="{{rid}}" payType="{{payType}}" payCardNo="{{payCardNo}}" mechanismCode="{{mechanismCode}}" mechanismName="{{mechanismName}}" _amount="{{_amount}}"><span class="card-icon"><img src="{{imagePath}}"></span><div class="card-info {{hasLimitClass}}"><p class="name">{{mechanismName}}{{mainChannelCodeText}}</p><p class="limit">{{_amountText}}</p></div><span class="select-symal">&#8730;</span></div>',

		////////////////模块引入 
		payPassword = require("./module/pay_password"),
		smsInput = require("./module/popup_sms_input"),

		defaultPayWayObj = {}, //确认支付时的支付信息
		main = {
			//初始化执行
			init: function() {
				var self = this;

				self.initView();

				$.init();

				self.initPage();

				self.bindEvent();
			},

			initPage: function() {

				var checkresult = this.checkParameter();
				if(!stringUtil.isEmpty(sessionStorage.getItem("bindCardNo"))) {
					defaultCardNo = sessionStorage.getItem("bindCardNo");
					sessionStorage.removeItem("bindCardNo");
				}

				var defaultPage = "";
				if(!stringUtil.isEmpty(checkresult.errorType)) {
					switch(checkresult.errorType) {
						case "-1":
							// 回调错误
							paySuccessEle.addClass("pay-hidden");
							payFailEle.removeClass("pay-hidden");
							break;
						case "-2":
							// 入参出错
							paySuccessEle.addClass("pay-hidden");
							payFailEle.removeClass("pay-hidden");
							break;
						default:
							break;
					}
					defaultPage = '#payResult';
				} else if(!stringUtil.isEmpty(outTradeNo) && outTradeNo == local.getItem("paySuccess")) {
					defaultPage = '#payResult';

				} else {
					if(stringUtil.isEmpty(defaultCardNo)) {
						defaultPage = '#main';
					} else {
						//如果回传的卡号不为空，那说明是使用新卡支付返回的
						defaultPage = '#jstPayView';

						!userInfo && this.getUserInfo(userId);
						this.getPayCardList();
					}

				}

				//初始化单页view
				viewApi = $('#app').view({
					defaultPage: defaultPage
				});
				view = viewApi.view;

				if(!stringUtil.isEmpty(outTradeNo) && outTradeNo == local.getItem("paySuccess")) {
					this.payResult();
				}
			},

			//检测入参
			checkParameter: function() {

				var returnR = {
					result: true
				};

				if(!stringUtil.isEmpty(errorCode)) {
					//返回错误，转到错误页
					returnR.errorType = "-1"; //后台回调直接报错了
					returnR.result = false;

				} else if(amount < 0 || stringUtil.isEmpty(orderName) || stringUtil.isEmpty(busNo) || stringUtil.isEmpty(outTradeNo) || stringUtil.isEmpty(userId) || stringUtil.isEmpty(merchantId) || stringUtil.isEmpty(sceneCode)) {
					//参数不合法
					returnR.errorType = "-2"; //入参出错
					returnR.result = false;
				}
				return returnR;
			},

			/**
			 * 初始化金额及订单名称
			 */
			initView: function() {
				payMoneyEle.html(constant.moneySymbol + main.getShowMoney(amount) + "元");
				payProNameEle.html(orderName);
			},

			/**
			 * 获取用户信息
			 * @param {Object} userId
			 */
			getUserInfo: function(userId) {
				//查询用户是否设置了支付密码
				postData("app/rest/getMemberInfo", {
					"usrLgName": userId
				}, function(data) {
					if(data.resType == "00") {
						userInfo = data.selUsersInfoListBeans[0];
					}

				}, function() {
					$.alert("获取用户信息出错啦", function() {
						viewApi.go("#main");
					});
				}, {
					requestType: "get",
					autoUpdateToken: 1,
					autoLogin: 1
				});
			},

			//获取数据
			getPayCardList: function() {
				postData("jst-finance-cashdeskfront/pay/payCardQueryList.do", {
					userId: userId,
					merchantId: merchantId,
					sceneCode: sceneCode
				}, main.handleData);
			},
			//获取数据成功之后回调
			handleData: function(res) {

				//								res = JSON.parse('{"currentPage":1,"pageSize":10,"startTime":null,"endTime":null,"resCode":"CASHDESKFRONT001006","resType":"00","msgContent":"查询商户1000000支付列表为空","errorMsg":null,"pageCount":0,"numCount":0,"payCardQueryList":[{"payType":"02","payCardNo":"6227001376710050739","mechanismCode":"ICBC","mechanismName":"工商银行"}],"secc":true}');

				var defaultPayWayTmp = {},
					payCardQueryList;
				if(res.secc) {
					//成功获取支付方式列表
					payCardQueryList = res.payCardQueryList;
				}

				//生成卡列表HTML
				defaultPayWayTmp = require("./module/popup_jst_payway_list").create({
					amount: amount,
					defaultCardNo: defaultCardNo,
					wrapper: payWayDataListEle,
					payCardQueryList: payCardQueryList,
					newCardPay: main.newCardPay,
					selectedCallback: function(defaultPayWayPara) {
						main.setDefaultPayway(defaultPayWayPara);
						$.back();
					}

				});
				main.setDefaultPayway(defaultPayWayTmp);

			},

			/**
			 * 检查是否为余额支付
			 * @param {Object} payType
			 */
			checkPayType: function(payType) {
				return("01" == payType || "04" == payType);
			},

			/**
			 * 设置默认支付方式
			 */
			setDefaultPayway: function(dataItem) {

				if(stringUtil.isEmpty(dataItem)) {
					//没有支付方式，换成使用新卡支付吧
					jstSelectPaywayEle.find(".cell-left").html("添加新卡支付");
					confirmPayEle.addClass("disabled");
					return;
				}
				confirmPayEle.removeClass("disabled");
				var payType = dataItem.payType, //支付卡类型	01-余额户，02-借记卡(快捷)，03-贷记卡(快捷)，04-捷顺通卡
					payCardNo = dataItem.payCardNo, //支付卡号::对应确认支付参数-支付凭证号
					mechanismName = dataItem.mechanismName, //卡所属机构名称::对应确认支付参数-支付凭证号备注
					_amount = dataItem.amount, //可用额度
					mainChannelCodeText = "";
				if(main.checkPayType(payType)) {
					//如果是余额支付，则显示卡余额

					if(!stringUtil.isEmpty(payCardNo)) {
						mainChannelCodeText = "(" + payCardNo.slice(-4) + ")";
					}
					jstDefaultPayWayEle.html((payType == "01" ? "余额支付" : "捷顺通卡") + (!stringUtil.isEmpty(payCardNo) ? "(" + payCardNo.slice(-4) + ")" : ""));
					defaultPayWayObj = dataItem; //设置选择了哪个支付方式
				} else {
					//选择的是快捷支付，则去请求获取银行卡限额和子通道ID
					postData("jst-finance-cashdeskfront/pay/queryLimit.do", {
						bankCardNo: payCardNo,
						userId: userId
					}, function(res) {
						if(res.secc) {
							var resultData = res,
								channelCodeParent = resultData.channelCodeParent; //主通道编码，用于获取是否需要发送短信

							dataItem.mainChannelCode = channelCodeParent;
							defaultPayWayObj = dataItem; //设置选择了哪个支付方式
							jstDefaultPayWayEle.html("{{mechanismName}}{{payCardNo}}"
								.replace("{{mechanismName}}", mechanismName)
								.replace("{{payCardNo}}", !stringUtil.isEmpty(payCardNo) ? "(" + payCardNo.slice(-4) + ")" : ""));
						} else {
							$.toast(res.msgContent);
						}
					});
				}

			},

			/**
			 * 将分转为元显示
			 * @param {Object} money
			 */
			getShowMoney: function(money) {
				return(money / 100.00).toFixed(2);
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
				//监听页面切换事件方案1,通过view元素监听所有页面切换事件，目前提供pageBeforeShow|pageShow|pageBeforeBack|pageBack四种事件(before事件为动画开始前触发)
				//第一个参数为事件名称，第二个参数为事件回调，其中e.detail.page为当前页面的html对象
				view.addEventListener('pageBeforeShow', function(e) {
					//					console.log(e.detail.page.id + ' beforeShow');
				});
				view.addEventListener('pageShow', function(e) {
					//					console.log(e.detail.page.id + ' show');
					currentView = e.detail.page.id;
				});
				view.addEventListener('pageBeforeBack', function(e) {
					//					console.log(e.detail.page.id + ' beforeBack');
					if("payResult" == e.detail.page.id) {
						//支付结果页返回直接退出页面
						oldBack();
					}
					if("main" == e.detail.page.id) {
						//支付结果页返回直接退出页面
						oldBack();
					}
				});
				view.addEventListener('pageBack', function(e) {
					//					console.log(e.detail.page.id + ' back');
				});

				/**
				 * 入口选择支付方式
				 */
				mainViewSelectPayWayEle.on("tap", ".cell-item", function() {
					var payType = $(this).attr("payType");

					switch(payType) {
						case "1":
							//捷顺通支付
							!userInfo && self.getUserInfo(userId);
							self.getPayCardList();
							viewApi.go("#jstPayView");
							break;
						default:
							break;
					}
				});

				/**
				 * 点击跳转至选择支付方式
				 */
				jstSelectPaywayEle.bind("tap", function() {

					if(stringUtil.isEmpty(defaultPayWayObj)) {
						//添加新卡支付
						self.newCardPay();
						return;
					}

					//转至选择支付方式
					viewApi.go("#payWay");
				});

				/**
				 * 确认支付点击事件
				 */
				confirmPayEle.addEventListener("tap", function() {

					if($(this).hasClass("disabled")) {
						return;
					}

					if(stringUtil.isEmpty(defaultPayWayObj)) {
						$.toast("请选择支付方式");
						return;
					}

					self.getChildCodeAndSMSFlag(function(flag) {
						//查询是否需要发送短信回调
						defaultPayWayObj.smsFlag = flag;

						//弹出支付密码框
						self.popupPaypwd();
					});

				});

				/**
				 * 付款失败返回
				 */
				payBackPay.bind("tap", function() {
					viewApi.go("#main");
				});

				//WEBVIEW自定义事件------------------------Begin---------------------------

				//绑定成功了，刷新资产列表，并且回到支付界面
				window.addEventListener('bindSuccess', function(event) {

					console.log(plus.webview.currentWebview().id + " bindSuccess--event " + JSON.stringify(event.detail));

					defaultCardNo = event.detail.bindCardNo;

					if("payWay" == currentView) {
						$.back();
					}
					self.getUserInfo(userId);
					self.getPayCardList();

				});

				//WEBVIEW自定义事件------------------------End---------------------------
			},

			//添加新卡支付
			newCardPay: function() {

				var href = constant.rootPath + '/page/account/account_bindcard.html',
					param = {
						bindType: 3,
						userId: userId,
						fromPage: "pay",
						toPage: "pay"
					},
					gotoBindPage = function() {
						openWindow(href, href, param);
					};
				if(userInfo && userInfo.certification >= 1) {
					param.isadd = 1;
				}
				if($.os.plus) {

					//APP环境需传当前WEBVIEWID
					$.plusReady(function() {
						param.fromPageId = plus.webview.currentWebview().id;
						gotoBindPage();
					});
				} else {
					gotoBindPage();
				}

				//存储本次支付链接 ，添加完新卡之后再回来
				local.setItem("payUrlTmp", location.href);

			},

			/**
			 * 获取子通道编码和是否需要发送短信
			 */
			getChildCodeAndSMSFlag: function(callback) {
				if(main.checkPayType(defaultPayWayObj.payType)) {
					//余额支付默认不需要发送短信
					callback && callback(false);
				} else {
					//快捷支付时，需获取是否需要发送短信
					var payCardNo = defaultPayWayObj.payCardNo,
						mainChannelCode = defaultPayWayObj.mainChannelCode;

					if(stringUtil.isEmpty(payCardNo)) {
						$.toast("没有支付银行卡号");
						return;
					}

					if(stringUtil.isEmpty(mainChannelCode)) {
						$.toast("没有主通道编码");
						return;
					}
					postData("jst-finance-cashdeskfront/pay/querySendSmsFlag.do", {
						channelCodeParent: mainChannelCode,
						amount: amount
					}, function(res) {
						if(res.secc) {
							var smsFlag = res.smsFlag,
								flag = false;
							if("3" != smsFlag) {
								//需要发短信验证码哦
								flag = true;
							}

							callback && callback(flag);

							defaultPayWayObj.channelCodeChild = res.channelCodeChild; //子通道编号::对应确认支付参数-子通道
						} else {
							$.toast(res.msgContent);
						}
					});
				}

			},

			/**
			 * 弹出支付密码框
			 */
			popupPaypwd: function() {

				var self = this;

				/**
				 * 设置密码或验证密码成功回调
				 * @param {Object} pwd
				 */
				var successCallback = function(pwd) {
					defaultPayWayObj.pwd = pwd;
					self.popupSmsinput();
				}

				if(userInfo && userInfo.isPaypwd == 1) {

					//已经设置过支付密码了
					payPassword.validatePwd({
						userId: userId,
						inputCompleteClose: true,
						successCallback: successCallback,
						forgetPwdFromPage: "pay"
					});
					return;
				}

				//设置支付密码
				payPassword.setPayPwd({
					userId: userId,
					inputCompleteClose: false,
					successCallback: successCallback
				});

			},

			/**
			 * 弹出短信验证码框
			 */
			popupSmsinput: function() {

				var self = this;

				/**
				 * 获取短信验证码
				 * @param {Object} element:获取短信验证码铵钮
				 */
				var getSmsCode = function(element) {

					//调用接口发送短信
					postData("jst-finance-cashdeskfront/pay/sendSms.do", {
						bankCardNo: defaultPayWayObj.payCardNo,
						authenflowNo: userId,
						channelCodeChild: defaultPayWayObj.channelCodeChild,
						amount: amount
					}, function(res) {
						if(res.secc) {
							//调用发送短信成功了,拿到一个短信外部跟踪编号::对应确认支付参数-smsTraceCode短信跟踪编码
							var externalRefNumber = res.externalRefNumber;

							if(stringUtil.isEmpty(externalRefNumber)) {
								//没有拿到编号，提示出错
								$.toast("获取短信外部编号出错");
								return;
							}

							defaultPayWayObj.smsTraceCode = externalRefNumber; //短信外部跟踪编号::对应确认支付参数-smsTraceCode短信跟踪编码
							element && require("./module/common_util").timeDown(element);
						} else {
							$.toast(res.msgContent);
						}
					});

				};

				if(defaultPayWayObj.smsFlag) {
					//需要发送短信的

					getSmsCode();

					smsInput.show({
						withInit: true, //是否直接初始化并显示，如设置为FALSE，请先调用init 
						smsSended: true, //是否已经发送短信
						mobile: userInfo.mobile, //要获取短信的手机号
						getCodeCallback: getSmsCode, //获取验证码回调
						doneCallback: self.commit //输完后的回调
					});
					setTimeout(function() {
						payPassword.hide();
					}, 500);

				} else {
					//不需要短信验证，直接提交吧
					self.commit();
				}

			},

			commit: function(smsCode) {

				if(stringUtil.isEmpty(defaultPayWayObj.pwd)) {
					$.toast("请输入支付密码");
					return;
				}

				var postParam = {
					sceneCode: sceneCode, //场景码
					merchantId: merchantId, //商户ID
					resultNoticeUrl: resultNoticeUrl, //后端异步通知地址
					busNo: busNo, //内部订单号
					outTradeNo: outTradeNo, //外部订单号
					payPassword: require("./module/crypto").encryptPwd(defaultPayWayObj.pwd),
					payWay: defaultPayWayObj.payType,
					payAmount: amount,
					userId: userId
				};

				if(!main.checkPayType(defaultPayWayObj.payType)) {
					postParam.payCerNo = defaultPayWayObj.payCardNo;
					postParam.payCerNoMark = defaultPayWayObj.mechanismName;
					postParam.subChannelCode = defaultPayWayObj.channelCodeChild;
				}

				if(defaultPayWayObj.smsFlag) {
					postParam.smsCode = smsCode;
					postParam.smsTraceCode = defaultPayWayObj.smsTraceCode;
				}
				viewApi.go("#payWaiting");
				postData("jst-finance-cashdeskfront/pay/confirmationPay.do", postParam, function(res) {
					if(res.secc) {
						local.setItem("paySuccess", outTradeNo);
						viewApi.go("#payResult");
						payPassword.hide();
						smsInput.hide();
						main.payResult();
					} else {
						//$.toast(res.msgContent);
						//						viewApi.go("#payResult");
						//						paySuccessEle.addClass("pay-hidden");
						//						payFailEle.removeClass("pay-hidden");

						$.alert(res.msgContent, function() {
							viewApi.go("#main");
						});
					}
				}, function(err) {
					viewApi.go("#payResult");
					paySuccessEle.addClass("pay-hidden");
					payFailEle.removeClass("pay-hidden");
				}, {
					showWait: false,
					errorToast: false
				});
			},

			/**
			 * 支付成功，3秒跳至商户
			 */
			payResult: function() {

				paySuccessEle.removeClass("pay-hidden");
				payFailEle.addClass("pay-hidden");
				if(!stringUtil.isEmpty(resultPageUrl)) {
					//地址不为空，1秒后回调
					if(!stringUtil.isURL(resultPageUrl)) {

						resultPageUrl = resultPageUrl.indexOf(constant.base) == -1 ? "http://".concat(resultPageUrl) : resultPageUrl;

					}

					var countdown = 1;

					function settime() {
						if(countdown == 0) {

							if(stringUtil.isEmpty(resultPageUrl)) {
								if($.os.plus) {
									//APP环境，跳转采用WEBVIEW LOADURL
									$.plusReady(function() {
										plus.webview.currentWebview().close();
									});
								} else {
									main.defindBack();
								}
							} else {
								if($.os.plus) {
									//APP环境，跳转采用WEBVIEW LOADURL
									$.plusReady(function() {
										plus.webview.currentWebview().loadURL(resultPageUrl);
									});
								} else {
									openWindow(resultPageUrl);
								}
							}

						} else {
							countdown--;
						}
						setTimeout(function() {
							settime();
						}, 1000);
					}
					settime();
				}
			}
		};
	main.init();

})(mui);
//end