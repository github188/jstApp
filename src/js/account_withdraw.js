/**
 * 提现页面
 */
require("./module/public_module");
(function($) {

	var balanceEle = $("#balance"),
		moneyInputEle = $("#moneyInput"), //提现金额输入框
		confirmBtnEle = $("#confirmBtn"), //确认支付铵钮
		cardCellEle = $("#cardCell"), //提现银行卡选项
		InputValidators = require("./module/input_validators"),
		keyBoradPwd = require("./module/keyboard_pwd"),
		userInfo = login.getLoginInfo(true), //获取已登录用户信息
		userPicker = null,
		pickerData = new Array(), //底部弹出银行卡列表数据
		main = {
			//初始化执行
			init: function() {
				var self = this;

				keyBoradPwd.init({
					doneCallback: self.inputPwdComplete
				});

				self.getBalanceData();

				self.getBindBankData();

				self.bindEvent();
			},

			/**
			 * 检测是否绑定银行卡或设置支付密码等
			 */
			preCheck: function() {
				//判断是否绑卡
				if(userInfo.certification == 0) {
					$.toast("请先绑定银行卡");

					var href = constant.rootPath + "/page/account/account_bindcard.html";
					openWindow(href, href, {
						bindType: 1,
						toPage: "withdraw"
					});
					return;
				}

				//判断是否设置支付密码
				if(userInfo.isPaypwd != 1) {
					$.toast("您未设置支付密码，为了账户安全，请先设置支付密码");
					var href = constant.rootPath + "/page/account/account_setpaypassword.html";
					openWindow(href, href, {
						modpaypw: 0
					});
					return;
				}
			},

			/**
			 * 获取余额等信息
			 */
			getBalanceData: function() {

				var acctId = userInfo.acctId;

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

			/**
			 * 获取银行卡列表
			 */
			getBindBankData: function() {

				var userId = userInfo.userId;

				if(!stringUtil.isEmpty(userId)) {

					postData("app/rest/userBindBkCards", {
						userId: userId
					}, function(data) {

						var bankList = data.bindBkCardList,
							bankListLen = (bankList && bankList.length) || 0;

						if(bankListLen > 0) {
							//说明有绑定银行卡了
							var showText = true;
							for(var i = 0; i < bankListLen; i++) {
								var bankItem = bankList[i],
									bankName = bankItem.bankName, //卡名称
									bankCardCode = bankItem.bankCardCode, //卡号
									text = bankName + "(" + bankCardCode.slice(-4) + ")";

								if(stringUtil.isEmpty(bankCardCode)) {
									continue;
								}

								if(showText) {
									cardCellEle.attr("cardNo", bankCardCode);
									$("#bindCard").html(text);
									showText = false;
								}

								pickerData.push({
									value: bankCardCode,
									text: text
								});
							}

							pickerData.push({
								value: "",
								text: "使用新卡"
							});

							main.createPicker();
						}
					});
				}

			},

			createPicker: function() {

				$.init();
				$.ready(function() {
					//普通示例
					userPicker = new $.PopPicker();
					userPicker.setData(pickerData);

				});

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

				//提现银行卡点击事件
				cardCellEle.addEventListener('tap', function(event) {

					if(stringUtil.isEmpty($(this).attr("cardNo"))) {
						var href = constant.rootPath + "/page/account/account_bindcard.html";
						openWindow(href, href, {
							bindType: 1,
							toPage: "withdraw"
						});
						return;
					}

					userPicker.show(function(items) {

						var selectItem = items[0];

						if(stringUtil.isEmpty(selectItem.value)) {
							//没有值，那选择的是新卡支付
							var href = constant.rootPath + "/page/account/account_bindcard.html";
							openWindow(href, href, {
								bindType: 1,
								toPage: "withdraw"
							});
							return false;
						}
						cardCellEle.attr("cardNo", selectItem.value);
						$("#bindCard").html(selectItem.text);
					});
				}, false);

				/**
				 * 提现金额输入事件
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

					var cardNo = cardCellEle.attr("cardNo");

					if(stringUtil.isEmpty(cardNo)) {
						$.toast("请选择提现银行卡");
						return;
					}

					if(!main.validate()) {
						return;
					}

					//显示支付密码键盘
					keyBoradPwd.show();

				});

			},

			/**
			 * 验证提现金额输入是否合法
			 */
			validate: function() {

				var reg = /^\d+(\.\d{0,2})?$/g,
					moneyVal = moneyInputEle.val();

				if(!reg.test(moneyVal)) {
					var _value = moneyVal.substr(0, moneyVal.length - 1);
					moneyInputEle.val(_value);

					return false;
				}
				var moneyNumber = Number(moneyVal),
					balance = balanceEle.attr("val");

				if(Number(balance) <= 0) {
					$.toast("可提现金额为0");
					return;
				}

				if(moneyNumber > Number(balance)) {
					moneyInputEle.val(balance);
					confirmBtnEle.addClass("disabled");
					$.toast("输入的金额大于最大可提现金额");
					return false;
				} else {
					confirmBtnEle.removeClass("disabled");

				}

				return true;

			},

			/**
			 * 密码输入完之后，提交
			 * @param {Object} pwd
			 */
			inputPwdComplete: function(pwd) {

				if(6 > pwd.length) {
					$.toast("请输入支付密码");
					return;
				}

				var postParam = {
					userFlag: 0,
					userCode: userInfo.userId,
					bankCardNo: cardCellEle.attr("cardNo"),
					amount: parseInt(parseFloat(moneyInputEle.val()) * 100),
					remark: "提现",
					payPassword: pwd
				};

				postData("app/rest/tradecore/withdrawl", postParam, function(data) {
					//alert(11)
					if(data.resType == "00") {
						$.toast("提现成功");

						var href = constant.rootPath + "/page/account/account.html";
						openWindow(href);

					} else if(data.resCode == "MB300002") {

						var btnArray = ['重试', '忘记密码'];
						$.confirm(data.msgContent, "提示", btnArray, function(e) {
							if(e.index == 1) {
								//忘记密码了
								var href = constant.rootPath + "/page/account/forget_pay_pwd.html";
								openWindow(href, href, {
									oper: 2
								});
							} else {
								keyBoradPwd.clear();
							}
						});

					} else if(data.resCode == "MB300001") {

						$.confirm(data.msgContent, "提示", ['忘记密码'], function(e) {
							//忘记密码了
							var href = constant.rootPath + "/page/account/forget_pay_pwd.html";
							openWindow(href, href, {
								oper: 2
							});
						});

					} else {
						$.toast("提现失败")
					}

				});
			}
		};
	main.init();

})(mui);
//end