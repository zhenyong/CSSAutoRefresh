/**
 *  CSSAutoRefresh v1.0
 *	
 *	Copyright (c) 2013 ZhenYong
 *	https://github.com/zhenyong
 *
 *	licensed under the MITlicenses.
 *	http://en.wikipedia.org/wiki/MIT_License
 *
 /

 /**
  * Usage 
  * ==========================
  * - put this script to you page, it must under the css file since it check the loaded css files
  * before execute
  * - Script request the css file every @cfg:interval millseconds, if the response header 
  * 'Last-Modified' change, then reload the css file
  */
 
(function() {

	/**
	 * @cfg interval every millseconds refresh the css file if modified
	 */
	var interval = 1000;

	var _counter = 0,
		cssHrefReg = /^.*\.css\s*$/,
		cssRelReg = /^(?:|\s*stylesheet\s*)$/;

	var getHttp = window.ActiveXObject ? function() {
			return new ActiveXObject('Microsoft.XMLHTTP');
		} : function() {
			return new XMLHttpRequest();
		};

	function getLastModified(url) {
		var headers = getHeaders(url);
		return (headers && headers['Last-Modified'] && Date.parse(headers['Last-Modified']) / 1000) || false;
	}

	function getHeaders(url) {
		var req = getHttp();
		if (!req) {
			throw new Error('ajax not support ');
		}

		var tmp, ret = {}, pair,j = 0;

		try {
			req.open('HEAD', url, false);
			req.send(null);
			if (req.readyState === 4 && req.status === 200) {
				tmp = req.getAllResponseHeaders().split('\n');

				for (var i = 0, len = tmp.length; i < len; i++) {
					if(tmp[i] !== '') {
						pair = tmp[i].toString().split(':');
						//when meet this header -> Date: Wed, 15 May 2013 08:55:41 GMT
						//splice the first one as header name, rejoin the other with ':'
						ret[pair.splice(0, 1)] = pair.join(':').substring(1);
					}
				}

				return ret;
			}
		} catch (err) {
			return null;
		}
		return null;
	}

	function disableCacheLink(href) {
		return href + '?_x=' + (_counter++);
	}

	function getHref(el) {
		return el.getAttribute('href').split('?')[0];
	}


	function isCssLink(el) {
		return cssRelReg.test(el.rel) && cssHrefReg.test(el.href);
	}

	function refreshFile(links) {
		for (var i = 0, l = links.length; i < l; i++) {
			var link = links[i],
				newTime = getLastModified(disableCacheLink(link.href));

			//	has been checked before
			if (link.oldTime) {
				//	has been changed
				if (link.oldTime != newTime) {
					//	reload
					link.el.setAttribute('href', disableCacheLink(link.href));
				}
			}

			link.oldTime = newTime;
		}
		setTimeout(function() {
			refreshFile(links);
		}, 1000);
	}

	function start() {
		var files = document.getElementsByTagName('link'),
			links = [];

		for (var i = 0, l = files.length; i < l; i++) {
			var el = files[i],
				rel = el.rel;
			if (isCssLink(el)) {
				links.push({
					'el': el,
					'href': getHref(el)
				});
			}
		}
		refreshFile(links);
	}

	start();

})();
