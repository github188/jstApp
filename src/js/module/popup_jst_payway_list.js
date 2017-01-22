/**
 * 支付方式列表
 * version:1.0.1
 * {
			amount: 0, //余额
			wrapper: null, //将HTML添加至哪个元素上
			payCardQueryList: null, //支付方式数据列表
			selectedCallback: function() {}, //选择完支付方式之后回调
			newCardPay: function() {}, //使用新卡支付回调
			defaultCardNo: "" //默认使用哪个卡支付，此参数表示 选择了某一个新卡支付
		}
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./mui_expansion");

module.exports = (function($) {

	var returnResult = {},
		PAYWAY_LIST_CLASS = ".popup-jst-payway-list", //列表面板
		PAYWAY_ITEM_CLASS = ".p-j-p-l-item", //列表项
		stringUtil = require("./string_util");

	returnResult.create = function(options) {
		returnResult.options = $.extend({
			amount: 0, //余额
			defaultCardNo: "" //默认使用哪个卡支付，此参数表示 选择了某一个新卡支付
		}, options);
		return returnResult._initElements();
	};

	//创建DOM
	returnResult._initElements = function() {

		var self = this,
			defaultPayWayTmp = {};

		if(self.options.wrapper && self.options.wrapper[0]) {

			var resultData = self.options.payCardQueryList,
				dataLen = (resultData && resultData.length) || 0,
				priorityTmp = 0, //先初始化支付优先级

				payWayDataHtmlTpl = '<li class="p-j-p-l-item {{disabledClass}}" id="item{{rid}}" rid="{{rid}}" payType="{{payType}}" payCardNo="{{payCardNo}}" mechanismCode="{{mechanismCode}}" mechanismName="{{mechanismName}}" mainChannelCode="{{mainChannelCode}}" _amount="{{_amount}}"><img class="p-j-p-l-card-img" src="{{imagePath}}"><div class="p-j-p-l-card-info mui-ellipsis {{hasLimitClass}}"><span class="p-j-p-l-card-name">{{mechanismName}}{{mainChannelCodeText}}</span> <span class="p-j-p-l-card-tip">{{_amountText}}</span></div></li>',
				htmls = '',
				disabledHtmls = '',
				defaultPayCardInfo = {};

			//			resultData.push({
			//				payType: "02",
			//				payCardNo: "6220201010101010101",
			//				mechanismCode: "ICBC",
			//				mechanismName: "工商银行"
			//			});
			//			dataLen += 1;

			for(var i = 0; i < dataLen; i++) {
				//遍历支付方式
				var dataItem = resultData[i],
					payType = dataItem.payType, //支付卡类型	01-余额户，02-借记卡(快捷)，03-贷记卡(快捷)，04-捷顺通卡
					payCardNo = dataItem.payCardNo, //支付卡号
					mechanismCode = dataItem.mechanismCode, //卡所属机构号
					mechanismName = dataItem.mechanismName, //卡所属机构名称
					imagePath = dataItem.imagePath || "../../img/icon/".concat(require("./get_resource").getBankLogo(mechanismCode).logo), //支付卡图标路径
					priority = dataItem.priority, //值越小优先级越高
					_amount = dataItem.amount, //可用额度
					rid = stringUtil.randomString(8), //随机ID
					hasLimitClass = "", //是否存在限额
					_amountText = "",
					disabledClass = "",
					mainChannelCodeText = "";

				dataItem.rid = rid; //给数据项设置一个临时ID,为了选择支付方式时判断哪个是选中

				if(!stringUtil.isEmpty(payCardNo)) {

					mainChannelCodeText = stringUtil.infoProtectDeal({
						targetStr: payCardNo,
						keepEnd: 4,
						cipherLen: 3
					});

					if(!stringUtil.isEmpty(self.options.defaultCardNo) && self.options.defaultCardNo == payCardNo) {
						//传值过来的卡号和列表里的卡号匹配，则使用传参过来的卡支付
						defaultPayCardInfo = dataItem;
					}
				}
				var canPayflag = true; //支付方式是否支持
				if("01" == payType || "04" == payType) {

					switch(payType) {
						case "01":
							imagePath = "../../img/icon/icon_jstcard_pay.png"
							break;
						case "04":
							imagePath = "../../img/icon/icon_jst_logo.png"
							break;
						default:
							break;
					}

					hasLimitClass = "has-limit";
					//如果是余额户或者捷顺通卡，则显示余额
					_amountText = "余额:" + (_amount / 100.00).toFixed(2) + "元";
					if(_amount < self.options.amount) {
						//如果余额不足支付本次金额，则置灰
						disabledClass = "disabled";
						_amountText += "(余额不足)";
						canPayflag = false;
					}
				}

				var _htmlTpl = payWayDataHtmlTpl.replace(/{{rid}}/g, rid)
					.replace("{{disabledClass}}", disabledClass)
					.replace("{{payType}}", payType)
					.replace("{{payCardNo}}", payCardNo)
					.replace("{{mechanismCode}}", mechanismCode)
					.replace(/{{mechanismName}}/g, "01" == payType ? (payType == "01" ? "余额支付" : "捷顺通卡") : mechanismName)
					.replace("{{mainChannelCodeText}}", mainChannelCodeText)
					.replace("{{_amount}}", _amount)
					.replace("{{imagePath}}", imagePath)
					.replace("{{hasLimitClass}}", hasLimitClass)
					.replace("{{_amountText}}", _amountText);

				if(canPayflag) {
					htmls += _htmlTpl;
				} else {
					disabledHtmls += _htmlTpl;
				}

				if(canPayflag) {

					if($.isEmptyObject(defaultPayWayTmp)) {

						//第一次赋值

						priorityTmp = priority;
						defaultPayWayTmp = dataItem;
					}
					if(priority < priorityTmp) {
						//遇到优先级比较小的，则设置给初始化的值，相当于比较得到最小值
						priorityTmp = priority;
						defaultPayWayTmp = dataItem;
					}
				}

			}

			self.options.wrapper.html('<ul class="popup-jst-payway-list">{{payCardListHtmls}}<li class="p-j-p-l-item icon-right" taptype="2"><div class="p-j-p-l-card-info mui-ellipsis"><span class="p-j-p-l-card-name">使用新卡支付</span></div></li>{{disabledHtmls}}</ul>'
				.replace("{{payCardListHtmls}}", htmls)
				.replace("{{disabledHtmls}}", disabledHtmls));

			//选中支付方式

			if(!stringUtil.isEmpty(defaultPayCardInfo)) {
				defaultPayWayTmp = defaultPayCardInfo;
			}

			var selectId = defaultPayWayTmp.rid;
			$(PAYWAY_LIST_CLASS + " " + PAYWAY_ITEM_CLASS).removeClass("selected");
			$("#item" + selectId).addClass("selected");
		}

		returnResult.initEvent();
		return defaultPayWayTmp;
	};

	//绑定事件
	returnResult.initEvent = function() {

		var self = this;

		/**
		 * 支付方式项点击事件
		 */
		$(PAYWAY_LIST_CLASS).on("tap", PAYWAY_ITEM_CLASS, function() {

			if($(this).hasClass("disabled")) {
				return;
			}

			var taptype = $(this).attr("taptype");
			if("2" == taptype) {
				//使用新卡支付
				self.options.newCardPay && self.options.newCardPay();
				return;
			}

			var selectPaywayObj = {
				payType: $(this).attr("payType"),
				payCardNo: $(this).attr("payCardNo"),
				mechanismCode: $(this).attr("mechanismCode"),
				mechanismName: $(this).attr("mechanismName"),
				imagePath: $(this).find("img").attr("src"),
				amount: $(this).attr("_amount"),
				mainChannelCode: $(this).attr("mainChannelCode"),
				rid: $(this).attr("rid")
			};

			$(PAYWAY_LIST_CLASS).find(PAYWAY_ITEM_CLASS).removeClass("selected");
			$(this).addClass("selected");
			self.options.selectedCallback && 　self.options.selectedCallback(selectPaywayObj);

		});

	}

	//API

	return returnResult;
})(mui);