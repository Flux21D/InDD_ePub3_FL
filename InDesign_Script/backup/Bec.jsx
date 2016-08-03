app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
var Output_Current_PageHtml = null;
var Output_Current_CSS = null;
var Spline_No = null;
var TextFrame_No = null;
var z_index = null;
var Output_Folder = null;
var Output_Image_Folder = null;
var Output_CSS_Folder = null;
var Output_HTML_Folder = null;
var Output_Font_Folder = null;
var AllTextFramContents = new Array();
var SpreadHTML = "";
var SpreadCSS = "";
var TextFrameIndexStart = 0;
var SpreadOver = 0;
var tab = "";
var currentPageSide = "";
var FontDiclaration = "";
var ImageRes;
var DocResolution;
var DocumentWidth;
var DocumentHeight;
var applyMaster;
var FileToConvert = null;
var avoidDuplicate="";
var fontfaceRule="";
var ReportFile=null;
var CurrentTitleName=null;
var LastException="";
var myFiles=new Array();
Do();



//************
// Pre - process
//_______________



function Do()
{
    var Input_Folder = null;
    
    if (app.documents.length != 0)
    {
        FileToConvert = new File(app.activeDocument.fullName);
        Input_Folder = FileToConvert.parent;
    }
    else
    {
        Input_Folder = Folder.selectDialog("Select an batch Folder");
        //FileToConvert = Ride_Package(Input_Folder);
        FileToConvert = Input_Folder;
    }

   
    if (FileToConvert.name.indexOf(".indb") != -1)
    {
         var Output_Folder = prepare_For_Output(Input_Folder);
        app.open(FileToConvert);
        var ActiveBook = app.activeBook;
        for (var A = 0; A < ActiveBook.bookContents.length; A++)
        {
            app.open(ActiveBook.bookContents[A].fullName);
            Relink_File(Input_Folder + "/Links");
            Convert();
            app.activeDocument.close(SaveOptions.NO);
        }
    }
    else if (FileToConvert.name.indexOf(".indd") != -1)
    {
        var Output_Folder = prepare_For_Output(Input_Folder);
        app.open(FileToConvert);
        DocResolution=96;    
        applyMaster=false;
        ImageRes=DocResolution;
        Convert();
        app.activeDocument.close(SaveOptions.NO);
    }
    else
    {
        var AllTitels=null;
        try
        {
            var AllTitels=FileToConvert.getFiles();
        }
        catch(a1)
        {
            alert("Error : The given output is not openable by indesign CS6 and later.\r\nIndesign Error Details:\r\n"+a1);
            exit(0);
        }
        if(AllTitels!=null||AllTitels.length==0)
        {
            ReportFile=new File(FileToConvert+"RunReport.csv");
            ReportFile.open("w");
            ReportFile.writeln("\"Title Name\",\"issue\",\"Last Exceptions\"");
            for(var a=0;a<AllTitels.length;a++)
            {
                var AllFolder=null;
                try
                {
                   var AllFolder=AllTitels[a].getFiles();
                   CurrentTitleName=AllTitels[a].name;
                   for(var a2=0;a2<AllFolder.length;a2++)
                   {
                       if(AllFolder[a2].name.indexOf("_BK")!=-1)
                       {
                            var allFiles=AllFolder[a2].getFiles();
                            for(var a3=0;a3<allFiles.length;a3++)
                            {
                                FileToConvert=allFiles[a3];
                                try
                                {
                                    FileToConvert.getFiles();
                                }
                                catch(a3)
                                {
                                    if(FileToConvert.name.indexOf(".indd")!=-1)
                                    {
                                        try
                                        {
                                        app.open(FileToConvert);
                                        app.activeDocument.save (FileToConvert);
                                        Input_Folder = FileToConvert.parent;
                                        Do();
                                        }
                                        catch(errst)
                                        {
                                            if(ReportFile!=null)
                                            {
                                                alert(app.scriptPreferences.userInteractionLevel);
                                                ReportFile.writeln("\""+CurrentTitleName+"\",\""+errst+"\",\""+LastException+"\"");
                                                LastException="";
                                            }
                                         }
                                    }
                                }
                            }
                       }
                   }
                }
                catch(a2)
                {
                   //alert(a2)
                }
            }
            ReportFile.close();
        }
        else
        {
            alert("Error : The given output is an empty folder!");
            exit(0);
        }
    }
}


