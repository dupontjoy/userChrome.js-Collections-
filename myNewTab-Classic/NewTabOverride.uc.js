// ==UserScript==
// @name  NewTabOverride.uc.js
// @author  Kelo 
// @charset UTF-8
// @include main
// ==/UserScript==
(function() {
  Cu.import("resource:///modules/NewTabURL.jsm");
  Cu.import("resource://gre/modules/Services.jsm");

  var config = {
    pref: "browser.newtab.url"
  };

  var NewTabOverride = {
    init: function() {
      var prefArray = config.pref.split("."),
          key = prefArray.pop(),
          branch = prefArray.join(".") + ".";

      var pref = new Pref(branch, key);
      pref.load("about:newtab")
          .on(function(aSubject, aTopic, aData) {
            NewTabURL.override(pref.get());
          });
    }
  };

  function Pref(branch, key) {
    this.branchName = branch;
    this.branch = Services.prefs.getBranch(branch);
    this.key = key;
  }
  Pref.prototype = {
    get: function() {
      return this.branch.getComplexValue(this.key, Ci.nsISupportsString).data;
    },
    set: function(value) {
      var string = Cc['@mozilla.org/supports-string;1'].createInstance(Ci.nsISupportsString);
      string.data = value;
      this.branch.setComplexValue(this.key, Ci.nsISupportsString, string);
      return this;
    },
    load: function(value) {
      if (!this.branch.prefHasUserValue(this.key)) {
        this.set(value);
      }
      return this;
    },
    on: function(fn, context) {
      this.branch.addObserver(this.key, function(aSubject, aTopic, aData) {
        fn.call(context || this, aSubject, aTopic, aData)
      }, false);
    }
  };

  NewTabOverride.init()
})();