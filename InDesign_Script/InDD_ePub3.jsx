#target 'indesign'
#include 'lib/impelsys/common/common_lib.js'
var reportFolder = null;

var inputFolderPath = openInputDoc();
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

var myDoc = app.activeDocument;
var LinkFolder = new Folder(Folder.decode(myDoc.fullName.parent) + '/Links');
LinkFolder = decodeURI(LinkFolder);

var missingLinks = 'File Name,Image Name,Image Path';
var missingFontsDetails = 'File Name,Font Name,Comments';
var zeroKBFontsDetails = 'File Name,Font Name,Font Path';
var textFrameReports = 'File Name,InDesign Page Number,Comments';
var errorReport = 'File Name,InDesign Page Number,Reference,Error';
var fontfaceRule="";
var threadedTextFramesArray = [];
var pagesArray = [];
var pageWidth = app.activeDocument.pages[0].bounds[3] - app.activeDocument.pages[0].bounds[1];
var pageHeight = app.activeDocument.pages[0].bounds[2] - app.activeDocument.pages[0].bounds[0];

/* Output Folder & Report Folder & file Creations */
    var outputFolder = new Folder(inputFolderPath + '/Output');
    if (outputFolder.exists) {
        outputFolder.delete();
    }
    outputFolder.create();
    
    var tempFolder = new Folder(inputFolderPath + '/Temp');
    if (tempFolder.exists) {
        tempFolder.delete();
    }
    tempFolder.create();


    var TemplateFolder = new Folder(new File($.fileName).parent + '/Template_Folder');
    TemplateFolder.copy(outputFolder);

    var htmlFolder = new Folder(outputFolder + '/OEBPS/html');
    var imagesFolder = new Folder(outputFolder + '/OEBPS/images');
    var fontFolder = new Folder(outputFolder + '/OEBPS/font');
    var cssFolder = new Folder(outputFolder + '/OEBPS/css');
    var templatecssFile = new File(cssFolder + '/template.css');

    //var reportFolder = new Folder(inputFolderPath + '/Report');
    //if (reportFolder.exists) {
       // reportFolder.delete();
    //}
    //reportFolder.create();

var missingLinkReportFile = new File(reportFolder + '/Missing_Links.csv');
missingLinkReportFile.open("w");

var missingFontsReportFile = new File(reportFolder + '/Missing_Fonts.csv');
missingFontsReportFile.open("w");

var zeroKBFontsReportFile = new File(reportFolder + '/ZeroKB_Fonts.csv');
zeroKBFontsReportFile.open("w");

var ThreadMissingReportFile = new File(reportFolder + '/ThreadMissing_Report.csv');
ThreadMissingReportFile.open("w");

var errorReportFile = new File(reportFolder + '/error_Report.csv');
errorReportFile.open("w");

Report();

missingLinkReportFile.writeln(missingLinks);
missingLinkReportFile.close(); //Link Missing Report File Ends Here

missingFontsReportFile.writeln(missingFontsDetails);
missingFontsReportFile.close(); //Font Missing Report File Ends Here

zeroKBFontsReportFile.writeln(zeroKBFontsDetails);
zeroKBFontsReportFile.close(); //Zero KB Font Report File Ends Here

ThreadMissingReportFile.writeln(textFrameReports);
ThreadMissingReportFile.close(); //Zero KB Font Report File Ends Here

Do();

errorReportFile.writeln(errorReport);
errorReportFile.close(); //Interior error Reports


app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.activeDocument.revert();
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;

/* Prototype for Unique finding and FInd in methods */

Array.prototype.unique = function (){
    var r = new Array();
    o:for(var i = 0, n = this.length; i < n; i++){
        for(var x = 0, y = r.length; x < y; x++){
            if(r[x]==this[i]) continue o;}
        r[r.length] = this[i];}
    return r;
}


Array.prototype.findIn = function(search){
    var r = Array();
    for (var i=0; i<this.length; i++)
        if (this[i].indexOf(search) != -1){
            r.push(this[i].substr(this[i].indexOf("\t") + 1, this[i].length));
        }
    return r;
}

/* Protype Ends Here */

function Report(){
    
    Relink_File(LinkFolder); // Missing Links Finding Function
    missingFont(myDoc); // Missing Fonts Finding Function
    fontSizeChecking(myDoc); //Font Family Update with Style
    threadedTextFrameChecking(myDoc);
   
}

