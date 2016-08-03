#target 'indesign'
#include 'lib/impelsys/common/common_lib.js'
var myDoc = app.activeDocument;
var LinkFolder = new Folder(Folder.decode(myDoc.fullName.parent) + '/Links');
LinkFolder = decodeURI(LinkFolder);

var missingLinks = 'File Name,Image Name, Image Path';
var missingFontsDetails = 'File Name,Font Name';
var zeroKBFontsDetails = 'File Name,Font Name,Font Path';
var CharacterStyleErrorDetails = 'File Name,InDesign Page Number,HTML Page Number,Word,Character Style Name,Comments';
var textFrameReports = 'File Name,InDesign Page Number,Comments';
var missingLinksFound = false;
var missingFontsFound = false;
var fontfaceRule="";
var threadedTextFramesArray = [];
var pagesArray = [];
var pageWidth = app.activeDocument.pages[0].bounds[3] - app.activeDocument.pages[0].bounds[1];
var pageHeight = app.activeDocument.pages[0].bounds[2] - app.activeDocument.pages[0].bounds[0];

/* Output Folder & Report Folder & file Creations */
    var outputFolder = new Folder(app.activeDocument.fullName.parent + '/Output');
    if (outputFolder.exists) {
        outputFolder.remove();
    }
    outputFolder.create();
    
    var tempFolder = new Folder(app.activeDocument.fullName.parent + '/Temp');
    if (tempFolder.exists) {
        tempFolder.remove();
    }
    tempFolder.create();


    var TemplateFolder = new Folder(new File($.fileName).parent + '/Template_Folder');
    TemplateFolder.copy(outputFolder);

    var htmlFolder = new Folder(outputFolder + '/OEBPS/html');
    var imagesFolder = new Folder(outputFolder + '/OEBPS/images');
    var fontFolder = new Folder(outputFolder + '/OEBPS/font');
    var cssFolder = new Folder(outputFolder + '/OEBPS/css');
    var templatecssFile = new File(cssFolder + '/template.css');

    var reportFolder = new Folder(app.activeDocument.fullName.parent + '/Report');
    if (reportFolder.exists) {
        reportFolder.remove();
    }
    reportFolder.create();

var missingLinkReportFile = new File(reportFolder + '/Missing_Links.csv');
missingLinkReportFile.open("w");

var missingFontsReportFile = new File(reportFolder + '/Missing_Fonts.csv');
missingFontsReportFile.open("w");

var zeroKBFontsReportFile = new File(reportFolder + '/ZeroKB_Fonts.csv');
zeroKBFontsReportFile.open("w");

var ThreadMissingReportFile = new File(reportFolder + '/ThreadMissing_Report.csv');
ThreadMissingReportFile.open("w");

var CharacterStyleErrorDetailsReportFile = new File(reportFolder + '/CharacterStyleErrorDetails_Report.csv');
CharacterStyleErrorDetailsReportFile.open("w");

Report();

missingLinkReportFile.writeln(missingLinks);
missingLinkReportFile.close(); // Link Missing Report File Ends Here

missingFontsReportFile.writeln(missingFontsDetails);
missingFontsReportFile.close(); // Font Missing Report File Ends Here

zeroKBFontsReportFile.writeln(zeroKBFontsDetails);
zeroKBFontsReportFile.close(); // Zero KB Font Report File Ends Here

ThreadMissingReportFile.writeln(textFrameReports);
ThreadMissingReportFile.close(); // Zero KB Font Report File Ends Here

/* Output Folder & Report Folder & file Creations */
if(missingLinksFound){
    var cont = confirm("Few links are missing in the input INDD document. Do you still want to continue?", true, "Alert!");
    if (cont) {
        //return NothingEnum.NOTHING;
    } else {
        exit(0);
    }
}
if(missingFontsFound){
    var cont = confirm("Few fonts are missing in the input INDD document. Do you still want to continue?", true, "Alert!");    
    if (cont) {
        //return NothingEnum.NOTHING;
    } else {
        exit(0);
    }
}
if(missingLinksFound && missingFontsFound){
    var cont = confirm("Few links and fonts are missing in the input INDD document. Do you still want to continue?", true, "Alert!");
    if (cont) {
        //return NothingEnum.NOTHING;
    } else {
        exit(0);
    }
}


Do();

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.activeDocument.revert();
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;

//app.activeDocument.close();

alert('Completed');

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

templatecssFile.open('w');
//characterStylePrefixadd(myDoc); //character Style Prefix added to each style
//characterStyleSuffixadd(myDoc); //character Style Suffix added to each style
softEnterAddingforEachLines(myDoc);
pageWiseCharacterIdentification(myDoc);

    CharacterStyleErrorDetailsReportFile.writeln(CharacterStyleErrorDetails);
    CharacterStyleErrorDetailsReportFile.close(); // Zero KB Font Report File Ends Here