function PromptProperties()
{
      var myDialog = app.dialogs.add({name:"IMPUB Export Options", canCancel:true});
      with(myDialog)
      {
            with(dialogColumns.add())
            {
                  with(borderPanels.add())
                  {
                         with(dialogRows.add())
                        {
                               staticTexts.add({staticLabel:"Image Export Options: "});
                        }
                        with(dialogRows.add())
                        {
                               with(borderPanels.add())
                              {
                                    with(dialogColumns.add())
                                    {
                                         staticTexts.add({staticLabel:"Export Resolution (DPI):"});
                                    }
                                    with(dialogColumns.add())
                                    {
                                          var ImageDPI = measurementEditboxes.add({editValue:96});
                                          ImageDPI.editUnits=MeasurementUnits.PIXELS;
                                    }
                              }
                        }
                  }
                  
                  with(borderPanels.add())
                  {
                        
                         with(dialogRows.add())
                        {
                               staticTexts.add({staticLabel:"Html Export Options: "});
                        }
                        with(dialogRows.add())
                        {
                              
                               with(borderPanels.add())
                              {
                                    with(dialogColumns.add())
                                    {
                                          var OverrideMaster= checkboxControls.add();
                                    }
                                    with(dialogColumns.add())
                                    {
                                           staticTexts.add({staticLabel:"Override MasterPage Items"});
                                    }
                              }
                              
                        }
                        
                  }
                  
                  with(borderPanels.add())
                  {
                         with(dialogRows.add())
                        {
                               staticTexts.add({staticLabel:"Css Export Options"});
                        }
                        with(dialogRows.add())
                        {
                               with(borderPanels.add())
                              {
                                    with(dialogColumns.add())
                                    {
                                          var Override= checkboxControls.add();
                                    }
                                    with(dialogColumns.add())
                                    {
                                          staticTexts.add({staticLabel:"Preserve overrrides"});
                                    }
                              }
                        }
                  }
            }
      }

      

      if(myDialog.show())
      {
            ImageRes = ImageDPI.editValue;
            DocResolution = ImageDPI.editValue;
            if(Override.checkedState)
            {
                  app.activeDocument.htmlExportPreferences.preserveLocalOverride=true;
            }
            if(OverrideMaster.checkedState)
            {
                  applyMaster=true;
            }
            else
            {
                  applyMaster=false;
            }
            Convert();
      } 
      else
      {
            myDialog.destroy()
            exit(0);
      }
}


//*****************************************
//Check Input Type (Indesign Book/Indesign Document)
//___________________________________________________



function Ride_Package(Input_Folder)
{
    var Files = Input_Folder.getFiles("*.indb")
    if (Files.length == 0)
    {
        Files = Input_Folder.getFiles("*.indd")
        if (Files.length > 1)
        {
            var Warnning = confirm("Warning!\r\nThis Package contains more than 1 indesign files. Please combine it as a Book for better results. Do you still want to proceed?");
            if (!Warnning)
            {
                exit(0);
            }
        }
    }
    return Files[0];
}



//************
//Relink Images
//_______________



function Relink_File(LinkFolder)
{
    var AllLinks = app.activeDocument.links;
    for (var Li = 0; Li < AllLinks.length; Li++)
    {
        var ItemLink = new File(AllLinks[Li].filePath);
        var RelinkFile = new File(LinkFolder.fullName + "/" + ItemLink.name);
        if (RelinkFile.exists)
        {
            AllLinks[Li].relink(RelinkFile);
        }
        else
        {
            alert(RelinkFile.fullName+" not exists!")    
        }
    }
}



//************
//Prepare Epub 3 Dir Structure 
//_______________



function prepare_For_Output(Input_Folder)
{
    Output_Folder = new Folder(Input_Folder.parent + "/" + Input_Folder.name + "_Epub 3");
    Output_Image_Folder = new Folder(Output_Folder + "/images");
    Output_CSS_Folder = new Folder(Output_Folder + "/css");
    Output_HTML_Folder = new Folder(Output_Folder + "/html");
    var InputFonts = new Folder(Input_Folder + "/Fonts");
    var AllFonts = InputFonts.getFiles();
    Output_Font_Folder = new Folder(Output_Folder + "/fonts");
    if (Output_Folder.exists)
    {
        Output_Folder.remove();
        Output_Folder.create();
    }
    else
    {
        Output_Folder.create();
    }
      
    if (Output_Font_Folder.exists)
    {
        Output_Font_Folder.remove();
        Output_Font_Folder.create();
        for (var t = 0; t < AllFonts.length; t++)
        {
            AllFonts[t].copy(new File(Output_Font_Folder + "/" + AllFonts[t].name));
        }
    }
    else
    {

        Output_Font_Folder.create();
        for (var t = 0; t < AllFonts.length; t++)
        {
            AllFonts[t].copy(new File(Output_Font_Folder + "/" + AllFonts[t].name));
        }
    }

    if (Output_Image_Folder.exists)
    {
        Output_Image_Folder.remove();
        Output_Image_Folder.create();
    }
    else
    {
        Output_Image_Folder.create();
    }

    if (Output_CSS_Folder.exists)
    {
        Output_CSS_Folder.remove();
        Output_CSS_Folder.create();
    }
    else
    {
        Output_CSS_Folder.create();
    }

    if (Output_HTML_Folder.exists)
    {
        Output_HTML_Folder.remove();
        Output_HTML_Folder.create();
    }
    else
    {
        Output_HTML_Folder.create();
    }
    return Output_Folder;
}



