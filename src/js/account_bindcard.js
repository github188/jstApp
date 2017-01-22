/**
 * 添加银行卡
 * version:1.0.1
 * created by aj/chengjun.zhu@jieshunpay.cn
 */
require("./module/public_module");
(function($) {
	var bindCardMainTitleEle = $("#bindCardMainTitle"), //页面标题

		//////////实名认证持卡人
		alreadyBindCardholderViewEle = $("#alreadyBindCardholderView"), //已经实名认证持卡人面板
		alreadyBindCardholderEle = $("#alreadyBindCardholder"), //实名认证持卡人姓名

		//////////银行卡号
		bankCardNoEle = $("#bankCardNo"), //卡号------一键支付:6217003320034009100----快捷支付:6217003320034459100
		bankCardNoErrorTipEle = $("#bankCardNoErrorTip"), //卡号输错提示
		bankCardNoConfirmBtnEle = $("#bankCardNoConfirmBtn"), //卡号输完后的下一步铵钮

		//////////信用卡信息
		creditCardViewEle = $("#creditCardView"), //信用卡信息面板
		safeCodeEle = $("#safeCode"), //卡背面末三位数字
		creditExpiryEle = $("#creditExpiry"), //有效限期
		creditExpiryMonth = $(".c-e-month"), //有效期：月
		creditExpiryYear = $(".c-e-year"), //有效期：年
		safeCodeErrorTipEle = $("#safeCodeErrorTip"), //安全码错误提示
		creditExpiryErrorTipEle = $("#creditExpiryErrorTip"), //有效期错误提示

		//////////银行预留信息
		cardholderViewEle = $("#cardholderView"), //持卡人姓名面板
		cardholderEle = $("#cardholder"), //持卡人姓名
		idCardNoViewEle = $("#idCardNoView"), //证件号面板
		idCardNoEle = $("#idCardNo"), //证件号
		mobileEle = $("#mobile"), //银行预留手机号
		cardholderErrorTipEle = $("#cardholderErrorTip"), //持卡人姓名错误提示
		idCardNoErrorTipEle = $("#idCardNoErrorTip"), //证件号错误提示
		mobileErrorTipEle = $("#mobileErrorTip"), //银行预留手机号错误提示
		bankRemainConfirmBtnEle = $("#bankRemainConfirmBtn"), //银行预留信息输完后的下一步铵钮

		//////////银行卡类型,名称
		cardTypeContainerEle = $("#cardTypeContainer"), //银行卡类型面板 

		//////////根据是否首次绑卡，或者找回密码，或者再次绑卡显示不同的VIEW
		firstBindTip = $(".first-bind-tip"), //首次绑卡时显示
		remainInfoTip = $(".remain-info-tip"), //找回支付密码时显示
		agreementTip = $(".agreement-tip"), //绑卡或再次绑卡时显示

		bankCardLenMax = 19, //银行卡号最大长度
		bankCardLenMin = 16, //银行卡最小长度
		mobileLen = 11, //手机号长度
		idCardNoLen = 18, //身份证长度
		safeCodeLen = 3, //卡背三位长度
		bankPicker, creditExpiryPicker, cardNo6 = "", //卡号前六位
		CARD_TYPE_CREDIT = "02", //卡类型信用卡
		CARD_TYPE_DEBIT = "01", //卡类型储蓄卡

		//////////页面传参
		isadd = requestURL.getParameter("isadd"), //是否是添加操作;1为添加，其它为绑卡。添加卡时不显示姓名，身份证号。绑卡为首次绑
		fromPage = requestURL.getParameter("fromPage"), //上个页面是哪里
		fromPageId = requestURL.getParameter("fromPageId"), //上个页面的ID，APP环境根据ID获取webview
		toPage = requestURL.getParameter("toPage"), //绑定成功之后跳至哪里
		bindType = requestURL.getParameter("bindType"), // 鉴权目的1绑卡,2重置密码,3支付

		//////////页面传参-忘记密码页面传参
		pCardCode = requestURL.getParameter("pCardCode"), //忘记密码页面传参：银行卡号
		pCardType = requestURL.getParameter("pCardType"), //忘记密码页面传参：银行卡类型
		pCardholder = requestURL.getParameter("pCardholder"), //忘记密码页面传参：银行卡持卡人姓名
		pBankName = requestURL.getParameter("pBankName"), //忘记密码页面传参：银行名称
		pBankCode = requestURL.getParameter("pBankCode"), //忘记密码页面传参：银行编码

		//////////模块引入

		InputValidators = require("./module/input_validators"),
		pickerData = require("./module/picker_init_data"),
		payPassword = require("./module/pay_password"),
		smsPanel = require("./module/popup_sms_input"),
		//		oldBack = $.back,
		view, viewApi, userInfo, //用户信息
		bindSuccess = false, //绑卡是否成功了
		bindCardNo = "", //绑定的卡号
		main = {
			//初始化执行
			init: function() {
				var self = this;

				$.init();
				//初始化单页view
				viewApi = $('#app').view({
					defaultPage: "#bindCardMainView"
				});
				view = viewApi.view;

				self.initView();

				self.bindEvent();

			},

			//自定义返回
			defindBack: function() {
				if($.os.plus) {
					//APP返回之前，刷新上个页面
					$.plusReady(function() {

						var param = {};

						if(bindSuccess) {
							param.bindCardNo = bindCardNo;
						}

						$.fire(plus.webview.getWebviewById(fromPageId), "bindSuccess", param);

						plus.webview.currentWebview().close();
					});
				} else {
					//存储临时会话，说明绑定成功
					if(bindSuccess) {
						//绑定成功 ，将绑定的卡号临时存储，方便返回到支付页面时将绑定的新卡作为默认支付方式
						sessionStorage.setItem("bindCardNo", bindCardNo);
					} else {
						sessionStorage.removeItem("bindCardNo");
					}
					winExp.back();
				}

			},

			initView: function() {

				var self = this,
					_init = function() {
						if("1" == isadd) {

							//添加卡操作，不显示输入姓名，身份证号码，直接显示实名用户
							bindCardMainTitleEle.html("添加银行卡");
							cardholderViewEle.addClass("mui-hidden");
							cardholderEle.attr("minlength", 0);
							idCardNoViewEle.addClass("mui-hidden");
							idCardNoEle.attr("minlength", 0);
							alreadyBindCardholderEle.val(userInfo.acctName);
							alreadyBindCardholderViewEle.removeClass("mui-hidden");
							$(".bind-tip").html("请绑定持卡人本人的银行卡");

						} else {
							//首次绑卡显示绑卡提示
							firstBindTip.removeClass("mui-hidden");
							$(".bind-tip").html("请绑定此账号本人的银行卡");
						}
					};

				//初始化信用卡有效期列表
				creditExpiryPicker = new $.PopPicker({
					layer: 2
				});
				creditExpiryPicker.setData(pickerData.creditExpiryDate());

				if(2 == bindType) {
					//这里是忘记密码跳转过来，此时应该带有姓名，卡号等字段一起传来，目的是提醒用户完善信息，并再次绑卡找回密码

					bindCardMainTitleEle.html("忘记支付密码");

					//显示保密提示，不显示协议\首次绑定提示
					remainInfoTip.removeClass("mui-hidden");
					firstBindTip.addClass("mui-hidden");
					$(".bind-tip").addClass("mui-hidden");
					agreementTip.addClass("mui-hidden");

					if(!stringUtil.isEmpty(pCardCode)) {
						bankCardNoEle.attr("placeholder", pBankName.concat(stringUtil.infoProtectDeal({
							targetStr: pCardCode,
							cipherLen: 3,
							keepEnd: 4
						})));
					}

					if(!stringUtil.isEmpty(pCardholder)) {
						cardholderEle.attr("placeholder", pCardholder);
					}

					main.switchShowCardType(pCardType, pBankName, pBankCode);

					//初次加载不需要显示银行提示
					bankCardNoErrorTipEle.removeClass("error").removeClass("normal-tip").html("");

				}

				if(3 == bindType) {
					var userId = requestURL.getParameter("userId");
					//支付跳转过来，根据传参userId获取信息
					if(!stringUtil.isEmpty(userId)) {
						self.getUserInfo(userId, _init);
					} else {
						userInfo = login.getLoginInfo(true);
						_init();
					}
				} else {
					userInfo = login.getLoginInfo(true);
					_init();
				}

				smsPanel.init()
			},

			/**
			 * 获取用户信息
			 * @param {Object} userId
			 */
			getUserInfo: function(userId, callback) {
				//查询用户是否设置了支付密码
				postData("app/rest/getMemberInfo", {
					"usrLgName": userId
				}, function(data) {
					if(data.resType == "00") {
						userInfo = data.selUsersInfoListBeans[0];
					}
					if(!userInfo) {
						$.toast("获取用户信息出错");
					}
				}, null, {
					requestType: "get"
				});
			},

			//验证输入项是否合规
			validate: {

				/**
				 * 验证银行卡号
				 */
				validateBankCardNo: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', bankCardNoErrorTipEle, APPwarn.bankcard.none, bankCardNoEle.val());
					validators.addValidator('isValidBankCardNo', bankCardNoErrorTipEle, APPwarn.bankcard.err, bankCardNoEle.val());
					validators.addValidator('isNoEmpty', bankCardNoErrorTipEle, "暂不支持此卡类型", cardTypeContainerEle.attr("bankCode"));
					return this.check(validators, bankCardNoErrorTipEle);
				},

				/**
				 * 验证安全码
				 */
				validateSafeCode: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', safeCodeErrorTipEle, APPwarn.safecode.none, safeCodeEle.val());
					validators.addValidator('isValidSafeCode', safeCodeErrorTipEle, APPwarn.safecode.err, safeCodeEle.val());
					return this.check(validators, safeCodeErrorTipEle);
				},

				/**
				 * 验证有效期
				 */
				validateCreditExpiry: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', creditExpiryErrorTipEle, APPwarn.carddate.none, creditExpiryEle.data("val")); // 验证是否为空
					return this.check(validators, creditExpiryErrorTipEle);
				},

				/**
				 * 验证持卡人姓名
				 */
				validateCardholder: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', cardholderErrorTipEle, APPwarn.name.none, cardholderEle.val());
					validators.addValidator('isValidName', cardholderErrorTipEle, APPwarn.name.err, cardholderEle.val());
					return this.check(validators, cardholderErrorTipEle);
				},

				/**
				 * 验证持卡人证件号
				 */
				validateIdCardNo: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', idCardNoErrorTipEle, APPwarn.ident.none, idCardNoEle.val());
					validators.addValidator('isValidIdentityCode', idCardNoErrorTipEle, APPwarn.ident.err, idCardNoEle.val());
					return this.check(validators, idCardNoErrorTipEle);
				},

				/**
				 * 验证预留手机号
				 */
				validateMobile: function() {
					var validators = InputValidators.getInputValidators();
					validators.addValidator('isNoEmpty', mobileErrorTipEle, APPwarn.mobile.none, mobileEle.val());
					validators.addValidator('isValidMobile', mobileErrorTipEle, APPwarn.mobile.err, mobileEle.val());
					return this.check(validators, mobileErrorTipEle);
				},

				/**
				 * 开始验证
				 * @param {Object} validators
				 */
				check: function(validators, tipEle) {
					var result = validators.check();

					if(result) {
						result.element.addClass("error").html(result.errMsg);
					} else {
						tipEle && tipEle.removeClass("error").html("");
					}

					return result;
				}
			},

			/**
			 * 根据卡类型选择显示信用卡面板
			 * @param {Object} bankCardType:卡类型01.02
			 * @param {Object} bankName:银行名称
			 * @param {Object} bankCode：银行编码
			 */
			switchShowCardType: function(bankCardType, bankName, bankCode) {
				if(!stringUtil.isEmpty(bankName) && (CARD_TYPE_DEBIT == bankCardType || CARD_TYPE_CREDIT == bankCardType) && !stringUtil.isEmpty(bankCode)) {
					var bankCardText = "".concat(bankName); //银行卡显示信息

					switch(bankCardType) {
						case CARD_TYPE_DEBIT:
							bankCardText = bankCardText.concat(" 储蓄卡");
							creditCardViewEle.addClass("mui-hidden");
							safeCodeEle.attr("minlength", 0);
							break;
						case CARD_TYPE_CREDIT:
							bankCardText = bankCardText.concat(" 信用卡");
							creditCardViewEle.removeClass("mui-hidden");
							safeCodeEle.attr("minlength", "1"); //设置此值为了验证输入长度>此值时决定铵钮是否可点击
							break;
						default:
							break;
					}
					creditCardViewEle.attr("cardType", bankCardType.toString());

					//已经获取到是哪个银行了，禁用选择卡类型
					cardTypeContainerEle.find(".card-name").html(bankCardText);
					cardTypeContainerEle.attr("bankCode", bankCode);
					cardTypeContainerEle.attr("bankName", bankName);

					//获取银行LOGO及背景色
					var bankLogoObj = require("./module/get_resource").getBankLogo(bankCode),
						bankBgColor = bankLogoObj.color,
						bankLogo = bankLogoObj.logo;

					cardTypeContainerEle.find(".card-img").attr("src", "../../img/icon/".concat(bankLogo));
					cardTypeContainerEle.css("background", bankBgColor);

					bankRemainConfirmBtnEle.removeClass("default").css({
						"background": "none",
						"border": "1px solid ".concat(bankBgColor),
						"color": bankBgColor
					});

					bankCardNoErrorTipEle.removeClass("error").addClass("normal-tip").html(bankCardText);

				} else {

					bankCardNoErrorTipEle.addClass("error").removeClass("normal-tip").html("暂不支持此卡类型");
					cardTypeContainerEle.find(".card-name").html("暂不支持此卡类型");
					cardTypeContainerEle.attr("bankCode", "");
					cardTypeContainerEle.attr("bankName", "");

				}
			},

			/**
			 * 根据卡号前六位获取卡类型等信息
			 * @param {Object} cardNo
			 */
			toggerCardType: function(cardNo) {

				if(stringUtil.isEmpty(cardNo) || cardNo.length < 6 || cardNo == cardNo6) {
					return;
				}

				postData("app/rest/getCardBinInfo", {
					bankCardNo: cardNo
				}, function(data) {

					var bankCardType = "",
						bankName = "",
						cardName = "",
						bankCode = "";
					if(data.resType == "00") {

						bankCardType = data.bankCardbinlistBean.bankCardType; //卡类型
						bankName = data.bankCardbinlistBean.bankName; //银行卡名称 
						cardName = data.bankCardbinlistBean.cardName; //卡名称
						bankCode = data.bankCardbinlistBean.bankCode; //银行编码，如果获取不到这个值，就说明暂时不能添加此类型卡
					}
					main.switchShowCardType(bankCardType, bankName, bankCode);
					cardNo6 = cardNo;
				}, null, {
					showWait: false, //是否显示等待框,默认显示
					errorToast: false, //是否弹出错误提示,默认弹出
					requestType: "GET"
				});

			},

			/**
			 * 验证银行卡预留信息长度，确认是否可以启用下一步
			 */
			enabledBankRemainConfirmBtn: function() {

				var flag = true, //true表示放开铵钮可点击
					cardType = creditCardViewEle.attr("cardType");
				$("#bankRemainInfoView").find("input").each(function() {

					var inputVal = $(this).val(),
						minlength = $(this).attr("minlength") || 0;

					if(inputVal.length < minlength) {

						//如果输入的长度满足最小长度，则将铵钮置为可点击
						flag = false;
						return;
					}
				});
				if(CARD_TYPE_CREDIT == cardType) {
					//信用卡还需验证有效期
					if(stringUtil.isEmpty(creditExpiryEle.data("val"))) {
						flag = false;
					}

				}
				if(flag) {
					bankRemainConfirmBtnEle.removeClass("disabled");
				} else {
					bankRemainConfirmBtnEle.addClass("disabled");
				}

			},

			//绑定事件监听
			bindEvent: function() {
				var self = this;

				//处理view的后退与webview后退

				$.back = function() {
					if(viewApi.canBack()) { //如果view可以后退，则执行view的后退
						viewApi.back();
					} else { //执行webview后退
						self.defindBack();
					}
				};

				//限制输入长度
				InputValidators.limitInputLength(bankCardNoEle, bankCardLenMax, "number"); //银行卡号长度
				InputValidators.limitInputLength(idCardNoEle, idCardNoLen); //身份证长度
				InputValidators.limitInputLength(mobileEle, mobileLen, "number"); //电话号码长度
				InputValidators.limitInputLength(safeCodeEle, safeCodeLen, "number"); //安全码长度

				//银行卡卡号输入校验
				bankCardNoEle.bind("input", function() {
					var cardCode = $(this).val(),
						cardCodeLen = cardCode.length;
					if(cardCodeLen >= 6) {
						//银行卡输入超过6位后，请求服务器，获取卡类型
						self.toggerCardType(cardCode.slice(0, 6));
						bankCardNoConfirmBtnEle.removeClass("disabled");
					} else {
						bankCardNoErrorTipEle.removeClass("error").removeClass("normal-tip").html("");
						bankCardNoConfirmBtnEle.addClass("disabled");
					}

					if(cardCodeLen >= bankCardLenMin && cardCodeLen <= bankCardLenMax) {
						self.validate.validateBankCardNo();
					}
				});

				/**
				 * 监听所有输入框，判断输入长度是否足够启用确认铵钮
				 */
				$("#bankRemainInfoView").on("input", "input", function() {
					self.enabledBankRemainConfirmBtn();
				});

				//信用卡有效期
				creditExpiryEle.bind("tap", function() {
					creditExpiryPicker.show(function(selectItems) {
						var month = selectItems[1].value,
							year = selectItems[0].value;

						creditExpiryMonth.addClass("has-value").html(month);
						creditExpiryYear.addClass("has-value").html(year);
						creditExpiryEle.data("val", month + "/" + year);
						self.enabledBankRemainConfirmBtn();
					});

				});

				//检查安全码
				safeCodeEle.bind("input", function() {
					if($(this).val().length == safeCodeLen) {
						self.validate.validateSafeCode();
					} else {
						safeCodeErrorTipEle.removeClass("error").html("");
					}
				});

				//姓名输入验证
				cardholderEle.bind("input", function() {

					if($(this).val().length >= 2) {
						self.validate.validateCardholder();
					} else {
						cardholderErrorTipEle.removeClass("error").html("");
					}
				});

				//证件号输入校验
				idCardNoEle.bind("input", function() {
					if($(this).val().length >= idCardNoLen) {
						self.validate.validateIdCardNo();
					} else {
						idCardNoErrorTipEle.removeClass("error").html("");
					}
				});

				// 检查输入的手机号码是否合法
				mobileEle.bind("input", function() {
					if(mobileEle.val().length >= mobileLen) {
						self.validate.validateMobile();
					} else {
						mobileErrorTipEle.removeClass("error").html("");
					}
				});

				//跳转到捷顺金融用户协议
				$(".page-href").bind("tap", function() {
					var href = $(this).data("href");
					if(!stringUtil.isEmpty(href)) {
						if(!stringUtil.isURL(href)) {
							href = constant.rootPath + href;
						}
						openWindow(href);
					}
				});

				//银行卡号输完了，下一步
				bankCardNoConfirmBtnEle.bind("tap", function() {
					if($(this).hasClass("disabled")) {
						return false;
					}

					if(self.validate.validateBankCardNo()) {
						return false;
					}

					if(2 == bindType) {
						if(bankCardNoEle.val() != pCardCode) {
							//找回支付密码时，输的卡号需和点击的银行卡号一致
							bankCardNoErrorTipEle.addClass("error").removeClass("normal-tip").html("银行卡号输入不一致");
							return false;
						}
					}

					if(!userInfo) {
						$.toast("获取用户信息出错");
						return false;
					}

					viewApi.go("#bankRemainInfoView");

				});

				//银行预留信息输完了，下一步
				bankRemainConfirmBtnEle.bind("tap", function() {
					if($(this).hasClass("disabled")) {
						return false;
					}

					var cardType = creditCardViewEle.attr("cardType");
					if(CARD_TYPE_CREDIT == cardType) {
						//信用卡还需验证有效期
						if(self.validate.validateSafeCode() || self.validate.validateCreditExpiry()) {
							return false;
						}

					}

					if("1" == isadd) {
						//非首次绑定卡，不需要验证持卡人姓名和身份证号
						if(self.validate.validateMobile()) {
							return false;
						}
					} else {
						if(self.validate.validateCardholder() || self.validate.validateIdCardNo() || self.validate.validateMobile()) {
							return false;
						}
					}

					self.commit();
				});

				/**
				 * 各个问号提示弹窗
				 */
				$(".icon-ask-container").bind("tap", function() {

					var openType = $(this).attr("openType"),
						title = '',
						content = '';
					switch(openType) {
						case "1":
							//持卡人弹窗
							title = '持卡人说明<span class="icon-right-top-close"></span>';
							content = '<p class="popup-content">为了您的账户资金安全，只能绑定持卡人本人的银行卡。</p>';

							break;
						case "2":
							//安全码弹窗
							title = '安全码说明<span class="icon-right-top-close"></span>';
							content = '<p class="popup-content">安全码是打印在信用卡背面签名区的一组数字，一般是后3位或4位数字</p><img src="../../img/bg/bg_bank_safecode.png">';

							break;
						case "3":
							//有效期弹窗
							title = '有效期说明<span class="icon-right-top-close"></span>';
							content = '<p class="popup-content">有效期是打印在信用卡正面卡号下方，标准格式为月份在前，年份在后的一串数字</p><img src="../../img/bg/bg_bank_credit_date.png">';
							break;
						case "4":
							//预留手机号弹窗
							title = '手机号说明<span class="icon-right-top-close"></span>';
							content = '<p class="popup-content">银行预留的手机号是办理该银行卡时所填写的手机号码。<br/>没有预留、手机号忘记或者已停用，请联系银行客服更新处理。</p>';

							break;
						default:
							break;
					}

					if(stringUtil.isEmpty(content)) {
						return;
					}
					$.confirm(content, title, '', null, "div");

					$(".icon-right-top-close").bind("tap", function() {
						$.closePopup();
					});
				});

			},

			/**
			 * 提交数据
			 */
			commit: function() {
				var self = this,
					commotParam = {
						"userId": userInfo.userId, // 用户编号
						"bankCode": cardTypeContainerEle.attr("bankCode"), //银行编码
						"bankCardNo": bankCardNoEle.val(), // 银行卡号
						"bankCardType": creditCardViewEle.attr("cardType"), // 卡类型
						"bankCardName": cardTypeContainerEle.attr("bankName"), // 卡简称
						"certType": "01", // 证件类型,写死身份证
						"certNo": "1" == isadd ? userInfo.certNo : idCardNoEle.val(), // 证件号码
						"acctName": "1" == isadd ? userInfo.acctName : cardholderEle.val(), // 真实姓名
						"expireDate": (creditExpiryEle.data("val") || "").replace(/\s/g, ""), // 贷记卡有效期
						"checkCode": safeCodeEle.val(), // 贷记卡安全码
						"telphone": mobileEle.val(), // 银行预留手机号码
						"operType": 2 == bindType ? 2 : 1 // 鉴权目的1绑卡2重置密码
					},

					/**
					 * 获取短信验证码，再次获取也是调用这个接口
					 * @param {Object} element
					 */
					getSmsCode = function(element) {

						//调用接口发送短信
						postData("app/rest/firstAuthen", commotParam, function(data) {
							if(data.resType == "00") {
								require("./module/common_util").timeDown(element);
							} else {
								$.toast(data.msgContent);
							}
						})
					},

					firstAuthen = function() {
						postData("app/rest/firstAuthen", commotParam, function(data) {
							if(data.resType == "00") {

								//调用短信验证码

								smsPanel.show({
									smsSended: true,
									mobile: mobileEle.val(),
									doneCallback: self.smsInputComplete,
									responseData: data,
									smsPanel: smsPanel,
									getCodeCallback: getSmsCode
								});

							} else {
								$.toast(data.msgContent);
							}

						});
					};

				firstAuthen();

			},

			/**
			 * 短信验证码输完之后，再进行第二次鉴权
			 */
			smsInputComplete: function(smsVal) {

				var self = this;

				var authenflowNo = self.responseData.authenflowNo;

				postData("app/rest/secondAuthen", {
					"userId": userInfo.userId,
					"authenflowNo": authenflowNo,
					"verifyNum": smsVal,
					"bankCardNo": bankCardNoEle.val(),
					"sourceFrom": "1",
					"operType": 2 == bindType ? 2 : 1
				}, function(data) {
					if(data.resType == "00") {
						self.smsPanel.hide();

						bindSuccess = true; //绑卡是否成功了
						bindCardNo = bankCardNoEle.val(); //绑定的卡号

						switch(bindType) {
							case "1":
								if(userInfo.isPaypwd == 0) {
									$.toast("请设置支付密码");
									payPassword.setPayPwd({
										userId: userInfo.userId,
										successCallback: main.gotoPage,
										beforeback: function() {
											//绑定成功，未设置支付密码直接返回了，则跳转页面
											main.gotoPage();
										}
									});
								}
								if(userInfo.isPaypwd == 1) {
									main.gotoPage();
								}
								break;
							case "2":
								//这里是忘记了支付密码跳过来的，因为现在做的忘记支付密码需重新绑卡找回
								payPassword.resetPwd({
									userId: userInfo.userId,
									successCallback: main.gotoPage,
									beforeback: function() {
										main.defindBack();
									}
								});
								break;
							default:
								main.gotoPage();
						}
					} else {
						$.toast(data.msgContent);
					}

				})
			},

			/**
			 * 绑定成功页面转向
			 */
			gotoPage: function() {

				$.toast("操作成功");
				
				//更新用户缓存信息
				login.updateUserInfo();
				
				if("recharge" == fromPage || "mycard" == fromPage || "pay" == fromPage) {
					//如果是从充值，银行卡列表，支付页面跳转过来，绑定成功之后可以直接返回
					main.defindBack();
				} else {
					//其它页跳转过来，则需判断绑定成功后跳至哪里
					var href = constant.rootPath + "/page/account/",
						gotoLanch = false; //是否需返回首页
					switch(toPage) {
						case "recharge":
							href = href + "account_recharge.html";
							break;
						case "withdraw":
							href = href + "account_withdraw.html";
							break;
						case "pay":
							href = local.getItem("payUrlTmp");
							local.removeItem("payUrlTmp");
							break;
						default:
							gotoLanch = true;
							href = href + "account.html";
							break;
					}

					if($.os.plus) {
						//APP环境下，跳转至指定WEBVIEW，并关闭不需要的WEBVIEW
						$.plusReady(function() {

							if(gotoLanch) {
								//显示首页

								$.fire(require("./module/webview_opr").getLaunchWebview(), "changeTab", {
									toIndex: 1
								});

								require("./module/webview_opr").getLaunchWebview().show("slide-in-right", constant.duration);

							} else {
								openWindow(href);
							}

							setTimeout(function() {
								var noCloseWebview = gotoLanch ? null : plus.webview.getWebviewById(href);
								require("./module/webview_opr").closeLanuchOther(noCloseWebview);
							}, 500);
						});
					} else {
						openWindow(href);
					}
				}

			}

		};
	main.init();

})(mui)