templateCSSFileCreation(myDoc,pageWidth,pageHeight); //template CSS File Creation
DefaulHTMLCreation(myDoc); //Frame wise travel and create a HTML
contentExtraction(myDoc,pageWidth,pageHeight); // Content Extraction
CreatePageImages(myDoc); //All the text are removed from Indesign

templatecssFile.close();

}


function missingFont(myDoc){
    
    var usedFonts = myDoc.fonts;
    var missingFonts = Array();
    for(var i = 0; i < usedFonts.length; i++){
      if(usedFonts[i].status != FontStatus.INSTALLED)missingFonts.push(usedFonts[i]);
    } //Documents Fonts Loop Ends Here
    if(missingFonts.length > 0){
        missingFontsFound = true;
    } //Missing Fonts Condition Ends Here
    for(var j=0; j<missingFonts.length; j++){
        missingFontsDetails = missingFontsDetails + '\n' + myDoc.name + ',' + '"' + missingFonts[j].name + '"';
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
            missingLinksFound = true;
        }
    }
}


function fontSizeChecking(myDoc){
    var fontFolder = new Folder(myDoc.fullName.parent + '/Document fonts');
    if(!fontFolder.exists){
         var cont = confirm("'Document fonts' folder doesn't exists in the active Document input Folder. It may cause the font missing issue on the output file. Do you still want to continue?", true, "Alert!");
        if (cont) {
            //return NothingEnum.NOTHING;
        } else {
            exit(0);
        }
    }
    else{
        var Fonts = fontFolder.getFiles();
        for(var i=0; i<Fonts.length; i++){
            if(Fonts[i].length == 0){
                zeroKBFontsDetails = zeroKBFontsDetails + '\n' + myDoc.name + ',' + '"' + Fonts[i].name + '"' + ',' + '"' + fontFolder + '"';
            }
        }
    }

}

function contentExtraction(myDoc,pageWidth,pageWidth){
    app.scriptPreferences.measurementUnit = MeasurementUnits.PIXELS;
    //var pageWidth = app.activeDocument.pages[0].bounds[3] - app.activeDocument.pages[0].bounds[1];
    //var pageHeight = app.activeDocument.pages[0].bounds[2] - app.activeDocument.pages[0].bounds[0];
    var metaTitle=myDoc.metadataPreferences.documentTitle;
    app.SetInteractionLevel(UserInteractionLevels.NEVER_INTERACT);
    var pages = myDoc.pages;
    var coverHTMLFile = new File(htmlFolder + '/cover.html');
    var backCoverHTMLFile = new File(htmlFolder + '/backcover.html');
    
    hardCodedHTMLCreation(coverHTMLFile,'cover.jpg',pageWidth,pageHeight,metaTitle);
    hardCodedHTMLCreation(backCoverHTMLFile,'backcover.jpg',pageWidth,pageHeight,metaTitle);

    for(var p=0; p<pages.length; p++){
        var wordCount = 0;
        var lineCount = 0;
        var FrameCount = 0;
        var page = pages[p];
        var htmlFile = new File(htmlFolder + '/page' + (p+1)+ '.html');
        htmlFile.open('w');
        htmlFile.encoding = "utf-8";
        htmlFile.writeln('<?xml version="1.0" encoding="UTF-8"?>\n');
        htmlFile.writeln('<!DOCTYPE html>\n');
        htmlFile.writeln('<html xmlns="http://www.w3.org/1999/xhtml" xmlns:ibooks="http://apple.com/ibooks/html-extensions" xmlns:epub="http://www.idpf.org/2007/ops">\n');
        htmlFile.writeln('<head>\n');
        htmlFile.writeln('<meta name="viewport" content="width=' + pageWidth + ', height=' + pageHeight + '"></meta>\n');
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
        cssFile.writeln('body {\n' + 'width: ' + pageWidth + 'px;\n' + 'height: ' + pageHeight + 'px;\n' + 'z-index: 1;\n' + '}\n');
        cssFile.writeln('.imageContainer {\n' + 'width: ' + pageWidth + 'px;\n' + 'height: ' + pageHeight + 'px;\n' + 'z-index: 0;\n' + '}\n');
        
        var pageItems = page.allPageItems;
        for(var pI=0; pI<pageItems.length; pI++){
            pageItem = pageItems[pI];
            if(pageItem instanceof TextFrame){
                FrameCount++;
                htmlFile.writeln('<div class="TextFrame' + FrameCount + '">\n');
                var FrameTop = pageItem.geometricBounds[0];
                var FrameLeft = pageItem.geometricBounds[1];
                var FrameWidth = pageItem.geometricBounds[3] - pageItem.geometricBounds[1];
                var FrameHeight = pageItem.geometricBounds[2] - pageItem.geometricBounds[0];

                cssFile.writeln('div.TextFrame' + FrameCount + ' {\n' + 'position: absolute;\n' + 'top: ' + FrameTop + 'px;\n' + 'left: ' + FrameLeft + 'px;\n' + 'height: ' + FrameHeight + 'px;\n' + '}\n');
                htmlFile.writeln('</div>\n');
            }
            else{}
        }
    
        
        htmlFile.writeln('</body>\n');
        htmlFile.writeln('</html>\n');
        htmlFile.close();
        
        cssFile.close();
    }
    app.SetInteractionLevel(UserInteractionLevels.INTERACT_WITH_ALL);
}