//************
//Convert the file Now
//_______________



function Convert()
{
    //Relink_File (Input_Folder+"/Links");
    app.activeDocument.viewPreferences.horizontalMeasurementUnits = app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
    app.activeDocument.htmlExportPreferences.exportSelection = false;
    app.activeDocument.htmlExportPreferences.cssExportOption = StyleSheetExportOption.EMBEDDED_CSS;
    app.activeDocument.htmlExportPreferences.viewDocumentAfterExport = false;
    app.activeDocument.htmlExportPreferences.imageConversion = ImageConversion.JPEG;
    app.pngExportPreferences.transparentBackground = true;
    app.pngExportPreferences.exportResolution = ImageRes;
    DocumentWidth =     app.activeDocument.documentPreferences.pageWidth;
    DocumentHeight =    app.activeDocument.documentPreferences.pageHeight;
    CreatePageImages();
    ResizeOverset();
    SplitStories();
    ProcessStories();
    removeZapf();
    ExtractStories();
    RunThroughPages();
    AddingContentOPF();
}

function removeZapf()
{
    try
    {
    app.findGrepPreferences=NothingEnum.nothing;
    app.changeGrepPreferences=NothingEnum.nothing;
    app.findGrepPreferences.findWhat=".";
    app.changeGrepPreferences.changeTo="";
    var all=app.activeDocument.findGrep();
    for(var trt=0;trt<all.length;trt++)
    {
        if(all[trt].appliedFont.fontFamily.indexOf("Zapf Dingbats")!=-1)
        {
          all[trt].contents="";
        }
        
    }
}
catch(R)
{
}
    
}
function CreatePageImages()
{
      for(var c=0;c<app.activeDocument.stories.length;c++)
     {
          var Item=app.activeDocument.stories[c];
         
           Item.contents="";
     }
      PrintPageImages();
      app.activeDocument.close(SaveOptions.no);
      app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
      app.open(FileToConvert);
}

function PrintPageImages()
{
            app.jpegExportPreferences.exportResolution=DocResolution;
            app.jpegExportPreferences.jpegColorSpace=JpegColorSpaceEnum.RGB;
            app.jpegExportPreferences.jpegExportRange=ExportRangeOrAllPages.EXPORT_RANGE;
            app.jpegExportPreferences.useDocumentBleeds=false;
      for(var t=0;t<app.activeDocument.pages.length;t++)
      {
            app.jpegExportPreferences.pageString=app.activeDocument.pages[t].name;
            app.activeDocument.exportFile(ExportFormat.JPG,new File(Output_Image_Folder+"/Page_"+app.activeDocument.pages[t].name.toString()+".jpg"));
      }
}


function ProcessStories()
{
    var AllTextFrames = app.activeDocument.allPageItems;
    for (var set = 0; set < AllTextFrames.length; set++)
    {
        try
        {
            var Item = AllTextFrames[set];
            if (Item instanceof  TextFrame)
            {
                
                var ObjectStyle = app.activeDocument.objectStyles.add();
                ObjectStyle.name = "Page-Item-" + AllTextFrames[set].id;
                AllTextFrames[set].appliedObjectStyle = ObjectStyle;
            }

        }
        catch (ert)
        {
            LastException=LastException+"{Error in ProcessStories() method: "+ert+"}";
            }

    }
}

