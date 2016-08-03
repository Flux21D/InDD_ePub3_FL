#target 'indesign'

//independent Methods
function placeSnippet(sel) {
	if (File.fs == "Windows") {
		var Filter = "Snippet files: *.inds";
	} else {
		var xmlFilter = function (file) {
			while (file.alias) {
				file = file.resolve();
				if (file == null)
					return false;
			}
			if (file instanceof Folder)
				return true;
			return (file.name.slice(file.name.lastIndexOf(".")).toLowerCase() == ".inds");
		}
		var Filter = xmlFilter
	}
	var myFile = new File(new File($.fileName).parent + "/aid.idms");
	if (myFile == null) {
		return
	}
	placeSnipInline(myFile, sel);
	function placeSnipInline(mySnipFile, text) {
		var myDoc = app.documents.add(false);
		app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
		myDoc.pages[0].place(mySnipFile);
		app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
		myLib = app.libraries.add(File("~/Desktop/templib.indl"));
		myLib.store(myDoc.pageItems[0]);
		myDoc.close(SaveOptions.no);
		myLib.assets[0].placeAsset(text);
		myLib.close();
		File("~/Desktop/templib.indl").remove();
	}
}
function Get_Geomentry(Page_Item, Visible) {
	try {
		Page_Item.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.PAGE_COORDINATES, false);
	} catch (Err) {}
	var Geomentry = new Array();
	if (!Visible) {
		Geomentry[0] = Page_Item.geometricBounds[0]; // Top
		Geomentry[1] = Page_Item.geometricBounds[1]; // Left
		Geomentry[2] = Page_Item.geometricBounds[2]; // Bottom
		Geomentry[3] = Page_Item.geometricBounds[3]; // Right
		// width=right-left , height = bottom-top
		Geomentry[4] = Geomentry[3] - Geomentry[1]; // Width
		Geomentry[5] = Geomentry[2] - Geomentry[0]; // height


	} else {
		Geomentry[0] = Page_Item.geometricBounds[0]; // Top
		Geomentry[1] = Page_Item.geometricBounds[1]; // Left
		Geomentry[2] = Page_Item.geometricBounds[2]; // Bottom
		Geomentry[3] = Page_Item.geometricBounds[3]; // Right

		// width=right-left , height = bottom-top
		Geomentry[4] = Geomentry[3] - Geomentry[1]; // Width
		Geomentry[5] = Geomentry[2] - Geomentry[0]; // height
	}
	return Geomentry;
}
function dynamicSort() {
	return function (a, b) {
		if (a.top === b.top) {
			return b.left - a.left;
		}
		return b.top - a.top;
	}
}
function get_ParagraphStyleByName(d, name) {
	var thestyle = null; // result
	var AllStyles = d.allParagraphStyles;
	TraverseStyles(AllStyles, name);
	function TraverseStyles(styles, name) {
		for (var i = 0; i < styles.length; i++) {
			var onestyle = styles[i]; // isolate

			if (onestyle instanceof Array) {
				TraverseStyles(onestyle, name);
			} else {
				if (name === onestyle.name) {
					//$.writeln("Style: " + onestyle.name)
					thestyle = onestyle; // found it
				} // end of check
			}
		} // end of loop i
	}
	// if we did not finds it we return null else Object ParagraphStyle
	return thestyle;
}
function get_CharacterStyleByName(d, name) {
	var thestyle = null; // result
	var AllStyles = d.allCharacterStyles;
	TraverseStyles(AllStyles, name);
	function TraverseStyles(styles, name) {
		for (var i = 0; i < styles.length; i++) {
			var onestyle = styles[i]; // isolate
			if (onestyle instanceof Array) {
				TraverseStyles(onestyle, name);
			} else {
				if (name === onestyle.name) {
					thestyle = onestyle; // found it
				} // end of check
			}
		} // end of loop i
	}
	// if we did not finds it we return null else Object CharacterStyle
	return thestyle;
}


