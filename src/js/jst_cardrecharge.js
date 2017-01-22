/**
 * 捷顺通卡充值
 * version:1.0.1
 * created by Fizz/gangheng.huang@jieshun.cn
 */
require("./module/public_module");

(function($) {
	var userid = login.getUserId(true);
	var mobile = login.getLoginInfo(true).mobile;
	var cardPickClass = $(".mycardpick");
	var cardListEle = $("#tc-content");
	var cardBindEle = $("#rech_delbtn");
	var rechGoodsClass = $(".cardgoods");
	var newCardInput = $("#rech_newcard");
	var rechbtnEle = $("#rechbtn");
	var cardCodeVal = requestURL.getParameter("card");
	var cardState = requestURL.getParameter("state");

	var wxCR = {
		marquee: {
			open: false,
			moment: 0,
			top: 0,
			time: 30,
			itemheight: 1.1
		}, // 顶部通知参数 open-开启轮播 time-轮播间隔时间 itemheight-DOM高度
		iscard: false, // 是否绑卡
		pickcard: 0, // 当前选择卡，默认0是默认卡
		newcard: false, // 是否手输入卡号支付
		indexcardstate: "00", // 默认卡状态
		defaultlist: '<li data-price="50" data-pay="50" class="purchase"><p class="card-price">50元</p></li><li data-price="100" data-pay="100" class="purchase"><p class="card-price">100元</p></li><li data-price="200" data-pay="200" class="purchase"><p class="card-price">200元</p></li><li data-price="300" data-pay="300" class="purchase"><p class="card-price">300元</p></li><li data-price="500" data-pay="500" class="purchase"><p class="card-price">500元</p></li><li data-price="1000" data-pay="1000" class="purchase"><p class="card-price">1000元</p></li>',
	};

	var main = {
		//初始化执行
		init: function() {
			var self = this;
			self.getuserInfo();
			self.bindEvent();
			self.marqueeInfo();
		},
		// 顶部通知
		marqueeInfo: function(val) {
			var self = this;
			if(wxCR.marquee.open) {
				var spaceitem = document.getElementsByClassName("marqueeitem");
				wxCR.marquee.moment = wxCR.marquee.moment + 1;
				if(wxCR.marquee.moment % wxCR.marquee.time == 0) {
					wxCR.marquee.top = wxCR.marquee.top - wxCR.marquee.itemheight;
					document.getElementById("marqueestage").style.transition = "top 0.5s";
					document.getElementById("marqueestage").style.top = wxCR.marquee.top + "rem";
					if((wxCR.marquee.itemheight * (spaceitem.length - 1)) == Math.abs(wxCR.marquee.top)) {
						wxCR.marquee.top = wxCR.marquee.itemheight;
					}
				}
				var marqueeCase = setTimeout(function() {
					self.marqueeInfo();
				}, 100);
			}
		},
		// 根据卡号显示相应的UI
		getuserInfo: function() {
			var self = this;
			$("#rech_delbtn").removeClass("none");
			$(".rechcardbox").addClass("none");
			$(".rechcardbox").eq(0).removeClass("none");
			self.cardBase(cardCodeVal, cardState);
			wxCR.indexcardstate = cardState;
			switch(wxCR.indexcardstate) { // "00"
				case "00":
					$(".rechcardstyle img").addClass("none");
					$(".rechcardstyle img").eq(0).removeClass("none");
					break;
				case "13":
					$(".rechcardstyle img").addClass("none");
					$(".rechcardstyle img").eq(4).removeClass("none");
					break;
				default:
					$(".rechcardstyle img").addClass("none");
					$(".rechcardstyle img").eq(5).removeClass("none");
			}
		},
		// 根据卡号获取相应的充值规格
		cardBase: function(mycard, sta) {
			var self = this;
			if(!stringUtil.isEmpty(mycard)) { // 已绑卡
				self.cardPickList("off");
				postData("app/rest/balancejstCard", { // 查余额
					"cardCode": mycard
				}, function(data) {
					$("#jst_mybal").html(parseFloat(data.data.acctBal / 100).toFixed(2));
					$("#jst_mycard").html("卡号" + stringUtil.infoProtectDeal({
						targetStr: mycard,
						keepEnd: 4,
						cipherLen: 3
					}));
					$("#jst_mycard").attr("data-code", mycard);
					$(".cardgoods").html(wxCR.defaultlist);
					if(sta == "01" || sta == "13" || sta == "14") {
						self.rechFalse();
					} else {
						self.rechTrue();
					}
				}, null, {
					requestType: "GET" // POST
				});
			} else { // 未绑卡
				$(".cardgoods").html(wxCR.defaultlist);
				$("#cardhosttype").html("");
				$.confirm("您未绑定任何卡片，是否先绑卡？", "提示", ["去绑卡", "继续充值"], function(e) {
					if(e.index == 0) {
						openWindow("jst_bindcard.html");
					}
				});
			}
		},
		bindEvent: function() {
			var self = this;
			// 选择卡支付
			cardPickClass.bind("tap", function() {
				self.cardPickList("on");
			});
			// 关闭弹窗
			$("body").on("tap", ".tc-close", function() {
				self.cardPickList("off");
			});
			// 手动输入卡号 
			cardListEle.on("tap", "#manualbtn", function() {
				self.manualPick();
				self.rechFalse();
				self.cardPickList("off");
			});
			// 卡切换 
			cardBindEle.bind("tap", function() {
				self.cardPickList("on");
			});
			// 选择充值规格
			rechGoodsClass.on("tap", "li", function() {
				if(wxCR.iscard) {
					if($(this).attr("class") != "sellout") {
						$("#actualpay").html($(this).attr("data-price") + "元");
						$("#purchasepay").html($(this).attr("data-pay") + "元");
						$("#actualpay").attr("data-val", $(this).attr("data-price"));
						$("#purchasepay").attr("data-val", $(this).attr("data-pay"));
						$(".cardgoods li").removeClass("pickme");
						$(this).addClass("pickme");
						var payprice = $(this).attr("data-price");
					}
				}
			});
			// 选择卡充值
			cardListEle.on("tap", ".rechcarditem", function() {
				var cardIndex = $(this).attr("data-index");
				var mycardcode = $(this).attr("data-card");
				var stateclass = $(this).attr("class");
				$(".rechcardbox").addClass("none");
				$(".rechcardbox").eq(0).removeClass("none");
				wxCR.iscard = true;
				if(stateclass.indexOf("cardst2") == -1 && stateclass.indexOf("cardst3") == -1) {
					wxCR.pickcard = cardIndex;
					wxCR.newcard = false;
					if(cardIndex == 0) { // 默认主卡在list中的索引为0
						$(".rechcardstyle img").addClass("none");
						$(".rechcardstyle img").eq(0).removeClass("none");
					} else {
						cardIndex = (cardIndex % 2 == 0) ? 2 : 1;
						$(".rechcardstyle img").addClass("none");
						$(".rechcardstyle img").eq(cardIndex).removeClass("none");
					}
					$("#jst_mycard").html("卡号" + stringUtil.infoProtectDeal({
						targetStr: mycardcode,
						keepEnd: 4,
						cipherLen: 3
					})); // 显示卡号 
					$("#jst_mycard").attr("data-code", mycardcode);
					//获取余额
					self.cardBase(mycardcode);
				}
				self.cardPickList("off");
			});
			// 卡输入框失去焦点
			newCardInput.bind("blur", function() {
				self.rechBlur($(this).val().replace(/\D/g, ""));
			});
			// 监听手机号码输入
			newCardInput.bind("input", function() {
				var realvalue = this.value.replace(/\D/g, "");
				if(realvalue.length > 19) {
					realvalue = realvalue.substring(0, 19);
				} else if(realvalue.length >= 6) {
					if(realvalue.substring(0, 6).indexOf("880755") == -1) {
						self.rechFalse();
						$("#cardhosttype").html('<p class="card-warn fc-orange">请输入正确的捷顺通卡号</p>');

					} else {
						$("#cardhosttype").html('');
						if(realvalue.length == 19) {
							self.rechTrue();
							//self.mobileblur();
							self.cardBase(realvalue);
							this.blur();
						} else {
							self.rechFalse();
						}
					}
				}
				this.value = stringUtil.FormatNumber(realvalue, "jstcard"); // 手机号码格式化
			});
			// 确定充值
			rechbtnEle.bind("tap", function() {
				if($(this).attr("data-btn") == "pass") {
					if(wxCR.newcard) {
						var paycardcode = $("#rech_newcard").val().replace(/\D/g, "");
					} else {
						var paycardcode = $("#jst_mycard").attr("data-code");
					}
					var kaohao = parseInt(paycardcode.substr(12, 6));
					var num1 = 201701;
					var num2 = 201750;
					var num3 = 202751;
					var num4 = 203000;
					var num5 = 201613;
					var num6 = 201625;
					if((kaohao >= num1 && kaohao <= num2) || (kaohao >= num3 && kaohao <= num4) || (kaohao >= num5 && kaohao <= num6)) {
						$.alert("请您到当地客服点充值", "提示", "我知道了");
					} else {

						if($.os.wechat) {
							//微信支付
							//调用微信支付
							require("./module/weixin_pay").pay({
								method: "testPay",
								params: {
									//								注意： 充值请求， 不可删除
									out_trade_no: ('' + Math.random() * 10).substr(2),
									body: "捷顺通充值",
									total_fee: parseFloat($("#purchasepay").attr("data-val")) * 100, // 支付金额 
									mch_create_ip: "14.215.135.104",
									sub_openid: "", // openid
									chongzhi_fee: parseFloat($("#actualpay").attr("data-val")) * 100, // 实际到账金额 
									cardno: paycardcode
								},
								paySuccess: self.wxpaySuccess,
								payFail: self.wxpayFail
							});
						} else {
							//发起银联支付
							var href = constant.httpServer.concat("app/rest/rechargeJstCard"),
								param = {
									cardNo: paycardcode,
									totalFee: parseFloat($("#purchasepay").attr("data-val")),  // 生产入参 parseFloat($("#purchasepay").attr("data-val")) * 100
									notifyUrl: requestURL.createURL(constant.base + "page/jst/jst_result.html", {
										res: "01",
										newcard: wxCR.newcard ? "02" : "01"
									}),
									userId: userid,
									userMobile: mobile
								};
							openWindow(href, href, param);
							//							postData("app/rest/rechargeJstCard", {
							//								cardNo: paycardcode,
							//								totalFee: parseFloat($("#purchasepay").attr("data-val")) * 100,
							//								notifyUrl: "xxx",
							//								userId: userid,
							//								userMobile: mobile
							//							}, function(res) {
							//								console.log(res);
							//							});
						}

					}
				}
			});
		},

		/**
		 * 微信支付成功之后回调
		 */
		wxpaySuccess: function() {

			if(wxCR.pickcard == -1) {
				var rq_url = "http://weixinpay.jieshunpay.cn/index.php/home/AccountBind/sendTradWarnMessage";
			} else {
				var rq_url = "http://weixinpay.jieshunpay.cn/index.php/home/AccountBind/sendTradWarnYe";
			}

			postData(rq_url, {
				openid: "", // openid
				usercode: paycardcode,
				money: parseFloat($("#actualpay").attr("data-val"))

			}, function() {
				//充值成功，跳到结果页

				var href = constant.rootPath + "/page/jst/jst_result.html";
				openWindow(href, href, {
					card: paycardcode.slice(-4),
					res: "01",
					pay: $("#actualpay").attr("data-val")
				})

			});

		},

		/**
		 * 微信支付失败的回调
		 * @param {Object} res
		 */
		wxpayFail: function(res) {

			switch(res.resType) {
				case "00":
					$.alert("无效卡号", "提示", "我知道了");
					break;
				case "14":
					$.alert("无效卡号", "提示", "我知道了");
					break;
				case "54":
					$.alert("该卡已过期", "提示", "我知道了");
					break;
				case "41":
					$.alert("该卡已挂失", "提示", "我知道了");
					break;
				case "61":
					$.alert("交易金额超限", "提示", "我知道了");
					break;
				case "62":
					$.alert("受限制的卡", "提示", "我知道了");
					break;
				case "70":
					$.alert("单笔交易金额过大", "提示", "我知道了");
					break;
				case "94":
					$.alert("重复交易", "提示", "我知道了");
					break;
				case "4B":
					$.alert("超过最大金额限制", "提示", "我知道了");
					break;
				case "B7":
					$.alert("累计充值超过当天上限", "提示", "我知道了");
					break;
				case "C7":
					$.alert("累计交易次数超过当天上限", "提示", "我知道了");
					break;
				case "500":
					$.alert("系统繁忙，请稍后再试", "提示", "确定");
					break;
				default:
					$.alert("系统繁忙，请稍后再试", "提示", "确定");
					break;
			}

		},

		// 展示手动输入卡号UI	
		manualPick: function() {
			$(".rechcardbox").addClass("none");
			$(".rechcardbox").eq(1).removeClass("none");
			$(".rechcardstyle img").addClass("none");
			$(".rechcardstyle img").eq(3).removeClass("none");
			$("#rech_newcard").val("");
			$("#cardhosttype").html("");
			wxCR.iscard = false;
			wxCR.newcard = true;
		},
		// 已绑卡列表弹窗
		cardPickList: function(type) {
			var self = this;
			if(type == "on") { // 开启弹窗
				postData("app/rest/userBindBkCards", { // 查已绑捷顺通卡
					"userId": userid
				}, function(data) {
					if(!stringUtil.isEmpty(data.bindBkCardList)) {
						var mycardhtml = "";
						var cardListIndex = 0;
						$.each(data.bindBkCardList, function(key, val) {
							var mycardclass = "none";
							if(cardCodeVal == val.bankCardCode) {
								mycardclass = ""
							}
							if(val.bankCardType == "04") {
								mycardhtml += '<p class="rechcarditem card-bindcard" data-index="' + cardListIndex + '" data-card="' + val.bankCardCode + '"><span class="card-bindcode">****** *********' + val.bankCardCode.substr(-4) + '</span><span class="card-bindcur ' + mycardclass + '"><img src="../../img/icon/micon_11.png" /></span></p>';
							    cardListIndex = cardListIndex + 1;
							}
						});
						document.addEventListener('touchmove', self.bwDefault, false); // 阻止滑动屏幕
						$(".tc-show").removeClass("none");
						cardListEle.html('<p class="card-bindti"><span class="tc-close card-bindout"><img src="../../img/icon/micon_2.png" /></span>选择充值账户</p><p class="card-bindline"></p>' + mycardhtml + '<p id="manualbtn" class="card-bindother icon-right">手动输入</p>');
					} else {
						$.alert("出错了，请稍后再试", "提示", "确定");
					}
				}, null, {
					requestType: "POST" // POST
				});
			}
			if(type == "off") { // 关闭弹窗
				$(".tc-show").addClass("none");
				document.removeEventListener('touchmove', self.bwDefault, false);
			}
		},
		// 卡号正常时的UI状态
		rechTrue: function() {
			$(".cardgoods li").css({
				"border-color": "#ea5920",
				"color": "#ea5920"
			});
			$(".cardgoods li").eq(0).addClass("pickme");
			$(".cardgoods .rechprice").addClass("fc-yellow");
			$("#actualpay").html($(".cardgoods li").eq(0).attr("data-price") + "元");
			$("#purchasepay").html($(".cardgoods li").eq(0).attr("data-pay") + "元");
			$("#actualpay").attr("data-val", $(".cardgoods li").eq(0).attr("data-price"));
			$("#purchasepay").attr("data-val", $(".cardgoods li").eq(0).attr("data-pay"));
			$("#rechbtn").addClass("click-orange fc-orange line-orange");
			$("#rechbtn").removeClass("fc-gray-878787 line-gray");
			$("#rechbtn").attr("data-btn", "pass");
			$(".payshowbox").removeClass("none");
			wxCR.iscard = true;
		},
		// 卡号未完整或异常时的UI状态
		rechFalse: function() {
			$(".cardgoods li").css({
				"border-color": "#d3d3d3",
				"color": "#878787"
			});
			$(".cardgoods li").removeClass("pickme");
			$(".cardgoods .rechprice").removeClass("fc-yellow");
			$("#actualpay").html("");
			$("#purchasepay").html("");
			$("#cardhosttype").html("");
			$("#actualpay").attr("data-val", "");
			$("#purchasepay").attr("data-val", "");
			$("#rechbtn").addClass("fc-gray-878787 line-gray");
			$("#rechbtn").removeClass("click-orange fc-orange line-orange");
			$("#rechbtn").attr("data-btn", "lock");
			$(".cardgoods").html(wxCR.defaultlist);
			$(".payshowbox").addClass("none");
			wxCR.iscard = false;
		},
		// 手输卡号校验提示
		rechBlur: function(val) {
			var self = this;
			if(val.substring(0, 6).indexOf("880755") == -1) {
				self.rechFalse();
				$("#cardhosttype").html('<p class="card-warn fc-orange">请输入正确的捷顺通卡号</p>');

			} else if(val.length > 6 && val.length < 19) {
				self.rechFalse();
				$("#cardhosttype").html('<p class="card-warn fc-orange">请输入19位完整的捷顺通卡号</p>');

			}
		},
		bwDefault: function(e) {
			e.preventDefault();
		},
	};

	main.init();

})(mui);

//end