function ExtractStories()
{
    var TempFile = new File(Folder.temp + "/temp.html");
    app.activeDocument.exportFile(ExportFormat.HTML, TempFile);
    var cssFile = new File(Folder.temp + "/temp-web-resources/css/temp.css");
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
              LastException=LastException+"{Error in ExtractStories() method: "+Erte+"}";
          }
          fontfaceRule=fontfaceRule+"@font-face{font-family: "+app.activeDocument.fonts[fon].fontFamily+st+"; src: url('../fonts/"+app.activeDocument.fonts[fon].name+"');}\r\n"
    }
    
    while (!cssFile.eof)
    {
        var Line = cssFile.readln();
        TotalText = TotalText + Line+"\r\n";
    }
    cssFile.close();
    cssFile.open("w");
    cssFile.encoding = "utf-8";
    cssFile.writeln(fontfaceRule+TotalText);
    cssFile.close();
    cssFile.copy(Output_CSS_Folder + "/Content.css");
    TempFile.open("r");
    TempFile.encoding = "utf-8";
    var TotalText = "";
    while (!TempFile.eof)
    {
        var Line = TempFile.readln();
        TotalText = TotalText + Line;
    }
    var RegX = RegExp("<div class=\"Page-Item-[0-9]+\">.*?</div>");
    while (RegX.test(TotalText))
    {
        var exe = RegX.exec(TotalText);
        TotalText = TotalText.replace(exe[0], "");
        AllTextFramContents.push(exe[0]);
    }
}
function RunThroughPages()
{
    var Page = null;
    for (var a = 0; a < app.activeDocument.pages.length; a++)
    {
        z_index = 0;
        Page = app.activeDocument.pages[a];
        if (Page.bounds[1] == 0)
        {
            currentPageSide = "left";
        }
        else
        {
            currentPageSide = "right";
        }
        Spline_No = SpreadOver;
        TextFrame_No = 0;
        GetIndex(Page);
        TextFrameIndexStart = TextFrameIndexStart + SpreadOver;
        var PageFolder = new Folder(Output_HTML_Folder.fullName + "/Page" + Page.name);
        PageFolder.create();
        Output_Current_PageHtml = new File(PageFolder.fullName + "/Page" + Page.name + ".html");
        Output_Current_CSS = new File(Output_CSS_Folder.fullName + "/css_page" + Page.name + ".css");
        Output_Current_PageHtml.open("w");
        Output_Current_CSS.open("w")
        Output_Current_PageHtml.encoding = "utf-8";
        Output_Current_PageHtml.writeln("<!DOCTYPE html>");
        Output_Current_PageHtml.writeln("<html xmlns=\"http://www.w3.org/1999/xhtml\">");
        Output_Current_PageHtml.writeln("\t<head>");
        Output_Current_PageHtml.writeln("\t\t<meta charset=\"utf-8\"/>\r\n");
        Output_Current_PageHtml.writeln("\t\t<title>Page" + Page.name + "</title>");
        Output_Current_PageHtml.writeln("\t\t<meta name=\"viewport\" content=\"width=" + (DocumentWidth * DocResolution) + ", height=" + (DocumentHeight * DocResolution) + "\" />");
        Output_Current_PageHtml.writeln("\t\t<link rel=\"stylesheet\" type=\"text/css\" href=\"../../css/Content.css" + "\" />");
        Output_Current_PageHtml.writeln("\t\t<link rel=\"stylesheet\" type=\"text/css\" href=\"../../css/css_page" + Page.name + ".css" + "\" />");
        Output_Current_PageHtml.writeln("\t\t<!--[if IE 9]><link rel=\"stylesheet\" type=\"text/css\" href=\"../../css/ie9.css\" /><![endif]-->");
        Output_Current_PageHtml.writeln("\t\t<style>body{width:" + (DocumentWidth * DocResolution) + "px; height:" + (DocumentHeight * DocResolution) + "px;}</style>");
        Output_Current_PageHtml.writeln("\t</head>");
        Output_Current_PageHtml.writeln("\t<body>");
        Output_Current_PageHtml.writeln("\t\t<div class=\"Page" + Page.name + "\">");
        Output_Current_PageHtml.writeln(SpreadHTML);
        Output_Current_CSS.writeln(SpreadCSS);
        SpreadHTML = "";
        SpreadCSS = "";
        Output_Current_PageHtml.writeln("\t\t\t<div class=\"img_container\">")
        Output_Current_PageHtml.writeln("\t\t\t\t<img src=\"../../images"+"/Page_"+Page.name.toString()+".jpg"+"\" />");
        Output_Current_PageHtml.writeln("\t\t\t</div>");
         Output_Current_CSS.writeln(".img_container{top:0px;left:0px;z-index:0;}");
        tab = tab + "\t\t\t\t";
        RunThroughPageItems(Page);
        var regExp = new RegExp("\t")
        while (regExp.test(tab))
        {
            tab = tab.replace(regExp.exec(tab)[0], "");
        }
        
        Output_Current_PageHtml.writeln("\t\t</div>");
        Output_Current_PageHtml.writeln("\t</body>");
        Output_Current_PageHtml.writeln("</html>");
        Output_Current_PageHtml.close();
        Output_Current_CSS.close();
        TextFrameIndexStart = 0;
    }
}
function AddingContentOPF()
{
//var inputFile=Input_Folder;
//var Epub3Folder=new Folder(inputFile.parent+"/"+inputFile.name+"_Epub 3");
var Epub3Folder=Output_Folder;

var htmlArray=new Array();
GetSubFolders(Epub3Folder);
var opfFile=new File(Epub3Folder+"/content.opf");
opfFile.open("w");
opfFile.writeln("<?xml version=\"1.0\" encoding=\"UTF-8\"?> \n<package  unique-identifier=\"uid\" version=\"2.0\" xmlns=\"http://www.idpf.org/2007/opf\"> \n <metadata xmlns:opf=\"http://www.idpf.org/2007/opf\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\"> \n </metadata> ");
opfFile.writeln("<manifest>");
var ManifestVariable="";
var spineVariable="";
spineVariable=spineVariable+"<spine toc=\"ncx\">"+"\n";
//Looping Each Files
for(var f1=0;f1<myFiles.length;f1++)
  {
//Adding Manifest section
if(myFiles[f1].name.toString().indexOf(".html")>0||myFiles[f1].name.toString().indexOf(".xhtml")>0)
{


ManifestVariable=ManifestVariable+"<item id=\"html_"+myFiles[f1].name.replace(".html","")+"\" href=\"html/"+myFiles[f1].name+"\" media-type=\"application/xhtml+xml\" />\n";   
}    
else if(myFiles[f1].name.toString().indexOf(".css")>0||myFiles[f1].name.toString().indexOf(".CSS")>0)
{
   ManifestVariable=ManifestVariable+"<item id=\"css_"+myFiles[f1].name.replace(".css","")+"\" href=\"css/"+myFiles[f1].name+"\" media-type=\"text/css\" />\n";    
    
 }else if(myFiles[f1].name.toString().indexOf(".jpg")>0||myFiles[f1].name.toString().indexOf(".jpeg")>0)
{
       ManifestVariable=ManifestVariable+"<item id=\"img_"+myFiles[f1].name.replace(".jpg","").replace(".jpeg")+"\" href=\"image/"+myFiles[f1].name+"\" media-type=\"image/jpeg\" />\n";    
  }
else if(myFiles[f1].name.toString().indexOf(".otf")>0||myFiles[f1].name.toString().indexOf(".otf")>0)
{
       ManifestVariable=ManifestVariable+"<item id=\"font_"+myFiles[f1].name.replace(".jpg","").replace(".jpeg")+"\" href=\"font/"+myFiles[f1].name+"\" media-type=\"application/vnd.ms-opentype\" />\n";    
  }
//Adding Toc Section  
if(myFiles[f1].name.toString().indexOf(".html")>0||myFiles[f1].name.toString().indexOf(".xhtml")>0)
{

spineVariable=spineVariable+"<itemref idref=\"html_"+myFiles[f1].name.replace(".html","")+"\"/>"+"\n";   
}  
 }
 
opfFile.writeln(ManifestVariable+"\n"+"</manifest>\n"+spineVariable+"\n"+" </spine>"+"</package>");
opfFile.close();

}
function GetSubFolders(theFolder) {  
     var myFileList = theFolder.getFiles();  
     for (var i = 0; i < myFileList.length; i++) {  
          var myFile = myFileList[i];  
          if (myFile instanceof Folder){  
               GetSubFolders(myFile);  
          }  
          else if (myFile instanceof File) {  
              //  $.writeln(myFile)
               myFiles.push(myFile);  
          }  
     }  
}
function GetIndex(Page)
{
    for (var Indexing = 0; Indexing < Page.pageItems.length; Indexing++)
    {
        Page.pageItems[Indexing].select();
        try
        {
            if (app.selection[0].constructor.name != "TextFrame" && app.selection[0].constructor.name != "Group")
            {
                TextFrameIndexStart++;
            }
            else if (app.selection[0].constructor.name == "Group")
            {
                GetIndex(Page.pageItems[Indexing])
            }
        }
        catch (err)
        {
            LastException=LastException+"{Error in GetIndex() method: "+err+"}";
        }

    }
}

