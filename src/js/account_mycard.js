/**
 * 我的银行卡列表
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./module/public_module");
(function($) {

	var addCardEle = $("#addCard"), //添加铵钮
		cardListEle = $("#cardList"), //银行卡列表
		unbindBtnEle = $("#unbindBtn"), //解绑铵钮
		cardShowEle = $("#card-showbox"), // 银行卡详情背景
		cardShowlogoEle = $("#card-showlogo"), // 银行卡详情logo
		cardShowNameEle = $("#card-showname"),
		cardShowTypeEle = $("#card-showtype"),
		cardShowCodeEle = $("#card-showcode"),
		userId = login.getUserId(true),
		cardListHtmlTpl = '<li class="card-item" cardNo="{{cardNo}}" cardname="{{bankName}}" cardtype="{{bankCardType}}" cardicon="{{card-icon}}" cardcolor="{{card-bground}}"><div class="card-box {{card-bground}}"><div class="card-logo"><div class="card-picbox"><span></span><img src="../../img/icon/{{card-icon}}" /></div></div><div class="card-info"><p class="card-name">{{bankName}}</p><p class="card-type">{{bankCardType}}</p><p class="card-code">{{cardNoText}}</p></div></div><div class="card-shadow"></div></li>',
		matterExist = require("./module/get_resource"),
		payPassword = require("./module/pay_password"),
		viewApi, view,
		main = {
			//初始化执行
			init: function() {
				var self = this;

				$.init();
				//初始化单页view
				viewApi = $('#app').view({
					defaultPage: "#cardListView"
				});
				view = viewApi.view;

				self.getBindBankListData();
				self.bindEvent();
				self.getBgClass();
			},

			//获取用户绑定银行卡列表
			getBindBankListData: function() {
				var self = this;
				postData("app/rest/userBindBkCards", {
					"userId": userId
				}, function(data) {
					if(data.resType == "00") {
						var result = data.bindBkCardList,
							listLen = (result && result.length) || 0,
							htmls = '';
						for(var i = 0; i < listLen; i++) {
							var dataItem = result[i],
								bankCardType = dataItem.bankCardType,
								bankCardCode = dataItem.bankCardCode,
								bankName = dataItem.bankName,
								bankCode = dataItem.bankCode,
								cardNoText = stringUtil.infoProtectDeal({
									targetStr: bankCardCode.substr(6),
									keepEnd: 4
								});
							if(bankCardType != "04") {
								// 不展示捷顺通卡
								htmls += cardListHtmlTpl.replace(/{{cardNo}}/g, bankCardCode)
									.replace(/{{bankName}}/g, bankName)
									.replace(/{{bankCardType}}/g, "01" == bankCardType ? "借记卡" : "02" == bankCardType ? "贷记卡" : "")
									.replace(/{{cardNoText}}/g, "****** " + cardNoText)
									.replace(/{{card-bground}}/g, self.getBgClass(bankCode))
									.replace(/{{card-icon}}/g, matterExist.getBankLogo(bankCode).logo);
							}
						}
						if(stringUtil.isEmpty(htmls)) {
							htmls = "<p class='nobind-img'><img src='../../img/icon/icon_ka.png' /></p><p class='nobind-text'>您还未绑定银行卡，快点击“添加”<br />绑定第一张银行卡吧~</p>";
						} else {
							htmls = '<ul class="card-list">' + htmls + '</ul>';
						}
						cardListEle.html(htmls);
					} else {
						$.toast(data.msgContent);
					}
				});
			},
			//设置银行卡元素的类名
			getBgClass: function(type) {
				var redClass = ["ICBC", "CMB", "BOC", "CITIC", "GDB", "HXB", "HSB", "CZB", "BOB"];
				var greenClass = ["ABC", "PSBC"];
				var blueClass = ["CCB", "BCM", "CIB", "CMBC", "SPDB", "CBHB"];
				var purpleClass = ["CEB"];
				var yellowClass = ["PAB"];
				if(stringUtil.isInArray(redClass, type)) {
					return "card-red";
				}
				if(stringUtil.isInArray(greenClass, type)) {
					return "card-green";
				}
				if(stringUtil.isInArray(blueClass, type)) {
					return "card-blue";
				}
				if(stringUtil.isInArray(purpleClass, type)) {
					return "card-purple";
				}
				if(stringUtil.isInArray(yellowClass, type)) {
					return "card-yellow";
				}
				return "card-yellow";
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

				//添加银行卡
				addCardEle.bind("tap", function() {

					var href = constant.rootPath + '/page/account/account_bindcard.html',
						param = {
							bindType: 1,
							fromPage: "mycard"
						},
						gotoBindPage = function() {
							openWindow(href, href, param);
						};
					if(login.getLoginInfo().certification >= 1) {
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
				});

				//点击银行卡跳转至解绑页面
				cardListEle.on("tap", ".card-item", function() {
					var cardNoText = stringUtil.infoProtectDeal({
						targetStr: $(this).attr("cardNo").substr(6),
						keepEnd: 4
					});
					unbindBtnEle.attr("cardNo", $(this).attr("cardNo"));
					cardShowEle.attr("class", "card-desbox " + $(this).attr("cardcolor"));
					cardShowlogoEle.html('<span></span><img src="../../img/icon/' + $(this).attr("cardicon") + '" />');
					cardShowNameEle.html($(this).attr("cardname"));
					cardShowTypeEle.html($(this).attr("cardtype"));
					cardShowCodeEle.html("****** " + cardNoText);
					viewApi.go("#cardInfoView");
				});

				//提交
				unbindBtnEle.bind("tap", function() {
					var cardNo = $(this).attr("cardNo");
					if(stringUtil.isEmpty(cardNo)) {
						$.toast("删除卡号为空");
						return;
					}
					if(login.getLoginInfo().isPaypwd == 1) {
						var btnArray = ['取消', '确认'];
						$.confirm("您确认要删除此银行卡吗？", "提示", btnArray, function(e) {
							if(e.index == 1) {
								//弹出确认密码输入框
								payPassword.validatePwd({
									userId: userId,
									inputCompleteClose: true,
									successCallback: function(data) {
										self.commitUnbind(data);
									}
								});
							}
						});
					} else {
						$.toast("请先设置支付密码");
						payPassword.setPayPwd({
							userId: userId,
							inputCompleteClose: true,
							successCallback: function(data) {
								$.toast("设置成功");
							}
						});

					}
				});
				
				
				
				
				
				//WEBVIEW自定义事件------------------------Begin---------------------------

				//绑定成功了，刷新列表
				window.addEventListener('bindSuccess', function(event) {

					console.log(plus.webview.currentWebview().id + " bindSuccess--event " + JSON.stringify(event.detail));

					self.getBindBankListData();
				});


				//WEBVIEW自定义事件------------------------End---------------------------

			},

			/**
			 * 请求解绑
			 * @param {Object} pwd:密码
			 */
			commitUnbind: function(pwd) {
				var self = this;
				//密码输完了，请求解绑操作
				postData("app/rest/unbindBkCard", {
					"userId": userId,
					"userName": login.getLoginInfo().acctName,
					"certType": login.getLoginInfo().certType,
					"certNo": login.getLoginInfo().certNo,
					"payPwd": require("./module/crypto").encryptPwd(pwd),
					"bankCardCode": unbindBtnEle.attr("cardNo")
				}, function(data) {
					if(data.resType == "00") {
						$.toast("删除成功");
						viewApi.back(); //  成功了，返回至银行卡列表
						main.getBindBankListData();
					} else {
						$.toast(data.msgContent);
					}
				});
			}
		};
	main.init();

})(mui);
//end