function CreatePageImages(myDoc){
      for(var c=0;c<myDoc.stories.length;c++)
     {
          var Item=myDoc.stories[c];
         
           Item.contents="";
     }
      PrintPageImages(myDoc);
      app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
      app.activeDocument.revert();
      app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
}

function PrintPageImages(myDoc){
    app.jpegExportPreferences.exportResolution=72;
    app.jpegExportPreferences.jpegColorSpace=JpegColorSpaceEnum.RGB;
    app.jpegExportPreferences.jpegExportRange=ExportRangeOrAllPages.EXPORT_RANGE;
    app.jpegExportPreferences.useDocumentBleeds=false;
    for(var t=0;t<myDoc.pages.length;t++)
    {
        app.jpegExportPreferences.pageString=app.activeDocument.pages[t].name;
        myDoc.exportFile(ExportFormat.JPG, new File(imagesFolder + "/page" + (t+1) + ".jpg"));
    }
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
          }
          catch(Erte)
          {
              //missingFontsDetails = missingFontsDetails + '\n' + 
              //LastException=LastException+"{Error in ExtractStories() method: "+Erte+"}";
          }
        var fontFile = new File(app.activeDocument.fonts[fon].location);
        fontFile.copy(fontFolder + '/' + fontFile.name);
        if(st.toString().toLowerCase().match('roman')){
            st = "";
        }
        fontfaceRule=fontfaceRule+'@font-face{font-family: "'+app.activeDocument.fonts[fon].fontFamily+st+ '"' + "; src: url('../font/"+fontFile.name+"');}\r\n"
    }
    
    while (!cssFile.eof)
    {
        var Line = cssFile.read();
        TotalText = TotalText + Line.toString().replace(regex,'.')+"\r\n";
    }
    cssFile.close();
    templatecssFile.open("w");
    templatecssFile.encoding = "utf-8";
    var regex = /^[A-z0-9]+\./g;
    templatecssFile.writeln(fontfaceRule + 'body{\n' + 'width: ' +  pageWidth + 'px;\n' + 'height: ' + pageHeight + 'px;\n}\n' + '.imageContainer{\n' + 'width: ' +  pageWidth + 'px;\n' + 'height: ' + pageHeight + 'px;\n}\n' + TotalText);
    templatecssFile.close();
}