function RunThroughPageItems(Page)
{
    var Page_Item = null;
    if(applyMaster)
    {
      ProcessMasterItems(Page.appliedMaster,Page);
    }
      var ReindexedPItems=ReIndexing(Page.pageItems)
    for (var b = 0; b < ReindexedPItems.length; b++)
    {
        Page_Item = Page.pageItems.itemByID(ReindexedPItems[b]);
        Process_PageItems(Page, Page_Item, false);
    }
}

function Process_PageItems(Page, Page_Item, Grouped)
{
    Page_Item.select();
    try
    {
        if (app.selection[0].constructor.name == "TextFrame")
        {
            TextFrame_No++
            Process_TextFrame(Page, Page_Item, Grouped);
        }
        else if (app.selection[0].constructor.name == "Group")
        {
            Get_PageItemsGroup(Page, Page_Item, true);
            Grouped = false;
        }
    }
    catch (err)
    {
        LastException=LastException+"{Error in Process_PageItems() method: "+err+"}";
    }
}

function Process_TextFrame(Page, Page_Item, Grouped)
{
      if(avoidDuplicate!=Page_Item.id)
      {
            var Geomentry = Get_Geomentry(Page_Item, Page, true);
            var Contents = "";
            for (var cd = 0; cd < AllTextFramContents.length; cd++)
            {
                  var GetClass = RegExp("<div class=\"Page-Item-" + Page_Item.id + "\">(.*?)</div>");
                  if (GetClass.test(AllTextFramContents[cd]))
                  {
                        Contents = GetClass.exec(AllTextFramContents[cd])[1];
                  }
            }
            if (Contents != "")
            {
                  if (!Grouped)
                  {
                      
                        //alert(Page_Item.textColumns.length);
                        if(Page_Item.textColumns.length>1)
                        {
                                Output_Current_PageHtml.writeln(tab + "<div class=\"ColumnText" + TextFrame_No + "\">");
                                Output_Current_CSS.writeln(".ColumnText" + TextFrame_No + "{" + "\r\nposition:absolute;\r\ntop: " + Geomentry[0] + "px;\r\nleft: " + Geomentry[1] + "px;\r\nwidth: " + Geomentry[4] + "px;\r\nheight:" + Geomentry[5] + "px;\r\n z-index:" + (TextFrameIndexStart + TextFrame_No) + ";column-count:"+Page_Item.textColumns.length+";\r\n-moz-column-count:"+Page_Item.textColumns.length+"; /* Firefox */\r\n-webkit-column-count:"+Page_Item.textColumns.length+"; /* Safari and Chrome */}");
                                Output_Current_CSS.writeln("");
                                Output_Current_PageHtml.writeln(tab + "\t" + Contents);
                                Contents="";
                                Output_Current_PageHtml.writeln(tab + "</div>");
                        }
                        else if(Page_Item.paragraphs.length>1)
                        {
                              TextFrame_No=HandleParaGroup(Page_Item,TextFrame_No,Geomentry,Grouped,Contents);
                        }
                        else
                        {
                              Output_Current_CSS.writeln(".txt-Item" + TextFrame_No + "{" + "\r\nposition:absolute;\r\ntop: " + Geomentry[0] + "px;\r\nleft: " + Geomentry[1] + "px;\r\nwidth: " + Geomentry[4] + "px;\r\nheight:" + Geomentry[5] + "px;\r\n z-index:" + (TextFrameIndexStart + TextFrame_No) + ";}");
                              Output_Current_CSS.writeln("");
                              var Regex=new RegExp("<p (class=\"[^\"]+)");
                              if(Regex.test(Contents))
                              {
                                    var rep=Regex.exec(Contents)[1]+" "+"txt-Item" + TextFrame_No;
                                    Contents=Contents.replace(Regex.exec(Contents)[1],rep);
                              }
                                Output_Current_PageHtml.writeln(tab + Contents);
                                Contents="";
                             
                        }
                  }
                  else
                  {
                         if(Page_Item.textColumns.length>1)
                        {
                                Output_Current_PageHtml.writeln(tab + "<div class=\"ColumnText" + TextFrame_No + "\">");
                                Output_Current_CSS.writeln(".ColumnText" + TextFrame_No + "{" + "\r\nposition:absolute;\r\ntop: " + Geomentry[0] + "px;\r\nleft: " + Geomentry[1] + "px;\r\nwidth: " + Geomentry[4] + "px;\r\nheight:" + Geomentry[5] + "px;\r\n z-index:" + (TextFrameIndexStart + TextFrame_No) + ";column-count:"+Page_Item.textColumns.length+";\r\n-moz-column-count:"+Page_Item.textColumns.length+"; /* Firefox */\r\n-webkit-column-count:"+Page_Item.textColumns.length+"; /* Safari and Chrome */}");
                                Output_Current_CSS.writeln("");
                                Output_Current_PageHtml.writeln(tab + "\t" + Contents);
                                Contents="";
                                Output_Current_PageHtml.writeln(tab + "</div>");
                        }
                        else if(Page_Item.paragraphs.length>1)
                        {
                              TextFrame_No=HandleParaGroup(Page_Item,TextFrame_No,Geomentry,Grouped,Contents);
                        }
                        else
                        {
                              Output_Current_CSS.writeln(".caption" + TextFrame_No + "{" + "\r\nposition:absolute;\r\ntop: " + Geomentry[0] + "px;\r\nleft: " + Geomentry[1] + "px;\r\nwidth: " + Geomentry[4] + "px;\r\nheight:" + Geomentry[5] + "px;\r\n z-index:" + (TextFrameIndexStart + TextFrame_No) + ";}");
                              Output_Current_CSS.writeln("");                              
                              var Regex=new RegExp("<p (class=\"[^\"]+)");
                              if(Regex.test(Contents))
                              {
                                    var rep=Regex.exec(Contents)[1]+" "+"caption" + TextFrame_No;
                                    Contents=Contents.replace(Regex.exec(Contents)[1],rep);
                              }
                                Output_Current_PageHtml.writeln(tab + Contents);
                                Contents="";
                        }
                  }
            }
            else
            {
                  
            }
      }
     avoidDuplicate=Page_Item.id;
}