//Classes
function OPS(file){
	this.file=file;
	this.dom=file.parseXML();
}
function ePub(input){
	this.unziped = null;
	this.htmls = new Array();
	this.images = new Array();
	this.fonts = new Array();
	this.css = new Array();
	this.svg = new Array();
	this.js = new Array();
	this.opf = new Array();
	this.ncx = new Array();
    this.aids=new Array();   
    this.hrefs=new Array();
    this.updateHtmls=function()
    {
        var htmls=this.htmls;
        while((aOPS=htmls.pop())!=null)
        {
            $.writeln("Updating htmls: "+aOPS.file.fsName);
            aOPS.dom.toXMLString().writeToFile(aOPS.file);
        }
    }
    //unzip folder
    var XMLsettings=
    {
        prettyPrinting : false,
        ignoreWhitespace : false
    }


	if (input instanceof File && input.name.endsWith(".epub"))
	{
		this.unziped = input.unzip(new Folder(input.parent.fsName+"/"+input.name.replace (/\.epub$/, "")));
	}
	else if (input instanceof Folder)
	{
		this.unziped = input;
	}


	//opf
	var fileArray = null;
	fileArray = this.unziped.searchFile(new RegExp(/\.opf$/));
	for (var count = 0; count < fileArray.length; count++)
	{
         var ops=new OPS(fileArray[count]);
		this.opf.push(ops);
	}
	
	//htmls
	var htmlsseq=this.opf[0].dom..spine.itemref;
	for(var d=0;d<htmlsseq.length();d++)
	{
		var fileArray = new Array();
		$.writeln("Gathering file Srcs: "+(htmlsseq[d].@idref+".xhtml"));
		fileArray = this.unziped.searchFile(new RegExp((htmlsseq[d].@idref+".xhtml").escapeRegExp()));
		if(fileArray.length==0)
		{
		}
		XML.setSettings(XMLsettings);
		for (var count = 0; count < fileArray.length; count++)
		{
              var ops=new OPS(fileArray[count]);
			 this.htmls.push(ops);
              this.aids.push(ops.dom.xpath ("//a[@id!='']"));
              this.hrefs.push(ops.dom.xpath ("//a[@href!='']"));
		}
		
	}
	

	//images
	fileArray = this.unziped.searchFile(new RegExp(/\.jpg$|\.jpeg$/));
	for (var count = 0; count < fileArray.length; count++)
	{
		this.images.push(
		{
			file : fileArray[count],
		}
		);
	}
	//fonts
	fileArray = this.unziped.searchFile(new RegExp(/\.otf$|\.ttf$/));
	for (var count = 0; count < fileArray.length; count++)
	{
		this.fonts.push(
		{
			file : fileArray[count],
		}
		);
	}

	//css
	fileArray = this.unziped.searchFile(new RegExp(/\.css$/));
	for (var count = 0; count < fileArray.length; count++)
	{
		this.css.push(
		{
			file : fileArray[count],
		}
		);
	}
	//svgs
	fileArray = this.unziped.searchFile(new RegExp(/\.svg$/));
	for (var count = 0; count < fileArray.length; count++)
	{
		this.svg.push(
		{
			file : fileArray[count],
		}
		);
	}
	//ncx
	fileArray = this.unziped.searchFile(new RegExp(/\.ncx$/));
	for (var count = 0; count < fileArray.length; count++)
	{
         var ops=new OPS(fileArray[count]);
		this.ncx.push(ops);
	}
	//js
	fileArray = this.unziped.searchFile(new RegExp(/\.js$/));
	for (var count = 0; count < fileArray.length; count++)
	{
		this.js.push(
		{
			file : fileArray[count],
		}
		);
	}
}