function characterStylePrefixadd(myDoc){

    app.SetInteractionLevel(UserInteractionLevels.NEVER_INTERACT);
    var pages = myDoc.pages;
    var characterStyles = myDoc.characterStyles;
    lineStartStyle = myDoc.characterStyles.add({
        name: 'LineStart'
    });
    var auto_cstyle_number = 0;
    var pageFound = false;
    var FrameFound = false;
    for(var p=0; p<pages.length; p++){ /*Page Loop Starts */
        var page = pages[p];
        pageFound = true;
        var FrameCount = 0;
        pageStartStyle = myDoc.characterStyles.add({
            name: 'Page' + (p+1) + 'Start'
        });
        var pageItems = page.allPageItems;
        for(var pI=0; pI<pageItems.length; pI++){
            pageItem = pageItems[pI];
            if(pageItem instanceof TextFrame){
                FrameFound = true;
                FrameCount++;
                if(myDoc.characterStyles.item('Frame' + FrameCount + 'Start') == null) {
                    frameStartStyle = myDoc.characterStyles.add({
                        name: 'Frame' + FrameCount + 'Start'
                    });
                }
                var myLines = pageItem.lines;
                for(var l=0; l<myLines.length; l++){
                    var line = myLines[l];
                    var words = line.words;
                    if(line.words.length > 0){
                        var firstWord = line.words[0];
                        if(firstWord.isValid){
                            if(pageFound && FrameFound){
                                if(firstWord.appliedCharacterStyle.name == '[None]'){
                                    firstWord.appliedCharacterStyle = pageStartStyle;
                                }
                                else if(firstWord.appliedCharacterStyle.name != 'LineStart' && firstWord.appliedCharacterStyle.name != 'LineEnd' && firstWord.appliedCharacterStyle.name != 'LineStartEnd' && firstWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'Start' && firstWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'End' && firstWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'StartEnd' && firstWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'Start' && firstWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'StartEnd' && firstWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'End'){
                                    //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstWord.contents + '"' + ',' + '"' + firstWord.appliedCharacterStyle.name + '"' + ',' + 'First Word of the Page not Found';
                                }
                                pageFound = false;
                                FrameFound = false;
                            }
                            else if(FrameFound && !pageFound){
                                if(firstWord.appliedCharacterStyle.name == '[None]'){
                                    firstWord.appliedCharacterStyle = frameStartStyle;
                                }
                                else if(firstWord.appliedCharacterStyle.name != 'LineStart' && firstWord.appliedCharacterStyle.name != 'LineEnd' && firstWord.appliedCharacterStyle.name != 'LineStartEnd' && firstWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'Start' && firstWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'End' && firstWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'StartEnd' && firstWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'Start' && firstWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'StartEnd' && firstWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'End'){
                                    //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstWord.contents + '"' + ',' + '"' + firstWord.appliedCharacterStyle.name + '"' + ',' + 'First Word of the Frame not Found';
                                }
                                FrameFound = false;
                            }
                            else{
                                if(firstWord.appliedCharacterStyle.name == '[None]'){
                                    firstWord.appliedCharacterStyle = lineStartStyle;
                                }
                                else if(firstWord.appliedCharacterStyle.name != 'LineStart' && firstWord.appliedCharacterStyle.name != 'LineEnd' && firstWord.appliedCharacterStyle.name != 'LineStartEnd' && firstWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'Start' && firstWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'End' && firstWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'StartEnd' && firstWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'Start' && firstWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'StartEnd' && firstWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'End'){
                                    //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstWord.contents + '"' + ',' + '"' + firstWord.appliedCharacterStyle.name + '"' + ',' + 'First Word of the Line not Found';
                                }
                            }
                        }
                    }
                }
            }
            else{}
        }
    }
    app.SetInteractionLevel(UserInteractionLevels.INTERACT_WITH_ALL);
}
function characterStyleSuffixadd(myDoc){

    app.SetInteractionLevel(UserInteractionLevels.NEVER_INTERACT);
    var pages = myDoc.pages;
    var characterStyles = myDoc.characterStyles;
    lineEndStyle = myDoc.characterStyles.add({
        name: 'LineEnd'
    });
    lineStartEndStyle = myDoc.characterStyles.add({
        name: 'LineStartEnd'
    });
    var pageFound = false;
    var FrameFound = false;
    var auto_cstyle_number = 0;
    for(var p=0; p<pages.length; p++){ /*Page Loop Starts */
        var page = pages[p];
        pageFound = true;
        var FrameCount = 0;
        pageEndStyle = myDoc.characterStyles.add({
            name: 'Page' + (p+1) + 'End'
        });

        
        var pageItems = page.allPageItems;
        for(var pI=0; pI<pageItems.length; pI++){
            pageItem = pageItems[pI];
            if(pageItem instanceof TextFrame){
                FrameFound = true;
                FrameCount++;
                if(myDoc.characterStyles.item('Frame' + FrameCount + 'End') == null) {
                    frameEndStyle = myDoc.characterStyles.add({
                        name: 'Frame' + FrameCount + 'End'
                    });
                } 
                var myLines = pageItem.lines;
                for(var l=0; l<myLines.length; l++){
                    var line = myLines[l];
                    var words = line.words;
                    if(line.words.length > 0){
                        //var pageLastWord = page.words[page.words.length-1];
                        var FrameLastWord = pageItem.words[pageItem.words.length-1];
                        var lastWord = line.words[line.words.length-1];
                        if(FrameLastWord.isValid){
                            if(pageItems.length >1){
                                if(FrameCount == 1){
                                    if(FrameLastWord.appliedCharacterStyle.name == '[None]'){
                                        FrameLastWord.appliedCharacterStyle = pageEndStyle;
                                    }
                                    else if(FrameLastWord.appliedCharacterStyle.name != 'LineStart' && FrameLastWord.appliedCharacterStyle.name != 'LineEnd' && FrameLastWord.appliedCharacterStyle.name != 'LineStartEnd' && FrameLastWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'Start' && FrameLastWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'End' && FrameLastWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'StartEnd' && FrameLastWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'Start' && FrameLastWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'StartEnd' && FrameLastWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'End'){
                                        if(line.characters[-1].contents != '\r' && line.characters[-1].contents.toString() != 'FORCED_LINE_BREAK' && line.characters[-1].contents.toString() != 'PAGE_BREAK'){
                                            FrameLastWord.contents = FrameLastWord.contents + '\n';
                                            line.characters[-1].appliedCharacterStyle = pageEndStyle;
                                        }
                                       //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + FrameLastWord.contents + '"' + ',' + '"' + FrameLastWord.appliedCharacterStyle.name + '"' + ',' + 'Last Word of the Page not Found';
                                    }
                                    pageFound = false;
                                }
                                else {
                                    if(FrameFound && !pageFound){
                                        if(FrameLastWord.appliedCharacterStyle.name == '[None]'){
                                            FrameLastWord.appliedCharacterStyle = frameEndStyle;
                                        }
                                        else if(FrameLastWord.appliedCharacterStyle.name == 'Frame' + FrameCount + 'Start'){
                                                if(myDoc.characterStyles.item('Frame' + FrameCount + 'StartEnd') == null) {
                                                    frameStartEndStyle = myDoc.characterStyles.add({
                                                        name: 'Frame' + FrameCount + 'StartEnd'
                                                    });
                                                } 
                                                FrameLastWord.appliedCharacterStyle = frameStartEndStyle;
                                        }
                                        else if(FrameLastWord.appliedCharacterStyle.name != 'LineStart' && FrameLastWord.appliedCharacterStyle.name != 'LineEnd' && FrameLastWord.appliedCharacterStyle.name != 'LineStartEnd' && FrameLastWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'Start' && FrameLastWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'End' && FrameLastWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'StartEnd' && FrameLastWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'Start' && FrameLastWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'StartEnd' && FrameLastWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'End'){
                                            if(line.characters[-1].contents != '\r' && line.characters[-1].contents.toString() != 'FORCED_LINE_BREAK' && line.characters[-1].contents.toString() != 'PAGE_BREAK'){
                                                FrameLastWord.contents = FrameLastWord.contents + '\n';
                                                line.characters[-1].appliedCharacterStyle = frameEndStyle;
                                            }                                            
                                            //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + FrameLastWord.contents + '"' + ',' + '"' + FrameLastWord.appliedCharacterStyle.name + '"' + ',' + 'Last Word of the Frame not Found';
                                        }
                                        FrameFound = false;
                                    }
                                }
                            }
                            else{
                                if(FrameCount == 1){
                                    if(FrameLastWord.appliedCharacterStyle.name == '[None]'){
                                        FrameLastWord.appliedCharacterStyle = pageEndStyle;
                                    }
                                    else if(FrameLastWord.appliedCharacterStyle.name ==  'Page' + (p+1) + 'Start'){
                                            if(myDoc.characterStyles.item('Page' + (p+1) + 'StartEnd') == null) {
                                                pageStartEndStyle = myDoc.characterStyles.add({
                                                    name: 'Page' + (p+1) + 'StartEnd'
                                                });
                                            } 
                                            FrameLastWord.appliedCharacterStyle = pageStartEndStyle;
                                    }
                                    else if(FrameLastWord.appliedCharacterStyle.name != 'LineStart' && FrameLastWord.appliedCharacterStyle.name != 'LineEnd' && FrameLastWord.appliedCharacterStyle.name != 'LineStartEnd' && FrameLastWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'Start' && FrameLastWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'End' && FrameLastWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'StartEnd' && FrameLastWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'Start' && FrameLastWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'StartEnd' && FrameLastWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'End'){
                                        if(line.characters[-1].contents != '\r' && line.characters[-1].contents.toString() != 'FORCED_LINE_BREAK' && line.characters[-1].contents.toString() != 'PAGE_BREAK'){
                                            FrameLastWord.contents = FrameLastWord.contents + '\n';
                                            line.characters[-1].appliedCharacterStyle = pageEndStyle;
                                        }                                            
                                        //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + FrameLastWord.contents + '"' + ',' + '"' + FrameLastWord.appliedCharacterStyle.name + '"' + ',' + 'Last Word of the Page not Found';
                                    }
                                    pageFound = false;
                                    FrameFound = false;
                                }  
                            }
                        }
                        if(lastWord.isValid){
                            if(lastWord.appliedCharacterStyle.name == '[None]'){
                                lastWord.appliedCharacterStyle = lineEndStyle;
                            }
                            else if(lastWord.appliedCharacterStyle.name ==  'LineStart'){
                                    lastWord.appliedCharacterStyle = lineStartEndStyle;
                            }
                            else if(lastWord.appliedCharacterStyle.name != 'LineStart' && lastWord.appliedCharacterStyle.name != 'LineEnd' && lastWord.appliedCharacterStyle.name != 'LineStartEnd' && lastWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'Start' && lastWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'End' && lastWord.appliedCharacterStyle.name != 'Page' + (p+1) + 'StartEnd' && lastWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'Start' && lastWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'StartEnd' && lastWord.appliedCharacterStyle.name != 'Frame' + FrameCount + 'End'){
                                if(line.characters[-1].contents != '\r' && line.characters[-1].contents.toString() != 'FORCED_LINE_BREAK' && line.characters[-1].contents.toString() != 'PAGE_BREAK'){
                                    lastWord.contents = lastWord.contents + '\n';
                                    line.characters[-1].appliedCharacterStyle = lineEndStyle;
                                }                                            
                                //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + FrameLastWord.contents + '"' + ',' + '"' + FrameLastWord.appliedCharacterStyle.name + '"' + ',' + 'Last Word of the Line not Found';
                            }
                        }

                    }
                }
            }
            else{}
        }
    }
    app.SetInteractionLevel(UserInteractionLevels.INTERACT_WITH_ALL);
}
function DefaulHTMLCreation(myDoc){
    var TotalText = "";
    var myFile = new File(tempFolder + "/temp.html");
    myDoc.exportFile(ExportFormat.HTML,myFile,false);
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
                        if(threadedTextFramesArray.toString().match(pageItem.nextTextFrame.parentPage.name)){}
                        else{
                            threadedTextFramesArray.push(pageItem.nextTextFrame.parentPage.name);
                        }
                    }
                }
            }
    }

    for(var i=pagesArray.length-1; i>=0; i--){
       
        if(threadedTextFramesArray.toString().match(pagesArray[i])){
        }
        else{
            textFrameReports = textFrameReports + '\n' + myDoc.name + ',' + pagesArray[i] + ',' + 'These pages are not linked with other pages in InDesign';
        }
    }


}
function hardCodedHTMLCreation(myFile,imageName,pageWidth,pageHeight,metaTitle){
    myFile.open('w');
    myFile.encoding = "utf-8";
    myFile.writeln('<?xml version="1.0" encoding="UTF-8"?>\n');
    myFile.writeln('<!DOCTYPE html>\n');
    myFile.writeln('<html xmlns="http://www.w3.org/1999/xhtml" xmlns:ibooks="http://apple.com/ibooks/html-extensions" xmlns:epub="http://www.idpf.org/2007/ops">\n');
    myFile.writeln('<head>\n');
    myFile.writeln('<meta name="viewport" content="width=' + pageWidth + ', height=' + pageHeight + '"></meta>\n');
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
                if(line.characters[-1].contents != '\r' && line.characters[-1].contents.toString() != 'FORCED_LINE_BREAK' && line.characters[-1].contents.toString() != 'PAGE_BREAK'){
                    line.contents = line.contents + '\n';
                }
                
            }
        }
    }
    app.SetInteractionLevel(UserInteractionLevels.INTERACT_WITH_ALL);
}


