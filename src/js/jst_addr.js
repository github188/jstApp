/**
 *jst 充值网点
 * version:1.0.1
 * created by aj/chengjun.zhu@jieshunpay.cn
 */
require("./module/public_module");
(function($){
	var main = {
			init:function(){
				var self = this;
				self.getMes();
			},
			getMes:function(){
				postData("toRechargeWeb.com","",function(data){
					var html = "";
					for(var i=0;i<data.ResMsg.length;i++){
						html += '<div class="addr">'+
									'<div class="addr-title">'+data.ResMsg[i].recTitle+'</div>'+
									'<div class="addr-addr">'+
										'<img src="../../../src/img/icon/dz.png"><a href="https://3gimg.qq.com/lightmap/components/locationCluster/index.html?type=1&keyword='+data.ResMsg[i].recAddr+'&region='+data.ResMsg[i].city+'&key=WXHBZ-JB3AU-EEEVP-B2EWG-HSKJJ-WIFKP&referer=myapp&ch=uri-api&ADTAG=uri-api.tengxun">'+data.ResMsg[i].recAddr+'</a>'+
									'</div>'+
									'<div class="addr-tel">'+
										'<img src="../../../src/img/icon/dh.png"><a href="'+data.ResMsg[i].recPhone+'">'+data.ResMsg[i].recPhone+'</a>'+
									'</div>'+
								'</div>'
					}
					$(".addr-cell").html(listHtml);
				});
			}
		};
		main.init();
	
})(mui)
