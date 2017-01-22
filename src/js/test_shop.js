/**
 * 测试商户
 * version:1.0.1
 * created by aj/chengjun.zhu@jieshunpay.cn
 */
require("./module/public_module");
(function($) {
	var subBtn = $("#subBtn"),
		paySum = $("#paySum"),
		main = {
			init: function() {
				var self = this;
				self.bindEvent();

			},
			bindEvent: function() {
				paySum.bind("input",function(){
//					var realvalue = this.value.replace(/\D/g, "");
//					$(this).val(realvalue);
					main.validate();
				});
				//购买按钮
				subBtn.bind("tap", function() {

					main.postMes();
				})
			},
			postMes: function() {
				var url = constant.cashCenterHttpServer.concat("jst_cash_center_demo/pay"),
					params = {

						"outTradeNo": main.getOrderId(), //订单号
						"merchantNo": "1000099", //商户号
						"userMobile": login.getLoginInfo().mobile, //"13425155396",
						"amount": parseInt(parseFloat(paySum.val()) * 100), //支付金额
						"currency": "CNY", //
						"orderDesc": "测试订单描述", //订单描述
						"orderName": "测试订单", //订单名称
						"orderNotifyUrl": constant.base.concat("page/pay/pay_result.html"), //www.baidu.com",
						"orderFrontNotifyUrl": constant.base.concat("page/pay/pay_result.html"),
						"expireTime": "20180409121212" //订单过期时间

					};

				postData(url, params, function(data) {
					if(data.resType == "00") {
						var cashUrl = data.result.url;
						openWindow(cashUrl);
					} else {
						var mes = data.message,
							title = " ",
							btnArray = ["知道了"];
						mui.confirm(mes, title, btnArray, function(e) {
							if(e.index == 0) {

							} else {

							}
						})
					}

				}, null, {
					requestType: "POST"
				});
			},
			//获取当前时间
			getOrderId: function() {
				var myDate = new Date();
				var year = myDate.getFullYear();
				var month = myDate.getMonth() + 1;
				var strDate = myDate.getDate();
				var hour = myDate.getHours();
				var minutes = myDate.getMinutes();
				var seconds = myDate.getSeconds();
				var currDate = JSON.stringify(year) + JSON.stringify(month) + JSON.stringify(strDate) + JSON.stringify(hour) + JSON.stringify(minutes) + JSON.stringify(seconds);

				var num = parseInt(Math.random(0, 1) * 1000000)
				var orderId = "OR" + JSON.stringify(num) + currDate
				return orderId;
			},
			/**
			 * 验证充值金额输入是否合法
			 */
			validate: function() {

				var reg = /^\d+(\.\d{0,2})?$/g,
					moneyVal = paySum.val();

				if(!reg.test(moneyVal)) {
					var _value = moneyVal.substr(0, moneyVal.length - 1);
					paySum.val(_value);

					return false;
				}
		

				return true;

			}
		};
	main.init();

})(mui)