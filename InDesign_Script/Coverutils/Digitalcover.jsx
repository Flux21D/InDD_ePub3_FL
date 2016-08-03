var errorReport = 'INDD Name,Issue';
var errorReportFile = null;

function PromoPDF() {
    #target 'indesign' 	
    
    app.transformPreferences.whenScaling = WhenScalingOptions.APPLY_TO_CONTENT;
	app.transformPreferences.adjustStrokeWeightWhenScaling = true;
	app.transformPreferences.dimensionsIncludeStrokeWeight = true;
	app.transformPreferences.transformationsAreTotals = true;
    //Global
    
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


   /*deleting Existing*/
   
   
    var todelete=new Folder(new Folder($.fileName).parent+"/PromoPdf");
    if(todelete.exists) {
       todelete.delete();
    }
    var todeleteFile=new File(new Folder($.fileName).parent+"/main.pdf");

    if(todeleteFile.exists) {
       todeleteFile.remove();
    }

    //Reading Input TextFile
    var CoverDesign=null;
    var CoverDesignFile = null;
    var reportFolder = null;

    var InputTextFile = new File(new File($.fileName).parent + "/InputTextFile.txt");
    if (InputTextFile.exists) {
        InputTextFile.open("r");
        var linecount = 0;
        while (!InputTextFile.eof) {
            var line = InputTextFile.readln();
            linecount++;
            if (linecount == 1) {
                CoverDesignFile = new File(line.split(",")[0]);
                if(CoverDesignFile.name.toString().toLowerCase().match(/^.*?_j.indd$/i) !=null || CoverDesignFile.name.toString().toLowerCase().match(/^.*?_c.indd$/i) !=null){
                    CoverDesign = new File(line.split(",")[0]);
                    reportFolder = new Folder(line.split(",")[1]); 
                }
                else{
                    errorReport = errorReport + '\n' + app.CoverDesignFile.name + ', There is no "_C" or "_J" files found in the active Document';
                    exit(0);
                }
            } else if (linecount == 2) {}
        }
    }

    if(!CoverDesign.exists){
            errorReport = errorReport + '\n' + CoverDesign + ', Cover INDD File does not exists in the mentioned path';
            exit(0);
    }
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
    app.open(CoverDesign);
    var rootFolder = new Folder(CoverDesign.toString().replace(CoverDesign.name.toString(),''));
    app.activeDocument.save(new File(rootFolder+ '/' +  CoverDesign.name));
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
    errorReportFile =  new File(reportFolder + '/Cover_File_Errors.csv');
    errorReportFile.open("w");
    errorReportFile.encoding = "utf-8";

    coverImageExport();
    errorReportFile.writeln(errorReport);
    errorReportFile.close();
}


function coverImageExport(){
    var intSpineWidth = null;
	var documents = null;
	var activeDocument = null;
	var activeSpread = null;
	var appliedMaster = null;
	var spineWidth = null;
    var oldDocumentWidth = null;
	var oldDocumentHeight = null;
	var newDocumentWidth = null;
	var newDocumentHeight = null;
	var scaleDiff = null;
	var mainPdf = null;
	var flapExists = false;
	var saveTo = null;
	var isbn = "";
	var flapWidth = 0;
	var newFlapWidth = 0;

    myDoLockUnlock(1, 0);
    try {
		app.activeDocument.bookmarks.everyItem().remove();
	} catch (ert) {}
    
    PromptProperties();
}


function myDoLockUnlock(myFunction, myScope) {
    var doLock = (myFunction == 0); //0 = lock, 1 = unlock
    var doSpreadOnly = (myScope == 1); //0 = document, 1 = spread
    var myDoc = app.activeDocument;

    if (doSpreadOnly) {
        var theSpread = myDoc.layoutWindows[0].activeSpread;
        var theItems = theSpread.pageItems;
    } else {
        var theItems = myDoc.pageItems;
    }
    var n = theItems.length;
    for (var k = 0; k < n; ++k) {
        theItem = theItems[k];
        try {
            theItem.itemLayer.locked = doLock;
            theItem.locked = doLock;
        } catch (e) {}

    }
}