function Do(){
    processDocument(myDoc);
    paragraphSplitting(myDoc);
templatecssFile.open('w');
    templateCSSFileCreation(myDoc,pageWidth,pageHeight); //template CSS File Creation
templatecssFile.close();
    softEnterAddingforEachLines(myDoc); //Soft Enter Adding for each line
    SplitStories(); // Split Stories
    objectStylePrefixadd(myDoc); //Object Style applied for each text Frames for Page & Frame identifications
    //ResizeOverset(); // Resize Overset Text Frames

    DefaulHTMLCreation(myDoc); //Frame wise travel and create a HTML
    contentExtraction(myDoc,pageWidth,pageHeight); // Content Extraction

}


function missingFont(myDoc){
    
    var usedFonts = myDoc.fonts;
    var missingFonts = Array();
    for(var i = 0; i < usedFonts.length; i++){
      if(usedFonts[i].status != FontStatus.INSTALLED)missingFonts.push(usedFonts[i]);
    } //Documents Fonts Loop Ends Here
    for(var j=0; j<missingFonts.length; j++){
        missingFontsDetails = missingFontsDetails + '\n' + myDoc.name + ',' + '"' + missingFonts[j].name + '"' + ',' + 'Font not installed in the current System';
    }// Missing Fonts Loop Ends Here
} // Missing Fonts Function Ends Here

function Relink_File(LinkFolder) {

    var AllLinks = app.activeDocument.links;
    for (var Li = 0; Li < AllLinks.length; Li++)
    {
        var ItemLink = new File(AllLinks[Li].filePath);
       
        var RelinkFile = new File(LinkFolder+ "/" + ItemLink.name);
       
        if (RelinkFile.exists)
        {
           //app.SetInteractionLevel(UserInteractionLevels.NEVER_INTERACT);
           AllLinks[Li].relink(RelinkFile);
           //app.SetInteractionLevel(UserInteractionLevels.INTERACT_WITH_ALL);
        }
        else{
            missingLinks = missingLinks + '\n' + '"' + myDoc.name + '"' + ',' + '"' + ItemLink.name + '"' + ',' + '"' + LinkFolder + '"';
        }
    }
}


function fontSizeChecking(myDoc){
    
    var fontFolder = new Folder(myDoc.fullName.parent + '/Document fonts');
    
    if(!fontFolder.exists){}
    else{
        var Fonts = fontFolder.getFiles();
        for(var i=0; i<Fonts.length; i++){
            if(Fonts[i].length == 0){
                zeroKBFontsDetails = zeroKBFontsDetails + '\n' + myDoc.name + ',' + '"' + Fonts[i].name + '"' + ',' + '"' + fontFolder + '"';
            }
        }
    }
}

function threadedTextFrameChecking(myDoc){

    var pages = myDoc.pages;
    for(var p=0; p<pages.length; p++){
            var page = pages[p];
            pagesArray.push(page.name);
            var pageItems = page.allPageItems;
            for(var pI=0; pI<pageItems.length; pI++){
                var pageItem = pageItems[pI];
                if(pageItem instanceof TextFrame){
                    if(pageItem.nextTextFrame){
                        try{
                            if(threadedTextFramesArray.toString().match(pageItem.nextTextFrame.parentPage.name)){}
                            else{
                                threadedTextFramesArray.push(pageItem.nextTextFrame.parentPage.name);
                            }
                        }
                        catch(e){
                            //errorReport = errorReport + '\n' + '"' + myDoc.name + '"' + ',' + '"' + page.name + '"' + ',' + 'Threaded Frame not found' + ',' + '"' + e + '"';
                        }
                    }
                }
            }
    }

    for(var i=pagesArray.length-1; i>=0; i--){
       try{
            if(threadedTextFramesArray.toString().match(pagesArray[i])){}
            else{
                textFrameReports = textFrameReports + '\n' + myDoc.name + ',' + pagesArray[i] + ',' + 'These pages are not linked with other pages in InDesign';
            }
        }
        catch(e){}
    }
}


