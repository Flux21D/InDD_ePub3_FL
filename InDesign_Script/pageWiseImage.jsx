#target 'indesign'
#include 'lib/impelsys/common/common_lib.js'

//var inputFolderPath = openInputDoc();

var myDoc = app.activeDocument;
var outputFolder = new Folder(app.activeDocument.filePath + '/Output');
var imagesFolder = new Folder(outputFolder + '/OEBPS/images');

CreatePageImages(myDoc);

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
//app.activeDocument.close(SaveOptions.NO);
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;

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
    app.jpegExportPreferences.pageString=app.activeDocument.pages[0].name;
    myDoc.exportFile(ExportFormat.JPG, new File(imagesFolder + "/cover.jpg"));
    app.jpegExportPreferences.pageString=app.activeDocument.pages[app.activeDocument.pages.length-1].name;
    myDoc.exportFile(ExportFormat.JPG, new File(imagesFolder + "/backcover.jpg"));

}


