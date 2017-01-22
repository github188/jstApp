/**
 * 选择器数据初始化
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
module.exports = {

	/**
	 * 银行列表
	 */
	bankData: function() {
		var bankList = ['工商银行', '农业银行', '建设银行', '招商银行', '中国银行', '兴业银行', '交通银行', '民生银行', '中信银行', '浦发银行', '平安银行', '光大银行'],
			bankDataObj = new Array();
		for(var key in bankList) {
			bankDataObj.push({
				text: bankList[key],
				value: "",
				children: [{
					text: "储蓄卡",
					value: "01"
				}, {
					text: "信用卡",
					value: "02"
				}]
			})
		}
		return bankDataObj;
	},

	/**
	 * 信用卡有效期列表
	 */
	creditExpiryDate: function() {
		var dateArray = new Array();

		var endYear = 2030; //结束年限
		for(var i = 2010; i <= endYear; i++) {
			var yearObj = {
				value: i.toString().slice(-2),
				text: i + "年"
			};

			var monthArray = new Array();
			for(var j = 1; j <= 12; j++) {
				monthArray.push({
					value: j < 10 ? "0" + j : j,
					text: j + "月"
				});
			}
			yearObj.children = monthArray;

			dateArray.push(yearObj);
		}

		return dateArray;
	}

}