/**
 * 充值页面
 */
require("./module/public_module");
(function($) {

	var balanceEle = $("#balance"),
		cartLimitEle = $("#cardLimit"), //默认付款方式的限额或余额
		moneyInputEle = $("#moneyInput"), //充值金额输入框
		confirmBtnEle = $("#confirmBtn"), //确认支付铵钮

		cardTypeContainerEle = $("#cardTypeContainer"),
		payWayDataListEle = $("#payWayDataList"), //支付方式数据列表
		doneBtnEle = $("#doneBtn"), //充值完成铵钮

		sceneCode = "010100001", //充值场景码
		merchantId = "1000000", //充值写死商户ID
		userId = login.getUserId(true),
		viewApi, view, currentView, defaultCardNo = "", //使用新卡支付的回传卡号
		defaultPayWayObj = {}, //确认支付时的支付信息

		////////////////模块引入 
		payPassword = require("./module/pay_password"),
		smsInput = require("./module/popup_sms_input"),
		main = {
			//初始化执行
			init: function() {
				var self = this;
				self.initPage();
				self.getBalanceData();

				self.getPayCardListData();

				//初始化单页view
				viewApi = $('#app').view({
					defaultPage: "#main"
				});
				view = viewApi.view;

				self.bindEvent();
			},

			initPage: function() {
				if(!stringUtil.isEmpty(sessionStorage.getItem("bindCardNo"))) {
					defaultCardNo = sessionStorage.getItem("bindCardNo");
					sessionStorage.removeItem("bindCardNo");
				}
			},

			//自定义返回
			defindBack: function() {
				if($.os.plus) {
					//APP返回之前，刷新上个页面
					$.plusReady(function() {

						$.fire(require("./module/webview_opr").getLaunchWebview(), "changeTab", {
							toIndex: 1
						});

						plus.webview.currentWebview().close();
					});
				} else {
					//存储临时会话，说明绑定成功
					var href = constant.rootPath + "/page/account/account.html";
					openWindow(href);
				}

			},

			/**
			 * 获取余额等信息
			 */
			getBalanceData: function() {

				var acctId = login.getLoginInfo().acctId;

				if(!stringUtil.isEmpty(acctId)) {

					postData("app/rest/getAccountInfo", {
						"acctMarkNo": acctId
					}, function(data) {
						if(data.resType == "00") {
							var balance = main.getShowMoney(data.balance);
							balanceEle.attr("val", balance).html(balance);
						} else {
							$.toast(data.msgContent);
						}
					}, null, {
						requestType: "get"
					});
				}
			},

			//获取用户可支付的银行卡列表数据
			getPayCardListData: function() {
				postData("jst-finance-cashdeskfront/pay/payCardQueryList.do", {
					userId: userId,
					sceneCode: sceneCode,
					merchantId: merchantId
				}, main.handlePayCardListData);
			},
			//获取银行卡列表数据成功之后回调
			handlePayCardListData: function(res) {
				var defaultPayWayTmp = {},
					payCardQueryList;
				if(res.secc) {
					//成功获取支付方式列表
					payCardQueryList = res.payCardQueryList;
				}

				//生成卡列表HTML
				defaultPayWayTmp = require("./module/popup_jst_payway_list").create({
					defaultCardNo: defaultCardNo,
					wrapper: payWayDataListEle,
					payCardQueryList: payCardQueryList,
					selectedCallback: function(defaultPayWayPara) {
						main.setDefaultPayway(defaultPayWayPara);
						$.back();
					},
					newCardPay: main.newCardPay

				});
				main.setDefaultPayway(defaultPayWayTmp);
			},

			/**
			 * 设置默认支付方式
			 */
			setDefaultPayway: function(dataItem) {

				if(stringUtil.isEmpty(dataItem)) {
					//没有支付方式，换成使用新卡支付吧
					cardTypeContainerEle.addClass("empty").find(".card-name").html("无有效支付方式");
					confirmBtnEle.addClass("disabled default");
					return;
				}
				var payType = dataItem.payType, //支付卡类型	01-余额户，02-借记卡(快捷)，03-贷记卡(快捷)，04-捷顺通卡
					payCardNo = dataItem.payCardNo, //支付卡号::对应确认支付参数-支付凭证号
					mechanismCode = dataItem.mechanismCode, //卡所属机构号
					mechanismName = dataItem.mechanismName, //卡所属机构名称::对应确认支付参数-支付凭证号备注
					_amount = dataItem.amount; //可用额度

				//获取银行LOGO及背景色
				var bankLogoObj = require("./module/get_resource").getBankLogo(mechanismCode),
					bankBgColor = bankLogoObj.color,
					bankLogo = bankLogoObj.logo;

				cardTypeContainerEle.find(".card-img").attr("src", "../../img/icon/".concat(bankLogo));
				cardTypeContainerEle.css("background", bankBgColor);
				cardTypeContainerEle.removeClass("empty").find(".card-name").html(mechanismName);
				confirmBtnEle.removeClass("default").css({
					"background": "none",
					"border": "1px solid ".concat(bankBgColor),
					"color": bankBgColor
				});

				main.validate();

				if(main.checkPayType(payType)) {
					//如果是余额支付，则显示卡余额
					cartLimitEle.html("余额:{{_amount}}元".replace("{{_amount}}", main.getShowMoney(_amount)));
					defaultPayWayObj = dataItem; //设置选择了哪个支付方式
				} else {
					//选择的是快捷支付，则去请求获取银行卡限额和子通道ID
					postData("jst-finance-cashdeskfront/pay/queryLimit.do", {
						bankCardNo: payCardNo,
						userId: userId
					}, function(res) {
						if(res.secc) {
							var resultData = res,
								channelCodeParent = resultData.channelCodeParent, //主通道编码，用于获取是否需要发送短信
								singleAmountMax = resultData.singleAmountMax, //单笔交易额度上限
								singleAmountMin = resultData.singleAmountMin, //单笔交易额度下限
								dayAmountMax = resultData.dayAmountMax; //单日交易额度上限

							dataItem.mainChannelCode = channelCodeParent;
							defaultPayWayObj = dataItem; //设置选择了哪个支付方式
							cartLimitEle.html("单笔:{{singleAmountMax}}元,单日:{{dayAmountMax}}元"
								.replace("{{singleAmountMax}}", singleAmountMax)
								.replace("{{dayAmountMax}}", dayAmountMax));
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
//				var oldBack = $.back;
				$.back = function() {
					if(viewApi.canBack()) { //如果view可以后退，则执行view的后退
						viewApi.back();
					} else { //执行webview后退
						self.defindBack();
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
						self.defindBack();
					}
				});
				view.addEventListener('pageBack', function(e) {
//					console.log(e.detail.page.id + ' back');
				});

				//充值银行卡点击事件
				cardTypeContainerEle.addEventListener('tap', function(event) {

					if(stringUtil.isEmpty(defaultPayWayObj)) {
						self.newCardPay();
						return;
					}

					//转至选择支付方式
					viewApi.go("#payWay");
				}, false);

				/**
				 * 充值金额输入事件
				 */
				moneyInputEle.bind("keyup", function() {
					main.validate();
				});

				/**
				 * 确认支付点击事件
				 */
				confirmBtnEle.addEventListener("tap", function() {

					if($(this).hasClass("disabled")) {
						return;
					}

					if(stringUtil.isEmpty(defaultPayWayObj)) {
						$.toast("请选择支付方式");
						return;
					}

					if(!main.validate()) {
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
				 * 充值完成点击
				 */
				doneBtnEle.bind("tap", function() {
					self.defindBack();
				});

				//WEBVIEW自定义事件------------------------Begin---------------------------

				//绑定成功了，刷新资产列表，并且回到支付界面
				window.addEventListener('bindSuccess', function(event) {

					console.log(plus.webview.currentWebview().id + " bindSuccess--event " + JSON.stringify(event.detail));

					defaultCardNo = event.detail.bindCardNo;

					if("payWay" == currentView) {
						$.back();
					}

					self.getPayCardListData();

				});

				//WEBVIEW自定义事件------------------------End---------------------------

			},

			//添加新卡支付
			newCardPay: function() {

				var href = constant.rootPath + '/page/account/account_bindcard.html',
					param = {
						bindType: 1,
						toPage: "recharge",
						fromPage: "recharge"
					},
					gotoBindPage = function() {
						openWindow(href, href, param);
					};
				if(login.getLoginInfo() && login.getLoginInfo().certification >= 1) {
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

				if(login.getLoginInfo() && login.getLoginInfo().isPaypwd == 1) {

					//已经设置过支付密码了
					payPassword.validatePwd({
						userId: userId,
						inputTitle: "充值金额  ".concat(constant.moneySymbol).concat(moneyInputEle.val()),
						inputCompleteClose: false,
						successCallback: successCallback,
						forgetPwdFromPage: "recharge"
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
						amount: parseInt(parseFloat(moneyInputEle.val()) * 100)
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
						mobile: login.getLoginInfo().mobile, //要获取短信的手机号
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

			/**
			 * 验证充值金额输入是否合法
			 */
			validate: function() {

				var reg = /^\d+(\.\d{0,2})?$/g,
					moneyVal = moneyInputEle.val();

				if(!reg.test(moneyVal)) {
					var _value = moneyVal.substr(0, moneyVal.length - 1);
					moneyInputEle.val(_value);

					return false;
				}
				var moneyNumber = Number(moneyVal);

				if(moneyNumber > 0) {
					confirmBtnEle.removeClass("disabled");
				} else {
					confirmBtnEle.addClass("disabled");
					return false;
				}

				return true;

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
						amount: parseInt(parseFloat(moneyInputEle.val()) * 100)
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
			 * 检查是否为余额支付
			 * @param {Object} payType
			 */
			checkPayType: function(payType) {
				return("01" == payType || "04" == payType);
			},

			/**
			 * 提交充值请求
			 */
			commit: function(smsCode) {

				if(!main.validate()) {
					$.toast("请输入正确的金额");
					return;
				}

				if(6 > defaultPayWayObj.pwd.length) {
					$.toast("支付密码不正确");
					return;
				}

				var postParam = {
						userFlag: 0,
						userCode: userId,
						payPassword: require("./module/crypto").encryptPwd(defaultPayWayObj.pwd),
						payWay: defaultPayWayObj.payType,
						amount: parseInt(parseFloat(moneyInputEle.val()) * 100),
						remark: "充值",
					},
					smsFlag = defaultPayWayObj.smsFlag,
					smsTraceCode = defaultPayWayObj.smsTraceCode || "";

				if(smsFlag) {
					//到这儿说明该银行卡是需要验证短信码的
					if(smsCode.length < 6) {
						$.toast("短信验证码不正确");
						return;
					}

					if(stringUtil.isEmpty(smsTraceCode)) {
						$.toast("短信跟踪码为空");
						return;
					}

					postParam.smsCode = smsCode;
					postParam.smsTraceCode = smsTraceCode;
				}

				if(!main.checkPayType(defaultPayWayObj.payType)) {
					postParam.bankCardNo = defaultPayWayObj.payCardNo; //支付银行卡号
					postParam.payCerNoMark = defaultPayWayObj.mechanismName; //支付机构描述
					postParam.subChannelCode = defaultPayWayObj.channelCodeChild; //子通道编码
				}

				postData("app/rest/tradecore/recharge", postParam, function(res) {
					if(res.resType == "00") {
						main.payResult();
					} else {
						$.alert(res.msgContent, function() {
							payPassword.hide();
							smsInput.hide();
						});
					}
				});

			},

			/**
			 * 支付成功
			 */
			payResult: function() {
				$("#rechargeCardText").html(defaultPayWayObj.mechanismName.concat(
					stringUtil.infoProtectDeal({
						targetStr: defaultPayWayObj.payCardNo,
						keepEnd: 4,
						cipherLen: 3
					})
				));
				$("#rechargeMoneyText").html(constant.moneySymbol.concat(moneyInputEle.val()));

				viewApi.go("#payResult");
				payPassword.hide();
				smsInput.hide();
			}
		};
	main.init();

})(mui);
//end