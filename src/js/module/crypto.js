/**
 * localStorage操作
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */

require("../vendors/core");
require("../vendors/md5");
require("../vendors/enc-base64");

var stringUtil = require("./string_util");
module.exports = {
	//	key: "1010110202022030",
	//	iv: "1010110202022030",
	//	encrypt: function(word) {
	//
	//		if(stringUtil.isEmpty(word)) {
	//			return '';
	//		}
	//
	//		var key = CryptoJS.enc.Utf8.parse(this.key);
	//		var iv = CryptoJS.enc.Utf8.parse(this.iv);
	//		var srcs = CryptoJS.enc.Utf8.parse(word);
	//		var encrypted = CryptoJS.AES.encrypt(srcs, key, {
	//			iv: iv,
	//			mode: CryptoJS.mode.CBC
	//		});
	//		return encrypted.toString();
	//	},
	//
	//	decrypt: function(word) {
	//
	//		if(stringUtil.isEmpty(word)) {
	//			return '';
	//		}
	//		var key = CryptoJS.enc.Utf8.parse(this.key);
	//		var iv = CryptoJS.enc.Utf8.parse(this.iv);
	//		var decrypt = CryptoJS.AES.decrypt(word, key, {
	//			iv: iv,
	//			mode: CryptoJS.mode.CBC
	//		});
	//
	//		var retult = CryptoJS.enc.Utf8.stringify(decrypt).toString();
	//		return retult;
	//	},

	/**
	 * 将字符串转为MD5 Array ,如需字符串，请自行调用.toString
	 * @param {Object} word
	 */
	md5: function(word) {
		return CryptoJS.MD5(word.toString());
	},

	/**
	 * 将array转为BASE64字符串
	 * @param {Object} wordArray
	 */
	base64: function(wordArray) {
		return CryptoJS.enc.Base64.stringify(wordArray);
	},

	/**
	 * 将密码先MD5,后BASE64
	 * @param {Object} pwd
	 */
	encryptPwd: function(pwd) {
		return this.base64(this.md5(pwd));
	}
};