function PromptProperties(){
    if (app.activeDocument.name.toLowerCase().match(/^.*?_j.indd$/i) != null) {
        flapExists = true;
    } else if (app.activeDocument.name.toLowerCase().match(/^.*?_c.indd$/i) != null) {
        flapExists = false;
    } else {
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
        app.activeDocument.close(SaveOptions.no);
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
        errorReportFile.writeln(errorReport);
        errorReportFile.close();
        exit(0);
    }
    getSpineWitdh();
    
    var s1 = null;  
    var s2 = null;
    var pageWidth = null;
    var pageHeight = null;
    var imageList = null;
    var BodyPDFFS = null;
    var intrSpine = null;
    var OutputPDFFS = null;
    var flapConfirmation = null;
    var spineWidthIn = null;
    var FlapWidth = null;
    var a = app.activeDocument.links.everyItem().name
    var names = app.activeDocument.links.everyItem().name;
    var aName = null;
    var Index = 0;
    a.push("None");
    names.push("None");
    var isbnFound = false;    
    
    while ((aName = a.pop()) != null) {
        if (isValidIsbn(aName)) {
            isbnFound = true;
            break;
        }
        Index++;
    }

    if (!isbnFound) {
        errorReport = errorReport + '\n' + app.activeDocument.name + ', Barcode image which named as ISBN format not found';
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
        app.activeDocument.close(SaveOptions.no);
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
        errorReportFile.writeln(errorReport);
        errorReportFile.close();
        exit(0);
    }
    isbn = aName.replace(/[^0-9]*/g, "");
    Index = (names.length - 1) - Index;
    a = names;

    main();
}


function getSpineWitdh() {
    activeDocument = app.activeDocument;
    activeSpread = app.activeWindow.activeSpread;
    app.activeWindow.zoom(ZoomOptions.FIT_SPREAD);
    appliedMaster = activeSpread.appliedMaster;
    if (appliedMaster.pages.length == 2) {
            errorReport = errorReport + '\n' + app.activeDocument.name + ', Cover spread should be a single page spread. But it  has 2 pages';
            app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
            app.activeDocument.close(SaveOptions.no);
            app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
            errorReportFile.writeln(errorReport);
            errorReportFile.close();
            exit(0);
    }
    else{
        if(activeSpread.pages[0].marginPreferences.columnCount == 2){
            spineWidth = activeSpread.pages[0].marginPreferences.columnGutter;
            if(flapExists){
                flapWidth = activeSpread.pages[0].marginPreferences.right;
                scaleDiff = getDiffRatio(spineWidth, flapWidth, false);
            }
            else{
                scaleDiff = getDiffRatio(spineWidth, 0, false);
            }
        }
        else{
            errorReport = errorReport + '\n' + app.activeDocument.name + ', Cover should be marked as two columns in margin Preferences of the cover spread.';
            app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
            app.activeDocument.close(SaveOptions.no);
            app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
            errorReportFile.writeln(errorReport);
            errorReportFile.close();
            exit(0);
        }
    }
}


function getDiffRatio(sw, fw, printMesur) {
    var Fw = 0;
    var Fh = 0;
    var pw1 = ((app.activeDocument.documentPreferences.pageWidth / 2) - sw / 2) - fw;
    var ph1 = app.activeDocument.documentPreferences.pageHeight;
     oldDocumentWidth=pw1;
     oldDocumentHeight=ph1;
    var pw2 = ((app.activeDocument.documentPreferences.pageWidth / 2) - sw / 2);
    var ph2 = app.activeDocument.documentPreferences.pageHeight;
    var oldFlapRatio = fw / pw1;
    newFlapWidth = fw;
    Fw = (pw2 / pw1);
    Fh = (ph2 / ph1);
    if (printMesur) {}
    return {
        hFactorialScale : Fw,
        vFactorialScale : Fh
    };
}

