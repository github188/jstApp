/**
 * mui扩展
 * version:1.0.1
 * created by Max/jingming.li@jieshunpay.cn
 */
var stringUtil = require("./string_util");
module.exports = (function($) {

	/**
	 * 选择器如有多个元素,获取属性值或是否包含时则默认返回第一个元素的操作
	 * class的操作，如需一次添加多个，使用空格隔开如aa bb cc
	 */
	//给某个元素添加class
	$.fn.addClass = function(value) {

		if(stringUtil.isEmpty(value)) {
			return this;
		}

		return this.each(function() {
			value.split(/\s+/).forEach(function(item) {
				this.classList.add(item);
			}.bind(this));
		});
	};

	//给某个元素移除class
	$.fn.removeClass = function(value) {
		if(stringUtil.isEmpty(value)) {
			return this;
		}

		return this.each(function() {
			value.split(/\s+/).forEach(function(item) {
				this.classList.remove(item);
			}.bind(this));
		});

	};

	//元素没有包含class则添加,有则移除
	$.fn.toggleClass = function(value) {
		if(stringUtil.isEmpty(value)) {
			return this;
		}
		return this.each(function() {
			value.split(/\s+/).forEach(function(item) {
				this.classList.toggle(item);
			}.bind(this));
		});

	};

	//是否包含某个class
	$.fn.hasClass = function(value) {
		var self = this[0];
		return self.classList.contains(value);
	};

	//元素添加属性
	$.fn.attr = function(key, value) {
		var self = this[0];

		if(arguments.length == 1) {
			return self.getAttribute(key);
		}
		return this.each(function() {
			this.setAttribute(key, value);
		});
	};

	//移除属性
	$.fn.removeAttr = function(key) {
		return this.each(function() {
			this.removeAttribute(key);
		});
	};
	//元素添加自定义属性值
	$.fn.data = function(key, value) {
		var self = this[0];
		if(arguments.length == 1) {
			return self.getAttribute("data-" + key);
		}
		return this.each(function() {
			this.setAttribute("data-" + key, value);
		});
	};

	//获取元素value值或设置值
	$.fn.val = function(tvalue) {
		var self = this[0];
		if(arguments.length == 1) {
			return self.value = tvalue;
		}
		return self.value;
	};
	//获取元素parent
	$.fn.parent = function() {
		var temp = this[0].parentNode;
		if(temp == null) return null;
		while(temp && temp.nodeType != 1) {
			temp = temp.parentNode;
		}
		return temp;
	};
	//获取元素prev
	$.fn.prev = function() {
		var getEle = this[0].previousSibling;
		while(getEle.nodeType != 1) {
			getEle = getEle.previousSibling;
			if(stringUtil.isEmpty(getEle)) {
				return null;
			}
		}
		return getEle;
	};
	//获取元素next
	$.fn.next = function() {
		var getEle = this[0].nextSibling;
		while(getEle.nodeType != 1) {
			getEle = getEle.nextSibling;
			if(stringUtil.isEmpty(getEle)) {
				return null;
			}
		}
		return getEle;
	};
	//获取元素value值或设置值
	$.fn.find = function(selector) {
		var selectorAll = [],
			i = 0;
		this.each(function() {
			selectorAll = selectorAll.concat($.qsa(selector, this));
		});

		return $(selectorAll);
	};

	//根据索引查找元素
	$.fn.eq = function(eq) {
		var target = "";
		this.each(function(index, ele) {
			if(stringUtil.isEmpty(eq)) {
				return "";
			}
			if(index == eq) {
				target = ele;
			}
		});
		return $(target);
	};

	/**
	 * 获取当前DOM索引
	 * selector:当前document的同胞对象集合
	 * target:当前document对象
	 */
	$.elementGetIndex = function(selector, target) {
		var indexResult = 0;
		$(selector).each(function(index, ele) {
			if(ele === target) {
				indexResult = index;
				return;
			}
		});
		return indexResult;
	};

	/**
	 * 设置元素CSS值
	 * 用法:$(".mui-input-row label").css({
	 *				"padding": "10px",
	 *				"margin": "20px"
	 *			});
	 * 用法:$(".mui-input-row label").css("margin": "20px");
	 */
	$.fn.css = function() {

		if(arguments.length == 0) {
			return;
		}
		var styleKey = arguments[0],
			styleValue = arguments[1];

		function endsWith(str, suffix) {
			var l = str.length - suffix.length;
			return l >= 0 && str.indexOf(suffix, l) == l;
		}

		return this.each(function() {

			var cssText = this.style.cssText;
			if(!endsWith(cssText, ';')) {
				cssText += ';';
			}

			if(typeof(styleKey) == "object") {
				var cssstr = '';
				for(var p in styleKey) {
					if(typeof(styleKey[p]) == "function") {
						styleKey[p]();
					} else {
						// p 为属性名称，obj[p]为对应属性的值
						cssstr += p + ":" + styleKey[p] + ";";
					}
				}
				this.style.cssText = cssText + cssstr;
			} else {
				this.style.cssText = cssText + styleKey + ":" + styleValue + ";";
			}

		});
	};

	//显示元素
	$.fn.show = function() {
		return this.each(function() {
			this.style.display = "block";
		});
	};

	//隐藏元素
	$.fn.hide = function() {
		return this.each(function() {
			this.style.display = "none";
		});
	};

	//给元素赋值HTML或获取元素innerHtml
	$.fn.html = function(innerHtmlStr) {
		if(stringUtil.isEmpty(arguments)) {
			return this[0].innerHTML;
		}

		return this.each(function() {
			this.innerHTML = innerHtmlStr;
		});
	};

	//移除元素
	$.fn.remove = function() {
		return this.each(function() {
			if(this) this.parentNode.removeChild(this);
		});
	};

	//添加元素
	$.fn.append = function(obj) {
		if(typeof obj === "string") {
			return this.each(function() {
				this.innerHTML = this.innerHTML + obj;
			});

		} else {
			return this.each(function() {
				if(this) this.parentNode.appendChild(obj);
			});

		}

	};

	//给元素添加事件
	$.fn.bind = function(event, callback) {
		return this.each(function() {
			this.addEventListener(event, callback);
		});
	};

	//给元素添加事件
	$.fn.addEventListener = function(event, callback) {
		return this.each(function() {
			this.addEventListener(event, callback);
		});
	};

	//给元素添加事件
	$.fn.removeEventListener = function(event, callback) {
		return this.each(function() {
			this.removeEventListener(event, callback);
		});
	};

	//获取滚动条的垂直偏移量，支持window和documentElement
	$.fn.scrollTop = function(value) {
		if("scrollTop" in this[0]) {
			if(value != undefined && value != null) {
				this[0].scrollTop = value;
			} else {
				return this[0].scrollTop;
			}
		} else {
			if(value != undefined && value != null) {
				window.scrollTo(window.pageXOffset, value);
			} else {
				return window.pageYOffset;
			}
		}
	};
})(mui);