/**
 * APP入口
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
require("./module/public_module");
(function($) {
	var subpages = ['page/home/index.html', "page/account/account.html"],
		subpage_style = {
			top: '0',
			bottom: '51px'
		},
		aniShow = {},
		currentWebviewId = "", //当前WebView的ID
		httpUrl = constant.base,
		activeTab = subpages[0], //当前激活选项
		FOOTER_SELECTOR = "#footerMenu",
		FOOTER_ITEM_SELECTOR = ".footer-item",
		loginWebview,
		main = {
			//初始化执行
			init: function() {
				var self = this;

				require("./module/footer").addMenuHTML();

				//mui初始化
				$.init();

				self.initPage();
				self.bindEvent();
			},
			initPage: function() { //创建子页面
				$.plusReady(function() {

					var selfWebview = plus.webview.currentWebview();
					currentWebviewId = selfWebview.id;
					for(var i = 0; i < subpages.length; i++) {
						var temp = {};
						var id = subpages[i];
						var pageUrl = httpUrl + id;
						var sub = plus.webview.create(pageUrl, id, subpage_style);
						if(i > 0) {
							sub.hide();
						} else {
							temp[subpages[i]] = "true";
							$.extend(aniShow, temp);

						}
						selfWebview.append(sub);
					}

					//判断是否登录了，如果没有登录则预加载登录窗口
					loginWebview = $.preload({
						url: constant.base + '/page/home/login.html',
						extras: {
							param: {
								toIndex: 1
							},
							fromPageId: currentWebviewId
						}
					})

					setTimeout(function() {
						plus.navigator.closeSplashscreen();
					}, 600);
				});
			},
			//绑定事件监听
			bindEvent: function() {
				var self = this,

					/**
					 * 高亮显示切换
					 * @param {Object} target
					 */
					changeTab = function(target) {
						$(FOOTER_SELECTOR.concat(" " + FOOTER_ITEM_SELECTOR)).removeClass("active");
						$(target).addClass("active");
					},

					/**
					 * 模拟点击Tab
					 * @param {Object} toIndex
					 */
					triggerTab = function(toIndex) {
						var toIndex = Number(toIndex || 0),
							totab = $("#nav-" + toIndex);
						if(!totab || totab.length <= 0) {
							return;
						}

						var _targetTab = totab[0],
							_targetHref = totab.data("href");

						if(_targetHref == activeTab) {
							//刷新数据
							$.fire(plus.webview.getWebviewById(_targetHref), "refreshData");
						}

						//模拟首页点击
						$.trigger(totab[0], 'tap');

						require("./module/webview_opr").closeLanuchOther(plus.webview.currentWebview(), 300);

					};

				changeTab($("#nav-0")[0]);

				//选项卡点击事件
				$(FOOTER_SELECTOR).on('tap', FOOTER_ITEM_SELECTOR, function(e) {
					var targetTab = $(this).data("href");

					console.log("activeTab:" + activeTab + ",targetTab:" + targetTab);

					if(targetTab == activeTab) {
						return;
					}

					if(subpages[1] == targetTab) {
						if(!login.isLogin()) {

							//如果没有登录，则弹出登录窗口
							//							if(loginWebview) {
							//								loginWebview.show("slide-in-bottom", constant.duration);
							//							} else {
							login.gotoLogin(true, {
								param: {
									toIndex: 1
								}
							});
							//							}

							return;

						}
					}

					//显示目标选项卡
					//若为iOS平台或非首次显示，则直接显示
					if($.os.ios || aniShow[targetTab]) {
						plus.webview.show(targetTab);
					} else {
						//否则，使用fade-in动画，且保存变量
						var temp = {};
						temp[targetTab] = "true";
						$.extend(aniShow, temp);
						plus.webview.show(targetTab, "fade-in", 300);

					}

					console.log(targetTab + " has showed");

					//刷新数据
					$.fire(plus.webview.getWebviewById(targetTab), "refreshData");

					//隐藏当前;
					plus.webview.hide(activeTab);
					//更改当前活跃的选项卡
					activeTab = targetTab;

					changeTab(this);

				});
				//首次按下back按键的时间
				$.__back__first = null;
				$.back = function() {
					if(!$.__back__first) {
						$.__back__first = new Date().getTime();
						$.toast('再按一次退出应用');
						setTimeout(function() {
							$.__back__first = null;
						}, 2000);
					} else {
						if(new Date().getTime() - $.__back__first < 2000) {
							plus.runtime.quit();
						}
					}
				};

				//WEBVIEW自定义事件------------------------Begin---------------------------

				//切换选项卡
				window.addEventListener('changeTab', function(event) {

					console.log(currentWebviewId + " changeTab--event " + JSON.stringify(event.detail));

					triggerTab(event.detail.toIndex);
				});

				//登录成功之后刷新数据
				window.addEventListener('loginSuccess', function(event) {

					console.log(currentWebviewId + " loginSuccess--event");

					var toRefreshPageId = event.detail.toRefreshPageId,
						toIndex = event.detail.toIndex;

					triggerTab(toIndex);
				});

				//退出登录
				window.addEventListener('logout', function(event) {

					console.log(currentWebviewId + " logout--event");

					$.fire(plus.webview.getWebviewById(subpages[1]), "logout");
				});

				//WEBVIEW自定义事件------------------------End---------------------------
			}
		};
	main.init();

})(mui);
//end