function Get_PageItemsGroup(Page, Page_Item, Grouped)
{
    var Page_Item_Sub = null;
     var ReindexedPItems2=ReIndexing(Page_Item.pageItems)
    for (var b = 0; b < ReindexedPItems2.length; b++)
    {
        Page_Item_Sub =Page_Item.pageItems.itemByID(ReindexedPItems2[b]);
        Process_PageItems(Page, Page_Item_Sub, Grouped);
    }
}

function Get_Geomentry(Page_Item, Page, Visible)
{
      var page_WidthEl = DocumentWidth * DocResolution;  
    try
    {
        app.activeDocument.viewPreferences.horizontalMeasurementUnits = app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.INCHES;
        Page_Item.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.PAGE_COORDINATES, false);
    }
    catch (Err)
    {
           LastException=LastException+"{Error in Get_Geomentry() method: "+Err+"}";
    }
    var Geomentry = new Array();
    if (!Visible)
    {
        //alert(Page_Item.geometricBounds[0]+"\r\n"+DocResolution+"\r\n"+app.activeDocument.viewPreferences.horizontalMeasurementUnits);
        Geomentry[0] = Page_Item.geometricBounds[0] * DocResolution;// Top
        Geomentry[1] = Page_Item.geometricBounds[1] * DocResolution;// Left
        Geomentry[2] = Page_Item.geometricBounds[2] * DocResolution;// Bottom
        Geomentry[3] = Page_Item.geometricBounds[3] * DocResolution;// Right
        // width=right-left , height = bottom-top
        Geomentry[4] = Geomentry[3] - Geomentry[1];// Width
        Geomentry[5] = Geomentry[2] - Geomentry[0];// height
        if ((currentPageSide == "right") && ((Geomentry[1] == page_WidthEl) || (Geomentry[1] > page_WidthEl)))
        {
            Geomentry[1] = Geomentry[1] - page_WidthEl
        }
      }
    else
    {
        //alert(Page_Item.geometricBounds[0]+"\r\n"+DocResolution+"\r\n"+app.activeDocument.viewPreferences.horizontalMeasurementUnits);
        Geomentry[0] = Page_Item.geometricBounds[0] * DocResolution;// Top
        Geomentry[1] = Page_Item.geometricBounds[1] * DocResolution;// Left
        Geomentry[2] = Page_Item.geometricBounds[2] * DocResolution;// Bottom
        Geomentry[3] = Page_Item.geometricBounds[3] * DocResolution;// Right
      
        // width=right-left , height = bottom-top
        Geomentry[4] = Geomentry[3] - Geomentry[1];// Width
        Geomentry[5] = Geomentry[2] - Geomentry[0];// height   
        
       if ((currentPageSide == "right") && ((Geomentry[1] == page_WidthEl) || (Geomentry[1] > page_WidthEl)))
        {
            Geomentry[1] = Geomentry[1] - page_WidthEl
        }
    }
    return  Geomentry;
}


