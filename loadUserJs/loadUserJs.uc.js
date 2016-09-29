//by 颜太吓
//加载user.js
 (() =>{
		let aFile = Services.dirsvc.get("UChrm", Ci.nsILocalFile);
		aFile.appendRelativePath("Local");
		//aFile.appendRelativePath("VimFx");
		aFile.appendRelativePath("_user.js");
		let fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
		let sstream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
		fstream.init(aFile, -1, 0, 0);
		sstream.init(fstream);
		let data = sstream.read(sstream.available());
		data = decodeURIComponent(escape(data));
		sstream.close();
		fstream.close();
		data = new Function('', 'return ' + data)();
    Preferences.set(data);
})()