//extended functions (depended Methods)
Folder.prototype.createFolder = function (name) {
	if (new Folder(this.fsName + "/" + name).exists) {
		new Folder(this.fsName + "/" + name).remove();
		new Folder(this.fsName + "/" + name).create();
	} else {
		new Folder(this.fsName + "/" + name).create();
	}
	return new Folder(this.fsName + "/" + name);
};
Folder.prototype.searchFile = function (namefilter) {
	function traverse(folder, arrayoffiles) {
		var files = folder.getFiles();
		for (var findex = 0; findex < files.length; findex++) {
			if (files[findex]instanceof Folder) {

				if (Folder.fs == "Windows" && files[findex].name == "__MACOSX") {}
				else {
					traverse(files[findex], arrayoffiles);
				}
			} else if (files[findex].name.match(namefilter) != null) {
				if (files[findex].exists) {
					arrayoffiles.push(files[findex]);
				}
			}
		}
	}
	var inputfolder = this;
	var arrayfiles = new Array();
	traverse(inputfolder, arrayfiles);
	return arrayfiles;
}
Folder.prototype.delete  = function () {
	var files = this.getFiles();
	for (var r = 0; r < files.length; r++) {
		if (files[r]instanceof Folder) {
			files[r].delete ();
		} else {
			while (files[r].remove()) {}
		}
	}
	while (this.remove()) {}
}
Folder.prototype.copy = function (dest) {
	if (this.exists) {
		if (dest instanceof Folder) {
			var allFiles = this.getFiles();
			if (!dest.exists) {
				dest.create();
			}
			for (var a = 0; a < allFiles.length; a++) {
				if (allFiles[a]instanceof File) {
					allFiles[a].copy(dest + "/" + allFiles[a].name);
				} else {
					allFiles[a].copy(new Folder(dest + "/" + allFiles[a].name));
				}
			}
		}
	}
}
File.prototype.parseXML = function (){
    this.open("r");
	this.encoding = "utf-8";
	var text = "";
	while (!this.eof)
	{
		var line = this.readln().replace(/ xmlns=\"[^\"]*?\"/g, "").replace(/\&/g, "[[ambersand]]");
		text = text + line + " ";
        $.writeln(text);
	}
	this.close();
	try
	{
        $.writeln("\tParsing XML...");
        return new XML(text);
	}
	catch (e)
	{
		$.writeln(e)
	}
    return new XML("<invalid/>");
};
File.prototype.unzip = function (tofolder){
     $.writeln(tofolder.fsName);   
	tofolder.delete();
	tofolder.parent.createFolder(tofolder.name);
	if ($.os.toLowerCase().indexOf("windows") != -1)
	{
		var outtxt = new File(tofolder.fsName + "/" + this.name.replace(".epub", ".txt"));
		while (outtxt.exists)
		{
			outtxt.remove();
		}
		var UnzipBat = new File(new Folder($.fileName).parent + "/unzip.bat");
		UnzipBat.open("w");
		UnzipBat.writeln("\"" + Folder.decode(new Folder($.fileName).parent.fsName) + "/unzip.exe\" -n \"" + File.decode(this.fsName) + "\" -d \"" + File.decode(tofolder.fsName) + "\"");
		UnzipBat.writeln("\"" + Folder.decode(new Folder($.fileName).parent.fsName) + "/unzip.exe\" -l \"" + File.decode(this.fsName) + "\" >\"" + File.decode(tofolder.fsName + "/" + this.name.replace(".epub", ".txt")) + "\"");
		UnzipBat.close();
		UnzipBat.execute();
		if (UnzipBat.execute())
		{}
         $.writeln("unziping...");   
		while (!outtxt.exists)
		{}
		outtxt.remove();
         $.writeln("unziped...");   
	}
	else
	{
		var applescript = "set unzipcmd to \"cd \\\"" + this.parent.fsName + "\\\"\nunzip -d \\\"" + this.name.replace(".epub", "") + "\\\" \\\"" + File.decode(tofolder.fsName + ".epub") + "\\\"\"\n"
			 + "do shell script unzipcmd\n";
		
		try
		{
			app.doScript(applescript, ScriptLanguage.APPLESCRIPT_LANGUAGE);
		}
		catch (ert)
		{
			
		}
	}
	return tofolder;
}
File.prototype.deleteOnExit = function (){
	if ($.os.toLowerCase().indexOf("windows") != -1)
	{

		var RemoveBat = new File(new Folder($.fileName).parent + "/remove.bat");
		RemoveBat.open("w");
		RemoveBat.writeln("DEL /F /S /Q /A \"" + this.fsName + "\"");
		RemoveBat.close();
		RemoveBat.execute();
		if (RemoveBat.execute())
		{}
	}
	else
	{
		var applescript = "set unzipcmd to \"delete file \\\"" + this.fsName + "\\\"\ndo shell script unzipcmd\n";
		try
		{
			app.doScript(applescript, ScriptLanguage.APPLESCRIPT_LANGUAGE);
		}
		catch (ert)
		{
			;
		}
	}
}
Application.prototype.selectFile = function (prompt, filter) {
		if (prompt == $.global.undefined) {
			prompt = "Open an Indesign File"
		}
		var History_inputFile = $.getenv("INDD_Script_LastRunFile");
		var inputFile = null;
		if (History_inputFile == null) {
			inputFile = File.openDialog(prompt, filter);
			if (inputFile == null) {
				//exit(0);
			} else {
				$.setenv("INDD_Script_LastRunFile", inputFile.fsName);
			}
		} else {
			inputFile = new Folder(History_inputFile).openDlg(prompt, filter);
			if (inputFile == null) {
				//exit(0);
			} else {
				$.setenv("INDD_Script_LastRunFile", inputFile.fsName);
			}
		}
		return inputFile;
	}
PageItem.prototype.sortByPosition = function () {
	function traverse(parent) {
		var items = parent.getElements();
		var item = null;
		var sortedArray = new Array();
		while ((item = items.pop()) != null) {
			if (item instanceof Group) {
				sortedArray = sortedArray.concat(traverse(item.pageItems.everyItem()));
			} else if (item instanceof TextFrame) {
				/*
				$.writeln( "-----------------Original---------------------\r\n"+
				"top: "+item.geometricBounds[0]+"\r\n"+
				"left: "+item.geometricBounds[1]+"\r\n"+
				"--------------------------------------\r\n"
				);*/
				sortedArray.push({
					top : Get_Geomentry(item, true)[0],
					left : Get_Geomentry(item, true)[1],
					item : item,
				});
			}
		}
		return sortedArray.sort(dynamicSort());
	}
	return traverse(this);
}
CharacterStyle.prototype.getParentDocument = function () {
	var Style = this;
	var parent = Style.parernt;
	while (!parent instanceof Document) {
		parent = parent.parent;
	}
	return parent;
}
Application.prototype.SetInteractionLevel = function (userInteractionlevels) {
	app.scriptPreferences.userInteractionLevel = userInteractionlevels;
	DocumentEvent.userInteractionLevel = userInteractionlevels;
	ImportExportEvent.userInteractionLevel = userInteractionlevels;
};
Application.prototype.selectFolder = function (prompt) {
	if (prompt == $.global.undefined) {
		prompt = "Select Folder"
	}
	var History_inputFolder = $.getenv("INDD_Script_LastRunFolder");
	var inputFolder = null;
	if (History_inputFolder == null) {
		inputFolder = Folder.selectDialog(prompt);
		if (inputFolder == null) {
			exit(0);
		}
		$.setenv("INDD_Script_LastRunFolder", inputFolder.fsName);
	} else {
		inputFolder = new Folder(History_inputFolder).selectDlg(prompt);
		if (inputFolder == null) {
			exit(0);
		}
		$.setenv("INDD_Script_LastRunFolder", inputFolder.fsName);
	}
	return inputFolder;
}
Application.prototype.openFile = function (file) {
	try {
		app.SetInteractionLevel(UserInteractionLevels.NEVER_INTERACT);
		var opened = app.open(file);
		app.SetInteractionLevel(UserInteractionLevels.INTERACT_WITH_ALL);
		return opened;
	} catch (excep) {
		try {
			throw new Error(excep + '\nExpected: Supported docs for current version');
		} catch (e) {
			alert(e.name + ': ' + e.message + "\r\nStack: \r\n" + $.stack, "Error!", true);
			return false;
		}
	}
}
Document.prototype.SplitStories = function (){
	var pages = this.pages;
	for (var set = 0; set < pages.length; set++)
	{
		var textFrames_are = pages[set].textFrames;
		for (var set2 = 0; set2 < textFrames_are.length; set2++)
		{
			var mySelection2 = textFrames_are[set2]
				if (mySelection2.parentStory.textContainers.length > 1)
				{
					mySplitStory(mySelection2.parentStory);
					myRemoveFrames(mySelection2.parentStory);
				}
		}
	}
	function mySplitStory(myStory)
	{
		var myTextFrame;
		//Duplicate each text frame in the story.
		for (var myCounter = myStory.textContainers.length - 1; myCounter >= 0; myCounter--)
		{
			myTextFrame = myStory.textContainers[myCounter];
			myTextFrame.duplicate();
		}
	}
	function myRemoveFrames(myStory)
	{
		var myTextFrame;
		//Remove each text frame in the story.
		for (var myCounter = myStory.textContainers.length - 1; myCounter >= 0; myCounter--)
		{
			myTextFrame = myStory.textContainers[myCounter];
			try
			{
				myTextFrame.remove();
			}
			catch (e)
			{}
		}
	}
}
String.prototype.escapeRegExp = function (){
	var specials = ["-", "[", "]", "/", "{", "}", "(", ")", "*", "+", "?", ".", "\\", "^", "$", "|", ".", "!"];
	var regex = RegExp('[' + specials.join('\\') + ']', 'g');
	return this.replace(regex, "\\$&");
};
String.prototype.replaceAll = function (from, to, options){
	var regX = new RegExp(from, "g");
	return this.replace(regX, to);
};
String.prototype.trim = function (){
	var text = this;
	text = text.replace(/[\s]+$/, "");
	text = text.replace(/^[\s]+/, "");
	return text;
};
String.prototype.normalizeSpaces = function (){
	return this.replace(/[\s]+/g, " ").replace(/\[\[ambersand\]\]/g, "&");
};
String.prototype.normalizeKeyboardKeys = function (){
	var text = this;
	text = text.replace(/[’]/g, "\'");
	text = text.replace(/[“”]/g, "\"");
	return text;
};
String.prototype.parseXML = function (){
	return new XML(this);
}
String.prototype.endsWith = function (string){
	var text = this;
	var regx = eval("new RegExp(/" + string.escapeRegExp() + "$/)")
		if (this.match(regx) != null)
		{
			return true;
		}
		return false;
}
String.prototype.startsWith = function (string){
	var text = this;
	var regx = eval("new RegExp(/^" + string.escapeRegExp() + "/)")
		if (this.match(regx) != null)
		{
			return true;
		}
		return false;
}
String.prototype.writeToFile = function (file){
	if(file==$.global.undefined)
	{
		file=new File(Folder.myDocuments+"/map.xml")
	}
	file.encoding = "utf-8";
	file.lineFeed="Unix";
	file.open("w");
	if(file.name.endsWith("html"))
	{
		file.write("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">\n"+this.replace(/\[\[ambersand\]\]/g,"&").replace("<html>","<html xmlns=\"http://www.w3.org/1999/xhtml\">"));
	}
	else if(file.name.endsWith(".opf")){
		file.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"+this.replace(/\[\[ambersand\]\]/g,"&"));
	}
	else if(file.name.endsWith(".ncx")){
		file.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE ncx PUBLIC \"-//NISO//DTD ncx 2005-1//EN\" \"http://www.daisy.org/z3986/2005/ncx-2005-1.dtd\">\n"+this.replace(/\[\[ambersand\]\]/g,"&").replace("<html>","<html xmlns=\"http://www.w3.org/1999/xhtml\">"));
	}
	else
	{
	 file.write(this);
	}
	file.close();
	return file;
}
Folder.prototype.zip=function(toFile){
    var zipexeFile = new File(new Folder($.fileName).parent + "/zip.exe");
	var Batch = new File(Folder.myDocuments + "/createEpub.bat");
	zipexeFile.copy(new File(this + "/zip.exe"));
	//while (!zipexeFile.exists) {}
	Batch.open("w");
	Batch.writeln(this.fsName.split(":")[0] + ":");
	Batch.writeln("cd \"" + this.fsName + "\"");
	Batch.writeln("zip.exe -Xr9D \"" + File.decode(this.name) + ".zip\" mimetype META-INF/* OEBPS/*");
	Batch.close();
	if (Batch.execute()) {}
	else {
		alert("Unable to create .epub file!");
	}
	while (!new File(this.fsName + "/" + this.name + ".zip").exists) {}
	new File(this.fsName + "/" + this.name + ".zip").copy(toFile);
    return toFile;
}
Object.prototype.inherit = function (obj){
	if (typeof(obj) != "undefined")
	{
		for (var name in obj)
		{
			try
			{
				var value = eval("obj." + name + ";");
				if (name == "inherit")
				{}

				else if (typeof(value) == "undefined")
				{
					eval("this." + name + "=value;");
				}
				else if (value.constructor.name == "String")
				{
					eval("this." + name + "=\"" + value + "\";");
				}
				else if (value.constructor.name != "")
				{
					eval("this." + name + "=value;");
				}
				else
				{
					eval("this." + name + "=value;");
				}
			}
			catch (exe)
			{}
		}
	}
}
MasterSpread.prototype.overrideMasterItems=function(Page)
{
    var masterSpread=this;
    var primaryFrame=null;
		try
		{
             for (var B = 0; B < masterSpread.pages.length; B++)
			{
				if (Page.side == masterSpread.pages[B].side)
				{
					try
					{
						masterSpread.pages.item(B).pageItems.everyItem().override(Page);
					}
					catch (e)
					{}
				}
			}
		}
		catch (err)
		{
		}
}
PageItem.prototype.sortByPosition = function () {
	function traverse(parent) {
		var items = parent.getElements();
		var item = null;
		var sortedArray = new Array();
		while ((item = items.pop()) != null) {
			if (item instanceof Group) {
				sortedArray = sortedArray.concat(traverse(item.pageItems.everyItem()));
			} else if (item instanceof TextFrame) {
				/*
				$.writeln( "-----------------Original---------------------\r\n"+
				"top: "+item.geometricBounds[0]+"\r\n"+
				"left: "+item.geometricBounds[1]+"\r\n"+
				"--------------------------------------\r\n"
				);*/
				sortedArray.push({
					top : Get_Geomentry(item, true)[0],
					left : Get_Geomentry(item, true)[1],
					item : item,
				});
			}
		}
		return sortedArray.sort(dynamicSort());
	}
	return traverse(this);
}
PageItem.prototype.getPrimaryTextFrame = function () {
	function traverse(parent) {
		var items = parent.getElements();
		var item = null;
		var sortedArray = new Array();
		while ((item = items.pop()) != null) {
			if (item instanceof Group) {
				sortedArray = sortedArray.concat(traverse(item.pageItems.everyItem()));
			} else if (item instanceof TextFrame) {
				/*
				$.writeln( "-----------------Original---------------------\r\n"+
				"top: "+item.geometricBounds[0]+"\r\n"+
				"left: "+item.geometricBounds[1]+"\r\n"+
				"--------------------------------------\r\n"
				);*/
				sortedArray.push({
					top : Get_Geomentry(item, true)[0],
					left : Get_Geomentry(item, true)[1],
					item : item,
				});
			}
		}
		return sortedArray.sort(dynamicSort());
	}
	return traverse(this);
}

