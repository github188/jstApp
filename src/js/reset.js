
require("./module/public_module");
$(function(){
	var userInfo = JSON.parse(sessionStorage.getItem("memory"));
	$(".reIcon i").bind("touchstart",function(){
		memoryInfo = {
			openId:userInfo.openId,
			cardNo:userInfo.cardNo,
			accounttype:userInfo.accounttype,
			type:"reset"
		};
		sessionStorage.setItem("memory",JSON.stringify(memoryInfo));
		location.href = "./password.jsp?openId="+userInfo.openId;
	})
	$(".forgetIcon i").bind("touchstart",function(){
		memoryInfo = {
			openId:userInfo.openId,
			cardNo:userInfo.cardNo,
			accounttype:userInfo.accounttype,
			type:"reset"
		};
		sessionStorage.setItem("memory",JSON.stringify(memoryInfo))
		location.href = "./forget.jsp?openId="+userInfo.openId;
	})
})