function ProcessMasterItems(MasterSpread,Page)
{
       
      try
      {
      for(var B=0;B<MasterSpread.pages.length;B++)
      {
            if(Page.side==MasterSpread.pages[B].side)
            {
                  try
                  {
                        MasterSpread.pages.item(B).pageItems.everyItem().override(Page);
                  }
                  catch(e)
                  {
                      LastException=LastException+"{Error in ProcessMasterItems() method: "+e+"}";
                  }
            }
            
      }
      }
      catch(err)
      {
          LastException=LastException+"{Error in ProcessMasterItems()2 method: "+e+"}";
      }
     
}


function ReIndexing(pageItems)
{    
      var TempArray=new Array();
      var TempArray2=new Array();

      for(var a=0;a<pageItems.length;a++)
      {
            var  pageItem=pageItems[a];
            pageItem.resolve(AnchorPoint.TOP_LEFT_ANCHOR,CoordinateSpaces.PAGE_COORDINATES,true);
            TempArray.push(Math.round(pageItem.geometricBounds[0])+"#"+Math.round(pageItem.geometricBounds[1])+"#"+pageItem.index+"_"+pageItem.id);
      }
      TempArray.sort();
      //alert(TempArray.toString());
      for(var a=0;a<TempArray.length;a++)
      {
            //var id=TempArray[a].split("_")[1].trim();
            var id=TempArray[a].split("_")[1];
            TempArray2.push(parseInt(id));
      }
      return TempArray2;
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
            LastException=LastException+"{Error in myRemoveFrames() method: "+e+"}";
            }
      }
}