function main(){

    if (appliedMaster.pages.length == 2) {
        errorReport = errorReport + '\n' + app.activeDocument.name + ', Cover spread should be a single page spread. But it  has 2 pages';
        doublePages();
        ignoreSpine();
    }
    else{
        if(activeSpread.pages[0].marginPreferences.columnCount == 2){
            spineWidth = activeSpread.pages[0].marginPreferences.columnGutter;
            if(flapExists){
                flapWidth = activeSpread.pages[0].marginPreferences.right;
                scaleDiff = getDiffRatio(spineWidth, flapWidth, false);
            }
            else{
                scaleDiff = getDiffRatio(spineWidth, 0, false);
            }
        }
        else{
            errorReport = errorReport + '\n' + app.activeDocument.name + ', Cover should be marked as two columns in margin Preferences of the cover spread.';
            app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
            app.activeDocument.close(SaveOptions.no);
            app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
            errorReportFile.writeln(errorReport);
            errorReportFile.close();
            exit(0);
        }    
        doublePages();
        ignoreSpine();
    }
    exportPDF();
}

function doublePages(){

    app.activeDocument.pasteboardPreferences.pasteboardMargins = [1000, 1000];
    app.pasteboardPreferences.pasteboardMargins = [1000, 1000];
    if (activeSpread.pageItems.length == 1 && activeDocument.groups.length == 1) {
        activeDocument.groups.everyItem().ungroup();
    }
    var group = null;
    try {
        if (activeSpread.pageItems.length > 1) {
          group = activeDocument.groups.add(activeSpread.pageItems.everyItem());  
        }
        else if (activeSpread.pageItems.length > 0) {
            group = activeSpread.pageItems.everyItem();
        }
        else{
            errorReport = errorReport + '\n' + app.activeDocument.name + ', No pageItems found in cover spead.';
            app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
            app.activeDocument.close(SaveOptions.no);
            app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
            errorReportFile.writeln(errorReport);
            errorReportFile.close();
            exit(0);
        }
    }
    catch(e){
        errorReport = errorReport + '\n' + app.activeDocument.name + ', Cover spread with unlocked page items.';
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
        app.activeDocument.close(SaveOptions.no);
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
        errorReportFile.writeln(errorReport);
        errorReportFile.close();
        exit(0);
    }

    if (!flapExists) {
        var GroupOldWidth = group.visibleBounds[3] - group.visibleBounds[1];
        var GroupOldHeight = group.visibleBounds[2] - group.visibleBounds[0];
        var myTransformArray = group.transformValuesOf(CoordinateSpaces.parentCoordinates);
        var myTransformationMatrix = myTransformArray[0];
        myTransformationMatrix = app.transformationMatrices.add();
        
        var marginWidth = app.activeDocument.documentPreferences.pageWidth - (activeSpread.pages[0].marginPreferences.left * 2);
        var marginHeight = app.activeDocument.documentPreferences.pageHeight - (activeSpread.pages[0].marginPreferences.top * 2);
        var NewWidthRatio = app.activeDocument.documentPreferences.pageWidth / marginWidth;
        var NewHeightRatio = app.activeDocument.documentPreferences.pageHeight / marginHeight;
        myTransformationMatrix = myTransformationMatrix.scaleMatrix(NewWidthRatio, NewHeightRatio);
        
        try {
            myTransform(group, myTransformationMatrix, [0, 0]);
            activeSpread.pages[0].marginPreferences.columnGutter = activeSpread.pages[0].marginPreferences.columnGutter * NewWidthRatio;
            spineWidth = activeSpread.pages[0].marginPreferences.columnGutter;
        }
        catch(err){
            errorReport = errorReport + '\n' + app.activeDocument.name + ',' +  "Unable to remove margins! --> Caused by the " + err + "\n";
            app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
            app.activeDocument.close(SaveOptions.no);
            app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
            errorReportFile.writeln(errorReport);
            errorReportFile.close();
            exit(0);
        }
    }

    myOldTop = app.marginPreferences.top;
    myOldLeft = app.marginPreferences.left;
    myOldRight = app.marginPreferences.right;
    myOldBottom = app.marginPreferences.bottom;

    app.marginPreferences.left = 0;
    app.marginPreferences.right = 0;
    app.marginPreferences.top = 0;
    app.marginPreferences.bottom = 0;


    app.activeDocument.marginPreferences.left = 0;
    app.activeDocument.marginPreferences.right = 0;
    app.activeDocument.marginPreferences.top = 0;
    app.activeDocument.marginPreferences.bottom = 0;

    myPage = app.activeDocument.pages[0];
    myPage.marginPreferences.left = 0;
    myPage.marginPreferences.right = 0;
    myPage.marginPreferences.top = 0;
    myPage.marginPreferences.bottom = 0;

    myMasterSpreads = app.activeDocument.masterSpreads;
    for (i = 0; i <= myMasterSpreads.length - 1; i++) {
        myMasterSpread = myMasterSpreads[i];
        for (x = 0; x <= myMasterSpread.pages.length - 1; x++) {
            myMasterSpread.pages[x].marginPreferences.right = 0;
            myMasterSpread.pages[x].marginPreferences.left = 0;
            myMasterSpread.pages[x].marginPreferences.top = 0;
            myMasterSpread.pages[x].marginPreferences.bottom = 0;
        }
    }
    
    try{
        activeDocument.documentPreferences.pageWidth = (activeDocument.documentPreferences.pageWidth / 2) - (spineWidth / 2);
        activeDocument.documentPreferences.pageHeight = activeDocument.documentPreferences.pageHeight;
    }
    catch(e){
        errorReport = errorReport + '\n' + app.activeDocument.name + ', Invalid page dimensions given for this document.';
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
        app.activeDocument.close(SaveOptions.no);
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
        errorReportFile.writeln(errorReport);
        errorReportFile.close();
        exit(0);
    }

    var page1 = appliedMaster.pages.add();
    activeSpread.allowPageShuffle = false;
    var page2 = activeSpread.pages.add();
    var myTransformationMatrixGroup = app.transformationMatrices.add({
            horizontalTranslation : (activeDocument.documentPreferences.pageWidth / 2)
        });
    myTransform(group, myTransformationMatrixGroup, [0, 0]);

    try{
        group.ungroup();
    }
    catch(e){}
    
    if (!flapExists) {
        var new_spread = activeDocument.spreads.add();
        new_spread.allowPageShuffle = false;
        new_spread.pages.add();
        var textFrame1 = new_spread.pages[0].textFrames.add();
        textFrame1.contents = "THIS PAGE \nINTENTIONALLY \nLEFT BLANK\r";
        var textFrame2 = new_spread.pages[1].textFrames.add();
        textFrame2.contents = "THIS PAGE \nINTENTIONALLY \nLEFT BLANK\r";
        textFrame1.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;
        textFrame2.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;

        textFrame1.parentStory.justification = Justification.CENTER_ALIGN;
        textFrame2.parentStory.justification = Justification.CENTER_ALIGN;

        textFrame1.parentStory.appliedFont = "Minion Pro";
        textFrame2.parentStory.appliedFont = "Minion Pro";

        try {
            textFrame1.textFramePreferences.useNoLineBreaksForAutoSizing = true;
            textFrame2.textFramePreferences.useNoLineBreaksForAutoSizing = true;
            textFrame1.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.CENTER_POINT;
            textFrame1.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
            textFrame2.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.CENTER_POINT;
            textFrame2.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
        } catch (CampatibilityIssue) {
            textFrame1.paragraphs.everyItem().hyphenateCapitalizedWords = false;
            textFrame2.paragraphs.everyItem().hyphenateCapitalizedWords = false;
            while (textFrame1.overflows || textFrame2.overflows) {
                textFrame1.resize(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.CENTER_ANCHOR, ResizeMethods.ADDING_CURRENT_DIMENSIONS_TO, [1, 1]);
                textFrame2.resize(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.CENTER_ANCHOR, ResizeMethods.ADDING_CURRENT_DIMENSIONS_TO, [1, 1]);
            }
        }

        activeDocument.align(textFrame1, AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
        activeDocument.align(textFrame2, AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
        activeDocument.align(textFrame1, AlignOptions.VERTICAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
        activeDocument.align(textFrame2, AlignOptions.VERTICAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
    }
}

function ignoreSpine() {
    var pages = activeSpread.pages;
    var myPage1 = pages[0];
    var myPage2 = pages[1];
    if (flapExists) {
          var myTransformationMatrix1 = app.transformationMatrices.add({
            horizontalTranslation : eval("-" + ((spineWidth) / 2))
        });

        myTransform(myPage1, myTransformationMatrix1, [0, 0]);
         var myTransformationMatrix2 = app.transformationMatrices.add({
            horizontalTranslation : (spineWidth) / 2
        });
        myTransform(myPage2, myTransformationMatrix2, [0, 0]);
        var flapSpread = activeSpread.duplicate(LocationOptions.AFTER);
        var flapPages = flapSpread.pages;
        var flapPage1 = flapPages[0];
        var flapPage2 = flapPages[1];
         
        flapPage1.resize(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.RIGHT_CENTER_ANCHOR, ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH, [(oldDocumentWidth), (newDocumentHeight)]);
        flapPage2.resize(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.LEFT_CENTER_ANCHOR, ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH, [(oldDocumentWidth), (newDocumentHeight)]);
        flapPage1.resize(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.LEFT_CENTER_ANCHOR, ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH, [(newFlapWidth), (newDocumentHeight)]);
        flapPage2.resize(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.RIGHT_CENTER_ANCHOR, ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH, [(newFlapWidth), (newDocumentHeight)]);
                
        var myTransformationMatrix1 = app.transformationMatrices.add({
                horizontalTranslation : eval("-" + newFlapWidth)
            });

        myTransform(flapPage1, myTransformationMatrix1, [0, 0]);
        var myTransformationMatrix2 = app.transformationMatrices.add({
                horizontalTranslation : newFlapWidth
            });
        myTransform(flapPage2, myTransformationMatrix2, [0, 0]);
    } else {
        var myTransformationMatrix1 = app.transformationMatrices.add({
            horizontalTranslation : eval("-" + ((spineWidth * scaleDiff.hFactorialScale) / 2))
        });

    myTransform(myPage1, myTransformationMatrix1, [0, 0]);
    var myTransformationMatrix2 = app.transformationMatrices.add({
            horizontalTranslation : (spineWidth * scaleDiff.hFactorialScale) / 2
        });
    myTransform(myPage2, myTransformationMatrix2, [0, 0]);
     }
     resizeSpreadWithItems(activeSpread);
 }

function myTransform(myitem, myTransformationMatrix, anchorpoint) {
    myitem.transform(CoordinateSpaces.PASTEBOARD_COORDINATES,
        anchorpoint,
        myTransformationMatrix);
}


function resizeSpreadWithItems(spread) {
    var group = null;
    try {
        if (activeSpread.pageItems.length > 1) {
            group = activeDocument.groups.add(activeSpread.pageItems.everyItem());
        } else if (activeSpread.pageItems.length > 0) {
            group = activeSpread.pageItems.everyItem();
        } else {
            errorReport = errorReport + '\n' + app.activeDocument.name + ', No pageItems found in cover spead.';
            app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
            app.activeDocument.close(SaveOptions.no);
            app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
            errorReportFile.writeln(errorReport);
            errorReportFile.close();
            exit(0);
        }
    } catch (ert) {
        errorReport = errorReport + '\n' + app.activeDocument.name + ', Cover spread with unlocked page item.';
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
        app.activeDocument.close(SaveOptions.no);
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
        errorReportFile.writeln(errorReport);
        errorReportFile.close();
        exit(0);
    }

    var myTransformArray = group.transformValuesOf(CoordinateSpaces.parentCoordinates);
    var myTransformationMatrix = myTransformArray[0];
    myTransformationMatrix = app.transformationMatrices.add();

    myTransformationMatrix = myTransformationMatrix.scaleMatrix(scaleDiff.hFactorialScale, scaleDiff.vFactorialScale);
    var myRotationAngle = myTransformationMatrix.counterclockwiseRotationAngle;
    var myShearAngle = myTransformationMatrix.clockwiseShearAngle;
    var myXScale = myTransformationMatrix.horizontalScaleFactor;
    var myYScale = myTransformationMatrix.verticalScaleFactor;
    var myXTranslate = myTransformationMatrix.horizontalTranslation;
    var myYTranslate = myTransformationMatrix.verticalTranslation;
    var myString = "Rotation Angle: " + myRotationAngle + "\r";
    myString += "Shear Angle: " + myShearAngle + "\r";
    myString += "Horizontal Scale Factor: " + myXScale + "\r";
    myString += "Vertical Scale Factor: " + myYScale + "\r";
    myString += "Horizontal Translation: " + myXTranslate + "\r";
    myString += "Vertical Translation: " + myYTranslate + "\r";
    myTransform(group, myTransformationMatrix, [0, 0]);
}

var isValidIsbn = function (str) {

    var sum,
    weight,
    digit,
    check,
    i;

    str = str.replace(/[^0-9X]/gi, '');

    if (str.length != 10 && str.length != 13) {
        return false;
    }

    if (str.length == 13) {
        sum = 0;
        for (i = 0; i < 12; i++) {
            digit = parseInt(str[i]);
            if (i % 2 == 1) {
                sum += 3 * digit;
            } else {
                sum += digit;
            }
        }
        check = (10 - (sum % 10)) % 10;
        return (check == str[str.length - 1]);
    }

    if (str.length == 10) {
        weight = 10;
        sum = 0;
        for (i = 0; i < 9; i++) {
            digit = parseInt(str[i]);
            sum += weight * digit;
            weight--;
        }
        check = 11 - (sum % 11);
        if (check == 10) {
            check = 'X';
        }
        return (check == str[str.length - 1].toUpperCase());
    }
}



function exportPDF() {
    var pages = activeDocument.pages;
    var pdfs = new Folder(new Folder($.fileName).parent + "/PromoPdf/pdfs");
    if (!pdfs.exists) {
        pdfs.create();
    }
    for (var a = 0; a < pages.length; a++) {
        var bookMark = null;
        if (a == 0) {
            bookMark = activeSpread.parent.bookmarks.add(pages[a]);
            bookMark.name = "Back Cover";

            var  ExportFile=new File(pdfs + "/Backcover.jpg");
            app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
            app.jpegExportPreferences.exportingSpread = false;
            app.jpegExportPreferences.pageString = pages[a].name;
            app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.MAXIMUM;
            app.jpegExportPreferences.exportResolution =72;
            app.activeDocument.exportFile(ExportFormat.JPG,ExportFile,undefined);
        }
        if (a == 1) {
            bookMark = activeSpread.parent.bookmarks.add(pages[a]);
            bookMark.name = "Cover";

            var  ExportFile=new File(pdfs + "/Cover.jpg");
            app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
            app.jpegExportPreferences.exportingSpread = false;
            app.jpegExportPreferences.pageString = pages[a].name;
            app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.MAXIMUM;
            app.jpegExportPreferences.exportResolution =72;
            app.activeDocument.exportFile(ExportFormat.JPG,ExportFile,undefined);
        }
    }
}

PromoPDF();

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
app.activeDocument.close(SaveOptions.no);
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
