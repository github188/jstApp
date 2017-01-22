/**
 *jst 特约商户
 * version:1.0.1
 * created by aj/chengjun.zhu@jieshunpay.cn
 */
require("./module/public_module");
(function($){
	var tabAddr = $("#tab-addr"),
		tabClass= $("#tab-class"),
		tabSearch = $("#tab-search"),
		cityType = 0,
		classType = "",
		searchTxt = "",
		main = {
			//初始化
			init:function(){
				var self = this;
				//self.getShopList();
				self.bindEvent();
			},
			//事件绑定
			bindEvent:function(){
				//显示地址列表
				tabAddr.bind("tap",function(e){
					e.stopPropagation();
					$("#tab-addr").find("i").addClass("i-on");
					$(".addr-list").removeClass("ds-none");
					$("#tab-class").find("i").removeClass("i-on");
					$(".class-list").addClass("ds-none");
				});
				//选择地址
				$("#addr-list").on("tap","li",function(e){	
					e.stopPropagation();
					$("#tab-addr").find("span").html($(this).html());
					$("#tab-addr").find("i").removeClass("i-on");
					$(".addr-list").addClass("ds-none");
					var index = $.elementGetIndex("#addr-list li",this);
					if(index == 0){
						cityType = 0;
					}else{
						cityType = 1;
					}
				});
				//隐藏地址列表
				$("#addr-box").bind("tap",function(e){
					e.stopPropagation();
					$(this).addClass("ds-none");
					$("#tab-addr").find("i").removeClass("i-on");
				});
				//显示类别列表
				tabClass.bind("tap",function(e){
					e.stopPropagation();
					$("#tab-class").find("i").addClass("i-on");
					$(".class-list").removeClass("ds-none");
					$("#tab-addr").find("i").removeClass("i-on");
					$(".addr-list").addClass("ds-none");
				});
				//选择类别
				$("#class-list").on("tap","li",function(e){
					e.stopPropagation();
					$("#tab-class").find("span").html($(this).html());
					$("#tab-class").find("i").removeClass("i-on");
					$(".class-list").addClass("ds-none");
					var index = $.elementGetIndex("#class-list li",this);
					if(index == 0){
						classType = 1;
					}else if(index == 1){
						classType = 2;
					}else if(index == 2){
						classType = 3;
					}else if(index == 3){
						classType = "";
					}
				});
				//隐藏地址列表
				$("#class-box").bind("tap",function(e){
					e.stopPropagation();
					$(this).addClass("ds-none");
					$("#tab-class").find("i").removeClass("i-on");
				});
				//显示搜索框
				$("#tab-search").bind("tap",function(e){
					e.stopPropagation();
					$("#search-box").removeClass("ds-none");
				});
				//隐藏搜索框
				$(".none").bind("tap",function(e){
					e.stopPropagation();
					$("#search-box").addClass("ds-none");
				});
				//搜索输入事件
				$("#search").bind("input",function(){
					searchTxt = $(this).val();
				})
				
			},
			//获取商户列表
			getShopList:function(){
				var dataParem = {
					city:cityType,
					merType:classType
				};
				postData("toTyMerchant.com",dataParem,function(data){
					var html = "";
					for(var i = 0;i < data.list.length;i++){
						html += '<div class="shop clearfloat">'+
									'<div class="shop-img">'+
										'<img src="../../../img/icon/'+data.list[i].image+'" alt="图片" />'+
									'</div>'+
									'<div class="shop-mes">'+
										'<div class="shop-name">'+
											'<h2>'+data.list[i].title+'</h2>'+
										'</div>'+
										'<div class="shop-addr">'+
											'<img src="../../img/icon/dz.png"/><a href="https://3gimg.qq.com/lightmap/components/locationCluster/index.html?type=1&keyword='+data.list[i].addr+'&region='+data.list[i].cityCN+'&key=WXHBZ-JB3AU-EEEVP-B2EWG-HSKJJ-WIFKP&referer=myapp&ch=uri-api&ADTAG=uri-api.tengxun">'+data.list[i].addr+'</a>'+
										'</div>'+
										'<div class="shop-tel">'+
											'<img src="../../img/icon/dh.png"/><a href="tel:'+data.list[i].userPhone+'">'+data.list[i].userPhone+'</a>'+
										'</div>'+
									'</div>'+
								'</div>';
					}
					$(".shop-cell").html(html);
				});
				
			},
			//搜索请求
			searchMes:function(){
				var dataParem = {
					title:searchTxt
				};
				postData("toTyMerchant.com",dataParem,function(data){
					var html = "";
					for(var i = 0;i < data.list.length;i++){
						html += '<div class="shop clearfloat">'+
									'<div class="shop-img">'+
										'<img src="../../../img/icon/'+data.list[i].image+'" alt="图片" />'+
									'</div>'+
									'<div class="shop-mes">'+
										'<div class="shop-name">'+
											'<h2>'+data.list[i].title+'</h2>'+
										'</div>'+
										'<div class="shop-addr">'+
											'<img src="../../img/icon/dz.png"/><a href="https://3gimg.qq.com/lightmap/components/locationCluster/index.html?type=1&keyword='+data.list[i].addr+'&region='+data.list[i].cityCN+'&key=WXHBZ-JB3AU-EEEVP-B2EWG-HSKJJ-WIFKP&referer=myapp&ch=uri-api&ADTAG=uri-api.tengxun">'+data.list[i].addr+'</a>'+
										'</div>'+
										'<div class="shop-tel">'+
											'<img src="../../img/icon/dh.png"/><a href="tel:'+data.list[i].userPhone+'">'+data.list[i].userPhone+'</a>'+
										'</div>'+
									'</div>'+
								'</div>';
					}
					$(".shop-cell").html(html);
				});
			}
		};
		main.init();
	
})(mui)