function contentExtraction(myDoc,pageWidth,pageHeight){
    app.scriptPreferences.measurementUnit = MeasurementUnits.PIXELS;
    var metaTitle=myDoc.metadataPreferences.documentTitle;
    if(metaTitle == ''){
            metaTitle = myDoc.name;
    }
    app.SetInteractionLevel(UserInteractionLevels.NEVER_INTERACT);
    var pages = myDoc.pages;
    var coverHTMLFile = new File(htmlFolder + '/cover.xhtml');
    var backCoverHTMLFile = new File(htmlFolder + '/backcover.xhtml');
    var navHTMLFile = new File(htmlFolder + '/nav.xhtml');
    var TOCNCXFile = new File(outputFolder + '/OEBPS' + '/toc.ncx');
    var pageNumber = "";
    var htmlContent = "";
    hardCodedHTMLCreation(coverHTMLFile,'cover.jpg',pageWidth,pageHeight,metaTitle);
    hardCodedHTMLCreation(backCoverHTMLFile,'backcover.jpg',pageWidth,pageHeight,metaTitle);
    ncxCreation(TOCNCXFile);

    navHTMLFile.open('w');
    navHTMLFile.encoding = "utf-8";
    navHTMLFile.writeln('<?xml version="1.0" encoding="UTF-8"?>\n');
    navHTMLFile.writeln('<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" xmlns:epub="http://www.idpf.org/2007/ops">\n');
    navHTMLFile.writeln('<head>\n');
    navHTMLFile.writeln('<meta charset="utf-8" />\n');
    navHTMLFile.writeln('<title>Title</title>\n');
    navHTMLFile.writeln('</head>\n');
    navHTMLFile.writeln('<body>\n');
    navHTMLFile.writeln('<section class="frontmatter TableOfContents" epub:type="frontmatter toc">\n');
    navHTMLFile.writeln('<nav xmlns:epub="http://www.idpf.org/2007/ops" epub:type="toc" id="toc">\n');
    navHTMLFile.writeln('<ol>\n');
    navHTMLFile.writeln('<li>\n');
    navHTMLFile.writeln('<li><a href="cover.xhtml">Cover</a></li>\n');
    navHTMLFile.writeln('</ol>\n');
    navHTMLFile.writeln('</nav>\n');
    navHTMLFile.writeln('</section>\n');
    navHTMLFile.writeln('</body>\n');
    navHTMLFile.writeln('</html>\n');
    

    for(var p=0; p<pages.length; p++){
        var wordCount = 0;
        var lineCount = 0;
        var FrameCount = 0;
        var page = pages[p];
        if((p+1) < 10){
           pageNumber = '00' + (p+1);
        }
        else if((p+1) < 100){
            pageNumber = '0' + (p+1);
        }
        else{
            pageNumber = (p+1);
        }
        var htmlFile = new File(htmlFolder + '/page' + pageNumber+ '.xhtml');
        //htmlContent = htmlContent + '\n' + '<nav>' + '\n' + '<ol>' + '\n' + '<li>' + '\n' + '<a href="' + 'page' + pageNumber + '.xhtml' + '">' + 'Page ' + pageNumber + '</a>' + '</li>' + '</ol>'+ '\n' + '</nav>' + '\n';

        htmlFile.open('w');
        htmlFile.encoding = "utf-8";
        htmlFile.writeln('<?xml version="1.0" encoding="UTF-8"?>\n');
        htmlFile.writeln('<!DOCTYPE html>\n');
        htmlFile.writeln('<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" xmlns:epub="http://www.idpf.org/2007/ops">\n');
        htmlFile.writeln('<head>\n');
        htmlFile.writeln('<meta name="viewport" content="width=' + (pageWidth + 10) + ', height=' + (pageHeight +30) + '"></meta>\n');
        htmlFile.writeln('<title>' + metaTitle + '</title>\n');
        htmlFile.writeln('<link href="../css/template.css" rel="stylesheet" type="text/css"/>\n');        
        htmlFile.writeln('<link href="../css/page' + (p+1) + '.css' + '" rel="stylesheet" type="text/css"/>\n');        
        htmlFile.writeln('</head>\n');
        htmlFile.writeln('<body>\n');
        htmlFile.writeln('<div class="imageContainer">\n');
        htmlFile.writeln('<img src="' + '../images/page' + (p+1) + '.jpg" />\n');
        htmlFile.writeln('</div>\n');
        
        var cssFile = new File(cssFolder + '/page' + (p+1)+ '.css');
        cssFile.open('w');
        cssFile.writeln('body {\n' + 'width: ' + (pageWidth + 10) + 'px;\n' + 'height: ' +  (pageHeight +30)  + 'px;\n' + 'z-index: 1;\nposition: absolute;\n' + '}\n');
        cssFile.writeln('.imageContainer img{\n' + 'width: ' + (pageWidth + 10) + 'px;\n' + 'height: ' +  (pageHeight +30)  + 'px;\n' + 'z-index: 0;\nposition: absolute;\n'+ '}\n');
        cssFile.writeln('.FolioPageNumber{\n' + 'text-align: ' + 'center;\n' + 'margin-left: ' +  '30'  + 'px;\n'+ '}\n');
        
        var paragraphStylesList = myDoc.allParagraphStyles;
        for(var pS=0; pS<paragraphStylesList.length; pS++){
            if(paragraphStylesList[pS].parent instanceof ParagraphStyleGroup){
                if(paragraphStylesList[pS].appliedFont.name.toString().match('Roman') || paragraphStylesList[pS].appliedFont.name.toString().match('Regular')){}
                else{
                    cssFile.writeln('.' + paragraphStylesList[pS].parent.name.toString().replace(/\[/g,'').replace(/\]/g,'').replace(/\s/g,'-').replace(/\//g,'-') + '_' + paragraphStylesList[pS].name.toString().replace(/\[/g,'').replace(/\//g,'-').replace(/\]/g,'').replace(/\s/g,'-') + ' {\n' + 'font-family: "' + paragraphStylesList[pS].appliedFont.name.toString().replace('\t',' ') + '" !important;\n}\n');
                }
            }
            else{
                if(paragraphStylesList[pS].appliedFont.name.toString().match('Roman') || paragraphStylesList[pS].appliedFont.name.toString().match('Regular')){}
                else{
                    cssFile.writeln('.' + paragraphStylesList[pS].name.toString().replace(/\[/g,'').replace(/\]/g,'').replace(/\//g,'-').replace(/\s/g,'-') + ' {\n' + 'font-family: "' + paragraphStylesList[pS].appliedFont.name.toString().replace('\t',' ') + '" !important;\n}\n');
                }
            }
        }
        
        var pageItems = page.allPageItems;
        for(var pI=0; pI<pageItems.length; pI++){
            pageItem = pageItems[pI];
            if(pageItem instanceof TextFrame){
                FrameCount++;
                htmlFile.writeln('<div class="TextFrame' + FrameCount + '">\n');
                
                try{
                    var FrameTop = pageItem.geometricBounds[0];
                    var FrameLeft = pageItem.geometricBounds[1];
                    var FrameWidth = pageItem.geometricBounds[3] - pageItem.geometricBounds[1];
                    var FrameHeight = pageItem.geometricBounds[2] - pageItem.geometricBounds[0];
                }
                catch(e){
                    errorReport = errorReport + '\n' + '"' + myDoc.name + '"' + ',' + '"' + page.name + '"' + ',' + '"' + 'Frame Sequence Number: ' + FrameCount + '"' + ',' + '"' + e + '"';
                }
                cssFile.writeln('div.TextFrame' + FrameCount + ' {\n' + 'position: absolute;\n' + 'top: ' + FrameTop + 'px;\n' + 'left: ' + FrameLeft + 'px;\n' + 'height: ' + FrameHeight + 'px;\n' + 'width: ' + (FrameWidth + 10) + 'px;\n}\n');
                htmlFile.writeln('</div>\n');
            }
            else{}
        }
    
        
        htmlFile.writeln('</body>\n');
        htmlFile.writeln('</html>\n');
        htmlFile.close();
        
        cssFile.close();
    }

    //navHTMLFile.writeln(htmlContent);
    //navHTMLFile.writeln('</li>\n');
    //navHTMLFile.writeln('</ol>\n');
    //navHTMLFile.writeln('</div>\n');
    //navHTMLFile.writeln('</body>\n');
    //navHTMLFile.writeln('</html>\n');
    //navHTMLFile.close();
        
    app.SetInteractionLevel(UserInteractionLevels.INTERACT_WITH_ALL);
}


function templateCSSFileCreation(myDoc,pageWidth,pageHeight){
    var TempFile = new File(Folder.temp + "/temp.html");
    app.activeDocument.exportFile(ExportFormat.HTML, TempFile);
    var cssFolder = new Folder(Folder.temp + "/temp-web-resources/css");
    var cssFiles = cssFolder.getFiles();
    
    var cssFile = new File(cssFiles[0]);
    cssFile.open("r");
    cssFile.encoding = "utf-8";
    var TotalText = "";
    for(var fon=0;fon<app.activeDocument.fonts.length;fon++)
    {

      var st="";
      try
      {
            st=" "+app.activeDocument.fonts[fon].fontStyleName;
            var fontFile = new File(app.activeDocument.fonts[fon].location);
            fontFile.copy(fontFolder + '/' + fontFile.name);
            if(st.toString().toLowerCase().match('roman')){
                st = "";
            }
            if(st.toString().match('Regular')){
                st = "";
            }
            fontfaceRule=fontfaceRule+'@font-face{font-family: "'+app.activeDocument.fonts[fon].fontFamily+st+ '"' + "; src: url('../font/"+fontFile.name+"');}\r\n"
        }
       catch(e){}
    }
    var regex = /^[A-z0-9]+\./g;
    while (!cssFile.eof)
    {
        var Line = cssFile.read();
        TotalText = TotalText + Line.toString().replace(regex,'.')+"\r\n";
    }
    cssFile.close();
    templatecssFile.open("w");
    templatecssFile.encoding = "utf-8";
    templatecssFile.writeln(fontfaceRule + 'body{\n' + 'width: ' +  (pageWidth + 10)  + 'px;\n' + 'height: ' +  (pageHeight +30)  + 'px;\nposition: absolute;\n}\n' + '.imageContainer{\n' + 'width: ' +  (pageWidth + 10)  + 'px;\n' + 'height: ' +  (pageHeight +30)  + 'px;\nposition: absolute;\n}\n' + TotalText);
    templatecssFile.close();
}



function DefaulHTMLCreation(myDoc){
    var TotalText = "";
    var myFile = new File(tempFolder + "/temp.html");
    myDoc.exportFile(ExportFormat.HTML,myFile,false);
}


function hardCodedHTMLCreation(myFile,imageName,pageWidth,pageHeight,metaTitle){
    myFile.open('w');
    myFile.encoding = "utf-8";
    myFile.writeln('<?xml version="1.0" encoding="UTF-8"?>\n');
    myFile.writeln('<!DOCTYPE html>\n');
    myFile.writeln('<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" xmlns:epub="http://www.idpf.org/2007/ops">\n');
    myFile.writeln('<head>\n');
    myFile.writeln('<meta name="viewport" content="width=' + (pageWidth + 10)  + ', height=' +  (pageHeight +30)  + '"></meta>\n');
    myFile.writeln('<title>' + metaTitle + '</title>\n');
    myFile.writeln('<link href="../css/template.css" rel="stylesheet" type="text/css"/>\n');        
    myFile.writeln('</head>\n');
    myFile.writeln('<body>\n');
    myFile.writeln('<div class="imageContainer">\n');
    myFile.writeln('<img src="' + '../images/' + imageName + '">\n');
    myFile.writeln('</div>\n');
    myFile.writeln('</body>\n');
    myFile.writeln('</html>\n');  
    myFile.close();
}

function objectStylePrefixadd(myDoc){

    app.SetInteractionLevel(UserInteractionLevels.NEVER_INTERACT);
    var pages = myDoc.pages;
    var characterStyles = myDoc.characterStyles;
    var pageFound = false;
    var FrameFound = false;
    var pageNumber = "";
    for(var p=0; p<pages.length; p++){ /*Page Loop Starts */
        var page = pages[p];
        var FrameCount = 0;
         if((p+1) < 10){
           pageNumber = '00' + (p+1);
        }
        else if((p+1) < 100){
            pageNumber = '0' + (p+1);
        }
        else{
            pageNumber = (p+1);
        }
    
        pageStyle = myDoc.objectStyles.add({
            name: 'Page' + pageNumber
        });
        var textFrames = page.textFrames;
    
        for(var tF=0; tF<textFrames.length; tF++){
            if(tF == 0){
                textFrames[tF].appliedObjectStyle = pageStyle;
            }
            else{
                if(myDoc.objectStyles.item('Page' + pageNumber + '_Frame' + (tF+1)) == null) {
                    frameStyle = myDoc.objectStyles.add({
                        name: 'Page' + pageNumber + '_Frame' + (tF+1)
                    });
                }
                textFrames[tF].appliedObjectStyle = frameStyle;
            }
            
        }
    }
    app.SetInteractionLevel(UserInteractionLevels.INTERACT_WITH_ALL);
}
function softEnterAddingforEachLines(myDoc){

    app.SetInteractionLevel(UserInteractionLevels.NEVER_INTERACT);
    var pages = myDoc.pages;
    for(var p=0; p<pages.length; p++){ /*Page Loop Starts */
        var page = pages[p];
        var textFrames= page.textFrames;
        for(var tF=0; tF<textFrames.length; tF++){
            textFrame = textFrames[tF];
            var myLines = textFrame.lines;
            for(var l=0; l<myLines.length; l++){
                var line = myLines[l];
                try{
                    if(line.characters[-1].contents != '\r' && line.characters[-1].contents.toString() != 'FORCED_LINE_BREAK' && line.characters[-1].contents.toString() != 'PAGE_BREAK' && line.characters[-1].contents.toString() != 'FRAME_BREAK'){
                        if(line.characters[-1].contents.toString() == ' '){
                            line.characters[-1].contents = '\n';
                        }
                        else{
                            line.contents = line.contents + '\n';
                        }
                    }
                }
                catch(e){
                    //errorReport = errorReport + '\n' + myDoc.name + ',' + page.name + ',' + 'Not able to find the last character of the line. Line Number: ' + (l+1) + ',' + '"' + line.contents + '"';
                }
                
            }
        }
    }
    app.SetInteractionLevel(UserInteractionLevels.INTERACT_WITH_ALL);
}
function SplitStories()
{
    var pages=app.activeDocument.pages;
     for (var set = 0; set < pages.length; set++)
     {
         var textFrames_are=pages[set].textFrames;
         for (var set2 = 0; set2 < textFrames_are.length; set2++)
         {
             var mySelection2=textFrames_are[set2]
             if(mySelection2.parentStory.textContainers.length > 1)
             {
						mySplitStory(mySelection2.parentStory);
						myRemoveFrames(mySelection2.parentStory);
             }
         }
     }
}
function mySplitStory(myStory)
{
	var myTextFrame;
	//Duplicate each text frame in the story.
      for(var myCounter =myStory.textContainers.length-1;myCounter>=0;myCounter--)
      {
         myTextFrame = myStory.textContainers[myCounter];
         myTextFrame.duplicate();
     }
}
function myRemoveFrames(myStory)
{
	var myTextFrame;
	//Remove each text frame in the story.
      for(var myCounter =myStory.textContainers.length-1;myCounter>=0;myCounter--)
      {
         myTextFrame = myStory.textContainers[myCounter];
         try
         {
           myTextFrame.remove();
         }
        catch(e)
        {
            //errorReport = errorReport + '\n' + myDoc.name + ',' + '' + ',' + '"' + 'Error in myRemoveFrames() method: ' + e + '"';
        }
      }
}


function ResizeOverset() { 
        var doc = app.activeDocument;

	var lastFrame,
	stories = doc.stories; 
	for (var j = stories.length - 1; j >= 0; j--) { 
		if (stories[j].overflows == true) { 
			lastFrame = stories[j].texts[0].parentTextFrames[stories[j].texts[0].parentTextFrames.length - 1]; 
            try
            {
			lastFrame.fit(FitOptions.FRAME_TO_CONTENT); 
            }
            catch(ert)
            {
                }
		} 
	} 
}

function openInputDoc(){

    var inputDoc = new String();
    var inputFolder = new String();
    var InputTextFile = new File(new File($.fileName).parent + "/testfile.txt");
    if (InputTextFile.exists) {
       InputTextFile.open("r");
       var linecount = 0;
       while (!InputTextFile.eof) {
           var line = InputTextFile.readln();
           linecount++;
           if (linecount == 1) {
               inputDoc= new File(line.split(",")[0]);
               inputFolder = new Folder(inputDoc.parent);
               reportFolder = new Folder(line.split(",")[1]);
            
           } else if (linecount == 2) {}
       }
    } else {}

    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
    app.open(inputDoc);
    var rootFolder = new Folder(inputDoc.toString().replace(inputDoc.name.toString(),''));
    app.activeDocument.save(new File(rootFolder+ '/' +  inputDoc.name));

    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
    return inputFolder;
}

function paragraphSplitting(myDoc){

    var stories = myDoc.stories;
    for(var s=0; s<stories.length; s++){
            var story = stories[s];
            for(var p=0; p<story.paragraphs.length; p++){
                var para = story.paragraphs[p];
                if(para.parentTextFrames.length == 2){
                  if(para.parentTextFrames[0].parentPage.name !=   para.parentTextFrames[1].parentPage.name){
                      
                      /* Paragraph Splitting */
                      var FirstPagetextFrames = para.parentTextFrames[0].parentPage.textFrames;
                      var lastFrame = FirstPagetextFrames[FirstPagetextFrames.length-1];
                      var lastLine = lastFrame.lines[lastFrame.lines.length-1];
                      try{
                        if(lastLine.characters[-1].contents != '\r' && lastLine.characters[-1].contents.toString() != 'FORCED_LINE_BREAK' && lastLine.characters[-1].contents.toString() != 'PAGE_BREAK' && lastLine.characters[-1].contents.toString() != 'FRAME_BREAK'){
                                if(lastLine.characters[-1].contents.toString() == ' '){
                                    lastLine.characters[-1].contents = '\r';
                                }
                                else{
                                    lastLine.contents = lastLine.contents + '\r';
                                }
                            }
                        }
                        catch(e){
                            //errorReport = errorReport + '\n' + myDoc.name + ',' + lastLine.parentPage.name + ',' + 'lastLine Not found';
                        }
                    
                        /*no Indent Style Applied */
                        
                        var LastPageTextFrames = para.parentTextFrames[1].parentPage.textFrames;
                        var firstFrame = LastPageTextFrames[0];
                        var firstParagraph = firstFrame.paragraphs[0];
                        try{
                            firstParagraph.firstLineIndent = '0';
                        }
                        catch(e){}
                  }
                }
            }
    }

}


function processDocument(docRef) {
    if (docRef == null || docRef == '') {
        return false;
    }
    var masterCount = docRef.masterSpreads.length;
    if (masterCount > 0) {
        for( var i = 0; i < masterCount; i++) {
            var m = docRef.masterSpreads[i];
            var pageCount = m.pages.length;
            if (pageCount > 0) {
                for( var j = 0; j < pageCount; j++) {
                    var p = m.pages[j];
                    OverrideMasterItems(p);
                }
            }
        }
    }
 
      var pageCount = docRef.pages.length;
      if (pageCount > 0) {
            for( var i = 0; i < pageCount; i++) {
                  var p = docRef.pages[i];
                  OverrideMasterItems(p);
            }
      }
}
 
function OverrideMasterItems(p) {
    if (p == null || p == '') {
        return false;
    }
    if (p.appliedMaster == null || p.appliedMaster == '') {
        return false;
    }
   
    //Override all items on Page
    var allItems = p.appliedMaster.pageItems.everyItem().getElements();
    for(var i=0;i<allItems.length;i++){
        var pi = allItems[i];
        if (!pi.overridden) {
            try{
                allItems[i].override(p);
            }
            catch(e){
                //errorReport = errorReport + '\n' + '"' + myDoc.name + '"' + ',' + '"' + p.name + '"' + ',' + '"' + e + '"';
            }
        }
    }
 
    //Remove master from page 
    p.appliedMaster = NothingEnum.nothing;
} //END OverrideMasterItems

function ncxCreation(file){
    file.open('w');
    file.encoding = 'utf-8';
    file.writeln('<?xml version="1.0" encoding="utf-8"?>\n');
    file.writeln('<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="en">\n');
    file.writeln('<head>\n');
    file.writeln('<meta name="dtb:uid" content="ISBN"/>\n');
    file.writeln('<meta name="dtb:depth" content="1"/>\n');
    file.writeln('<meta name="dtb:totalPageCount" content="108"/>\n');
    file.writeln('<meta name="dtb:maxPageNumber" content="0"/>\n');
    file.writeln('</head>\n');
    file.writeln('<docTitle><text>Title</text></docTitle>\n');
    file.writeln('<docAuthor><text>Author</text></docAuthor>\n');
    file.writeln('<navMap>\n');
    file.writeln('<navPoint class="coverpage" id="1" playOrder="1"><navLabel><text>Title</text></navLabel><content src="html/cover.xhtml"/></navPoint>\n');
    file.writeln('</navMap>\n');
    file.writeln('</ncx>\n');
    file.close();
}