function pageWiseCharacterIdentification(myDoc){

    var pages = myDoc.pages;
    for(var p=0; p<pages.length; p++){ /*Page Loop Starts */
        pageStartStyle = myDoc.characterStyles.add({
            name: 'Page' + (p+1) + 'Start'
        });
        pageEndStyle = myDoc.characterStyles.add({
            name: 'Page' + (p+1) + 'End'
        });
        pageStartEndStyle = myDoc.characterStyles.add({
            name: 'Page' + (p+1) + 'StartEnd'
        });
        var page = pages[p];
        var textFrames = page.textFrames;
        for(var tF=0; tF<textFrames.length; tF++){ /* TextFrames Loop Starts */
            
            var textFrame = textFrames[tF];
            var myLines = textFrame.lines;
            
            
            if(myDoc.characterStyles.item('Frame' + (tF+1) + 'Start') == null) {
                frameStartStyle = myDoc.characterStyles.add({
                    name: 'Frame' + (tF+1) + 'Start'
                });
            }    
            if(myDoc.characterStyles.item('Frame' + (tF+1) + 'End') == null) {
                frameEndStyle = myDoc.characterStyles.add({
                    name: 'Frame' + (tF+1) + 'End'
                });
            }     
            if(myDoc.characterStyles.item('Frame' + (tF+1) + 'StartEnd') == null) {
                frameStartEndStyle = myDoc.characterStyles.add({
                    name: 'Frame' + (tF+1) + 'StartEnd'
                });
            }        
               
//~             if(textFrame.characters[-1].contents.toString() == 'FORCED_LINE_BREAK'){
//~                 textFrame.characters[-1].contents = '\r';
//~             }
//~             

            if(textFrames.length>1){ /* More than 1 Text Frames within the page*/
                if(tF == 0){ /* if First Frame is found */
                    firstWord = textFrame.words[0];
                    lastWord = textFrame.words[textFrame.words.length-1];
                    if(firstWord.appliedCharacterStyle.name == '[None]' && firstWord.appliedCharacterStyle.name != pageStartStyle && firstWord.appliedCharacterStyle.name != pageEndStyle && firstWord.appliedCharacterStyle.name != pageStartEndStyle &&  firstWord.appliedCharacterStyle.name != frameEndStyle && firstWord.appliedCharacterStyle.name != frameStartEndStyle && firstWord.appliedCharacterStyle.name != frameStartStyle){
                        firstWord.appliedCharacterStyle = pageStartStyle;
                    }
                    else{
                        //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstWord.contents + '"' + ',' + '"' + firstWord.appliedCharacterStyle.name + '"' + ',' + 'First Word of the Page not Found';
                    }
                    
                    if(lastWord.appliedCharacterStyle.name == '[None]' && lastWord.appliedCharacterStyle.name != pageStartStyle && lastWord.appliedCharacterStyle.name != pageEndStyle && lastWord.appliedCharacterStyle.name != pageStartEndStyle &&  lastWord.appliedCharacterStyle.name != frameEndStyle && lastWord.appliedCharacterStyle.name != frameStartEndStyle && lastWord.appliedCharacterStyle.name != frameStartStyle){
                        lastWord.appliedCharacterStyle = frameEndStyle;
                    }
                    else{
                        //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + lastWord.contents + '"' + ',' + '"' + lastWord.appliedCharacterStyle.name + '"' + ',' + 'Last Word of the Page not Found';    
                    }
                    
                }/* if First Frame Condition ends Here */
            
                else if(tF == textFrames.length-1){ /* Last Frame of the page */
                    firstWord = textFrame.words[0];
                    lastWord = textFrame.words[(textFrame.words.length-1)];
                    if(lastWord.appliedCharacterStyle.name == '[None]' && lastWord.appliedCharacterStyle.name != pageStartStyle && lastWord.appliedCharacterStyle.name != pageEndStyle && lastWord.appliedCharacterStyle.name != pageStartEndStyle &&  lastWord.appliedCharacterStyle.name != frameEndStyle && lastWord.appliedCharacterStyle.name != frameStartEndStyle && lastWord.appliedCharacterStyle.name != frameStartStyle){
                        lastWord.appliedCharacterStyle = pageEndStyle;
                    }
                    else{
                        //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + lastWord.contents + '"' + ',' + '"' + lastWord.appliedCharacterStyle.name + '"' + ',' + 'Last Word of the Page not Found';
                    }
                    
                    if(firstWord.appliedCharacterStyle.name == '[None]' && firstWord.appliedCharacterStyle.name != pageStartStyle && firstWord.appliedCharacterStyle.name != pageEndStyle && firstWord.appliedCharacterStyle.name != pageStartEndStyle &&  firstWord.appliedCharacterStyle.name != frameEndStyle && firstWord.appliedCharacterStyle.name != frameStartEndStyle && firstWord.appliedCharacterStyle.name != frameStartStyle){
                        firstWord.appliedCharacterStyle = frameStartStyle;
                    }
                    else{
                        //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstWord.contents + '"' + ',' + '"' + firstWord.appliedCharacterStyle.name + '"' + ',' + 'First Word of the Frame not Found';
                    }
                    
                } /* Last Frame of the page ends here */
            
                else if(tF != 0 && tF !=(textFrames.length-1)){ /* Other Frames of the page */
                     if(textFrame.words.length > 1){ /*More than 1 words are found within the frame */
                        firstWord = textFrame.words[0];
                        lastWord = textFrame.words[(textFrame.words.length-1)];
                        if(firstWord.appliedCharacterStyle.name == '[None]' && firstWord.appliedCharacterStyle.name != pageStartStyle && firstWord.appliedCharacterStyle.name != pageEndStyle && firstWord.appliedCharacterStyle.name != pageStartEndStyle &&  firstWord.appliedCharacterStyle.name != frameEndStyle && firstWord.appliedCharacterStyle.name != frameStartEndStyle && firstWord.appliedCharacterStyle.name != frameStartStyle){
                            firstWord.appliedCharacterStyle = frameStartStyle;
                        }
                        else{
                            //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstWord.contents + '"' + ',' + '"' + firstWord.appliedCharacterStyle.name + '"' + ',' + 'First Word of the Frame not Found';    
                        }
                        if(lastWord.appliedCharacterStyle.name == '[None]' && lastWord.appliedCharacterStyle.name != pageStartStyle && lastWord.appliedCharacterStyle.name != pageEndStyle && lastWord.appliedCharacterStyle.name != pageStartEndStyle &&  lastWord.appliedCharacterStyle.name != frameEndStyle && lastWord.appliedCharacterStyle.name != frameStartEndStyle && lastWord.appliedCharacterStyle.name != frameStartStyle){
                            lastWord.appliedCharacterStyle = frameEndStyle;
                        }
                        else{
                            //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + lastWord.contents + '"' + ',' + '"' + lastWord.appliedCharacterStyle.name + '"' + ',' + 'Last Word of the Frame not Found';
                        }
                    }
                    else{
                        firstLastWord = textFrame.words[0];
                        if(firstLastWord.appliedCharacterStyle.name == '[None]' && firstLastWord.appliedCharacterStyle.name != pageStartStyle && firstLastWord.appliedCharacterStyle.name != pageEndStyle && firstLastWord.appliedCharacterStyle.name != pageStartEndStyle &&  firstLastWord.appliedCharacterStyle.name != frameEndStyle && firstLastWord.appliedCharacterStyle.name != frameStartEndStyle && firstLastWord.appliedCharacterStyle.name != frameStartStyle){
                            firstLastWord.appliedCharacterStyle = frameStartEndStyle;
                        }
                        else{
                            //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstLastWord.contents + '"' + ',' + '"' + firstLastWord.appliedCharacterStyle.name + '"' + ',' + 'First & Last Word of the Frame not Found';
                        }
                    }
                }
            }   /* More than 1 Text Frames within the page ends here */
            
            else { /* One Frame page starts here */
                if(textFrame.words.length > 1){ /*More than 1 words are found within the frame */
                    firstWord = textFrame.words[0];
                    lastWord = textFrame.words[(textFrame.words.length-1)];
                    if(firstWord.appliedCharacterStyle.name == '[None]' && firstWord.appliedCharacterStyle.name != pageStartStyle && firstWord.appliedCharacterStyle.name != pageEndStyle && firstWord.appliedCharacterStyle.name != pageStartEndStyle &&  firstWord.appliedCharacterStyle.name != frameEndStyle && firstWord.appliedCharacterStyle.name != frameStartEndStyle && firstWord.appliedCharacterStyle.name != frameStartStyle){
                        firstWord.appliedCharacterStyle = pageStartStyle;
                    }
                    else{
                        //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstWord.contents + '"' + ',' + '"' + firstWord.appliedCharacterStyle.name + '"' + ',' + 'First Word of the Page not Found';
                    }
                    
                    if(lastWord.appliedCharacterStyle.name == '[None]' && lastWord.appliedCharacterStyle.name != pageStartStyle && lastWord.appliedCharacterStyle.name != pageEndStyle && lastWord.appliedCharacterStyle.name != pageStartEndStyle &&  lastWord.appliedCharacterStyle.name != frameEndStyle && lastWord.appliedCharacterStyle.name != frameStartEndStyle && lastWord.appliedCharacterStyle.name != frameStartStyle){
                        lastWord.appliedCharacterStyle = pageEndStyle;
                    }
                    else{
                        //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + lastWord.contents + '"' + ',' + '"' + lastWord.appliedCharacterStyle.name + '"' + ',' + 'Last Word of the Page not Found';
                    }
                } 
                else{ /* Less than or equal to 1 words is found within the frame */
                    firstLastWord = textFrame.words[0];
                    if(firstLastWord.appliedCharacterStyle.name == '[None]' && firstLastWord.appliedCharacterStyle.name != pageStartStyle && firstLastWord.appliedCharacterStyle.name != pageEndStyle && firstLastWord.appliedCharacterStyle.name != pageStartEndStyle &&  firstLastWord.appliedCharacterStyle.name != frameEndStyle && firstLastWord.appliedCharacterStyle.name != frameStartEndStyle && firstLastWord.appliedCharacterStyle.name != frameStartStyle){
                        firstLastWord.appliedCharacterStyle = pageStartEndStyle;
                    }
                    else{
                        //CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstLastWord.contents + '"' + ',' + '"' + firstLastWord.appliedCharacterStyle.name + '"' + ',' + 'First & Last Word of the Page not Found';
                    }
                }
            
            } /* One Frame page ends here */
            
          }
          
    }

}
