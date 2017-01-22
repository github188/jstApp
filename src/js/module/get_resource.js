/**
 * 资源 API
 * version:1.0.1
 * created by Fizz/gangheng.huang@jieshun.cn
 */
module.exports = (function($) {
	var returnResult = {};

	/**
	 * 获取银行logo信息
	 * type为银行编码 如ICBC/ABC
	 */
	returnResult.getBankLogo = function(type) {
		var redColor = "#f25555";       // 红色
		var greenColor = "#17a982";     // 绿色
		var blueColor = "#4a7dbc";      // 蓝色
		var purpleColor = "#75338f";    // 紫色
		var yellowColor = "#e95b20";    // 黄色
		var bankColor = [{"name":"中国工商银行","color":redColor,"cardBin":"ICBC","logo":"gongs.png",},{"name":"农业银行","color":greenColor,"cardBin":"ABC","logo":"nongy.png",},{"name":"建设银行","color":blueColor,"cardBin":"CCB","logo":"jians.png",},{"name":"招商银行","color":redColor,"cardBin":"CMB","logo":"zhaos.png",},{"name":"交通银行","color":blueColor,"cardBin":"BCM","logo":"jiaot.png",},{"name":"中国银行","color":redColor,"cardBin":"BOC","logo":"zhongg.png",},{"name":"兴业银行","color":blueColor,"cardBin":"CIB","logo":"xingy.png",},{"name":"民生银行","color":greenColor,"cardBin":"CMBC","logo":"mings.png",},{"name":"光大银行","color":purpleColor,"cardBin":"CEB","logo":"guangd.png",},{"name":"中信银行","color":redColor,"cardBin":"CITIC","logo":"zhongx.png",},{"name":"邮政储蓄","color":greenColor,"cardBin":"PSBC","logo":"youz.png",},{"name":"广发银行","color":redColor,"cardBin":"GDB","logo":"guangf.png",},{"name":"浦发银行","color":blueColor,"cardBin":"SPDB","logo":"puf.png",},{"name":"平安银行","color":yellowColor,"cardBin":"PAB","logo":"pinga.png",},{"name":"华夏银行","color":redColor,"cardBin":"HXB","logo":"huax.png",},{"name":"渤海银行","color":greenColor,"cardBin":"CBHB","logo":"boh.png",},{"name":"徽商银行","color":redColor,"cardBin":"HSB","logo":"huis.png",},{"name":"浙商银行","color":redColor,"cardBin":"CZB","logo":"zhes.png",},{"name":"北京银行","color":redColor,"cardBin":"BOB","logo":"beij.png",}];
		var defaultStyle = {"name":"","color":yellowColor,"cardBin":"","logo":"default.png"};
		$.each(bankColor, function(key, val) {
			if(val.cardBin == type){
				bankColor = val;
				return false;
			}
		});
		if(typeof(bankColor.length) == "number"){
            bankColor = defaultStyle;  
        }
		return bankColor;
	};

	return returnResult;
})(mui);