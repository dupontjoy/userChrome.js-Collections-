// ==UserScript==
// @name	Shortened URL Prefetcher
// @namespace	http://userscripts.org/users/mstm
// @description	Prefecthes the destination URL when you hover the mouse cursor over a shortened link, allowing you to check the final destination before clicking on the link.
// @version	0.5
// @include	*
// @grant	GM_addStyle
// @grant	GM_getValue
// @grant	GM_setValue
// @grant	GM_xmlhttpRequest
// $redirectors	http://spreadsheets.google.com/feeds/list/0AmlAKoZI3pCkdEtWZUhWS1BMRkJoMjV1X1l0ZU1jNnc/od6/public/values?alt=json
// ==/UserScript==

(function(){
  const generalName = GM_info.script.name;
  const containerID = GM_info.script.namespace.concat(generalName).replace(/\W/g, '');

  GM_addStyle('.' + containerID + ':after { content: ""; margin-left: -16px; padding: 8px; background: url(chrome://browser/skin/tabbrowser/connecting.png) center center no-repeat; vertical-align: middle; }');

  const setupRegExp = function (hash) {
    for (var e in hash) {
      hash[e] = new RegExp('^\\/' + hash[e] + '$');
    }
    hash.re = new RegExp('^(?:' + Object.keys(hash).join('|') + ')$');
    return hash;
  };

  const fetchHTML = function (link, callback) {
    GM_xmlhttpRequest({
      method: 'GET',
      url: link.href,
      onload: function(e) {
        var m = e.responseText.match(/<\s*meta\s+http-equiv=\"?refresh\"?\s+content=\"?\d+;\s*url=([^\">]+)\"?\s*\/?>/i);
        if (m) {
          link.href = m[1];
        }
        callback();
      }
    });
  };
  
  const fetchHTTP = function (link, callback) {
    GM_xmlhttpRequest({
      method: 'HEAD',
      url: link.href,
      onload: function(e) {
        if (link.href == e.finalUrl) {
          fetchHTML(link, callback);
          return;
        }
        link.href = e.finalUrl;
        callback();
      }
    });
  };

  var redirectors = setupRegExp(JSON.parse(GM_getValue('redirectors', '{}')));
  var containerRE = new RegExp('\\b' + containerID + '\\b');

  addEventListener('mouseover', function (e) {
    (function (o) {
      if (!o) return;
      
      if (o.nodeName == 'A') {
        if (!containerRE.test(o.className) && redirectors.re.test(o.hostname) && redirectors[o.hostname].test(o.pathname)) {
          o.className = o.className.split(' ').concat(containerID).join(' ');
          fetchHTTP(o, function () {
            o.className = o.className.replace(containerRE, '').replace(/\s+/, ' ').replace(/^\s?(.*?)\s?$/, '$1');
            o.dispatchEvent(e);
          });
        }
        return;
      }

      arguments.callee(o.parentNode);
    })(e.target);
  }, false);

  var lastUpdated = parseInt(GM_getValue('lastUpdated', '0'));
  var currentTime = new Date().getTime();

  if (currentTime < lastUpdated + 86400000 && GM_getValue('redirectors')) {
    return;
  }

  GM_xmlhttpRequest({
    method: 'GET',
    url: GM_info.scriptMetaStr.match(/\$redirectors\s+(.+)/)[1],
    onload: function(e) {
      var rows = JSON.parse(e.responseText).feed.entry;
      var hash = {};

      for (var e in rows) {
        var host = rows[e].gsx$host.$t;
        var path = rows[e].gsx$path.$t;
        hash[host.toLowerCase()] = path;
      }
      
      GM_setValue('lastUpdated', currentTime.toString());
      GM_setValue('redirectors', JSON.stringify(hash));

      redirectors = setupRegExp(hash);
    }
  });
})()

