/**
 * 忘记密码了，显示银行卡列表
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./module/public_module");
(function($) {

	var fromPage = requestURL.getParameter("fromPage"),
		addCardEle = $("#addCard"), //添加铵钮
		cardListEle = $("#cardList"), //银行卡列表
		userId = login.getUserId(true),
		cardListHtmlTpl = '<li class="card-item icon-right" pcardcode="{{pCardCode}}" pBankCode="{{pBankCode}}" pcardtype="{{pCardType}}" pcardholder="{{pCardholder}}" pbankname="{{pBankName}}"><img class="card-img" src="{{imagePath}}"><div class="card-info"><span class="card-name">{{bankName}}{{cardNoText}}</span> <span class="card-type">{{cardTypeText}}</span></div></li>',
		main = {
			//初始化执行
			init: function() {
				var self = this;
				self.getData();
				self.bindEvent();
			},

			//获取用户绑定银行卡列表
			getData: function() {

				if(login.getLoginInfo().certification == 0) {
					// 未实名状态下显示未绑定银行卡提示
					cardListEle.html("未绑定银行卡");
					return;
				}

				if(login.getLoginInfo().isPaypwd == 0) {

					cardListEle.html("请先设置支付密码");
					return;
				}

				postData("app/rest/userBindBkCards", {
					"userId": userId
				}, main.handleData);
			},

			//处理数据回调
			handleData: function(data) {

				if(data.resType == "00") {

					var result = data.bindBkCardList,
						listLen = (result && result.length) || 0,
						htmls = '';

					for(var i = 0; i < listLen; i++) {
						var dataItem = result[i],
							bankCardType = dataItem.bankCardType,
							bankCardCode = dataItem.bankCardCode,
							bankName = dataItem.bankName,
							bankCardName = dataItem.bankCardName, //持卡人姓名
							bankCode = dataItem.bankCode, //银行编码
							imagePath = dataItem.imagePath || "../../img/icon/".concat(require("./module/get_resource").getBankLogo(bankCode).logo), //支付卡图标路径
							cardNoText = stringUtil.infoProtectDeal({
								targetStr: bankCardCode,
								cipherLen: 3,
								keepEnd: 4
							}),
							cardTypeText = "";

						switch(bankCardType) {
							case "01":
								cardTypeText = "储蓄卡";
								break;
							case "02":
								cardTypeText = "信用卡";
								break;
							default:
								break;
						}

						htmls += cardListHtmlTpl.replace("{{pCardCode}}", bankCardCode)
							.replace("{{imagePath}}", imagePath)
							.replace("{{pBankCode}}", bankCode)
							.replace("{{pBankName}}", bankName)
							.replace("{{pCardType}}", bankCardType)
							.replace("{{pCardholder}}", stringUtil.infoProtectDeal({
								targetStr: bankCardName,
								keepEnd: 1
							}))
							.replace("{{bankName}}", bankName)
							.replace("{{cardNoText}}", cardNoText)
							.replace("{{cardTypeText}}", cardTypeText);
					}
					cardListEle.html(htmls);

				} else {
					$.toast(data.msgContent);
				}

			},

			//绑定事件监听
			bindEvent: function() {

				//点击银行卡跳转至解绑页面
				cardListEle.on("tap", ".card-item", function() {
					var pCardCode = $(this).attr("pCardCode"),
						pCardType = $(this).attr("pCardType"),
						pCardholder = $(this).attr("pCardholder"),
						pBankCode = $(this).attr("pBankCode"),
						pBankName = $(this).attr("pBankName");

					var href = constant.rootPath + '/page/account/account_bindcard.html',
						param = {
							bindType: 2,
							fromPage: "forgetPwd",
							toPage: fromPage,
							pCardCode: pCardCode,
							pCardType: pCardType,
							pCardholder: pCardholder,
							pBankName: pBankName,
							pBankCode: pBankCode
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

				});

			}
		};
	main.init();

})(mui);
//end