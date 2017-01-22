/**
 *jst 账单查询
 * version:1.0.1
 * created by aj/chengjun.zhu@jieshunpay.cn
 */
require("./module/public_module");
(function($){
	var index = "",
		usercode = "",
		userOpenId = "ohd71t450Rm7ghVY-NryPGa-ve9A",
		dataMes = {},
		main = {
			//初始化
			init:function(){
				var self = this;				
				self.bindEvent();
				self.swipe();
			},
			//轮播图
			swipe:function(){
				document.querySelector('.mui-slider').addEventListener('slide', function(e) {
//					console.log(e.detail.slideNumber)
					index = e.detail.slideNumber + 1;	
//					console.log($(".card-num").eq(index)[0].innerText)
				});
			},
			//事件绑定
			bindEvent:function(){
				
			},
			//获取卡列表
			getCardList:function(){
				var dataParem = {
					openId:userOpenId,
					cardCode:usercode
				}
				postData("getBillUserCards.execute",dataParem,function(data){
					dataMes = data;
					var listHtml = "";
					var navHtml = "";
					if(data.list.length == 0){
						
					}else if(data.list.length == 1){
						listHtml = 	'<div class="list fixed">'+
										'<div class="list-icon"></div>'+
										'<div class="card-num">卡号***'+data.list[0].usercode.substring(15)+'</div>'+
									'</div>';
						$("#one-card").html(listHtml);
					}else if(data.list.length > 1){
						for(i = 0;i < data.list.length;i++){
							listHtml +=  '<div class="mui-slider-item">'+
											'<div class="list">'+
												'<div class="list-icon"></div>'+
												'<div class="card-num">卡号***'+data.list[0].usercode.substring(15)+'</div>'+
											'</div>'+
										'</div>';
							if(i == 0){
								navHtml = '<div class="mui-indicator mui-active"></div>';
							}else{
								navHtml += '<div class="mui-indicator"></div>';
							}
						}	
						var firstHtml = '<div class="mui-slider-item mui-slider-item-duplicate">'+
											'<div class="list clearfloat">'+
												'<div class="list-icon"></div>'+
												'<div class="card-num">卡号***'+data.list[data.list.length-2].usercode.substring(15)+'</div>'+
											'</div>'+
										'</div> ';
						var lastHtml = '<div class="mui-slider-item mui-slider-item-duplicate">'+
											'<div class="list clearfloat">'+
												'<div class="list-icon"></div>'+
												'<div class="card-num">卡号***'+data.list[0].usercode.substring(15)+'</div>'+
											'</div>'+
										'</div>';
						listHtml = firstHtml + listHtml + lastHtml
						$("#slider").html(listHtml);
						$(".mui-slider-indicator").html(listHtml);
					}else{
						
					}
					
					
				})
			},
			//切换卡查账单
			tabList:function(){
				var dataParem ={
					openId:userOpenId,
					cardCode:usercode
				}
				postData("/toBillQry.com",dataParem,function(data){
					var billHtml = "";
					var state = "";
					var stateIcon = "";
					var statePhone = "";
					if(data.resCode == "WX000"){
						if(data.ResMsg.length == 0){
							
						}else{
							for(var i = 0;i < data.ResMsg.length;i++){
								if(data.ResMsg[i].businessTpye == "-"){
									state = "";
									stateIcon = "-";
								}else{
									state = "recharge";
									stateIcon = " ";
								}
								if(data.ResMsg[i].phone.length > 2){
									statePhone = "-尾号";
								}else{
									statePhone = " ";
								}
								billHtml += '<div class="bill-list">'+
												'<div class="bill-row clearfloat">'+
													'<div class="bill-title">'+data.ResMsg[i].descr+statePhone+data.ResMsg[i].phone+'</div>'+
													'<div class="bill-num "'+state+'>'+stateIcon+data.ResMsg[i].amount+'</div>'+
												'</div>'+
												'<div class="bill-row clearfloat">'+
													'<div class="bill-date">'+data.ResMsg[i].consumeTime+'</div>'+
													'<div class="bill-result">'+data.ResMsg[i].consumeResult+'</div>'+
												'</div>'+
											'</div>'
							}
							$(".bill-cell").html(billHtml);
						}
						
					}
				})
			}
			
		};
		main.init();
	
})(mui)