function HandleParaGroup(Page_Item,TextFrame_No,Geomentry,Grouped,Contents)
{
      var getP=new RegExp("<p[^>]*?>.*?</p>")
      var EXE= new Array();
      while(getP.test(Contents))
      {
            EXE.push(getP.exec(Contents)[0].toString());
            Contents=Contents.replace(getP.exec(Contents)[0].toString(),"");
      }
      var Top=Geomentry[0];
      var Left=Geomentry[1];
      var Width=Geomentry[4];
      var Height=Geomentry[5];
      for(var rt=0;rt<Page_Item.paragraphs.length;rt++)
      {
            var par=EXE[rt];
            if(Grouped)
            {
                  Output_Current_CSS.writeln(".caption" + TextFrame_No + "{" + "\r\nposition:absolute;\r\ntop: " + Top+ "px;\r\nleft: " + Left + "px;\r\nwidth: " + Width + "px;\r\n z-index:" + (TextFrameIndexStart + TextFrame_No) + ";}");
                  Output_Current_CSS.writeln("");                              
                  var Regex=new RegExp("<p (class=\"[^\"]+)");
                  if(Regex.test(par))
                  {
                         var rep=Regex.exec(par)[1]+" "+"caption" + TextFrame_No;
                        par=par.replace(Regex.exec(par)[1],rep);
                  }
                  Output_Current_PageHtml.writeln(tab + par);
            }
            else
            {
                  Output_Current_CSS.writeln(".txt-Item" + TextFrame_No + "{" + "\r\nposition:absolute;\r\ntop: " + Top+ "px;\r\nleft: " + Left + "px;\r\nwidth: " + Width + "px;\r\n z-index:" + (TextFrameIndexStart + TextFrame_No) + ";}");
                  Output_Current_CSS.writeln("");                              
                  var Regex=new RegExp("<p (class=\"[^\"]+)");
                  if(Regex.test(par))
                  {
                        var rep=Regex.exec(par)[1]+" "+"txt-Item" + TextFrame_No;
                        par=par.replace(Regex.exec(par)[1],rep);
                  }
                  Output_Current_PageHtml.writeln(tab + par);
            }
            TextFrame_No++;
            
                  var myText = Page_Item.paragraphs[rt].texts.everyItem();
                  var myTable = myText.tables.add({columnCount:1,bodyRowCount:1});
                  myTable.cells[0].autoGrow = true;
                  try
                  {
                        myText.characters.itemByRange(0,-2).move(LocationOptions.AFTER, myTable.cells[0].insertionPoints[0]);
                  }
                  catch(TR)
                  {
                      LastException=LastException+"{Error in HandleParaGroup() method: "+TR+"}";
                  }
                  var Cellheight=myTable.cells[0].height*DocResolution;
                  myTable.remove();
                  Top=Top+Cellheight;
      }
      return TextFrame_No;
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

alert("completed!");