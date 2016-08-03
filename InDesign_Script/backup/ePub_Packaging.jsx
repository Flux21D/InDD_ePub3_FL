#target 'indesign'
#include 'lib/impelsys/common/common_lib.js'

var fileArray = [];
var imagesArray = [];
var fontsArray = [];
var htmlsArray = [];
var cssArray = [];
var ncxArray = [];

var outputFolder = new Folder(app.activeDocument.fullName.parent + '/Output');
if (outputFolder.exists) {
    outputFolder.remove();
}
outputFolder.create();

var OEBPSFolder =  new Folder(outputFolder + '/OEBPS');

//Images
fileArray = OEBPSFolder.searchFile(new RegExp(/\.jpg$|\.jpeg$/));
for (var count = 0; count < fileArray.length; count++)
{
    imagesArray.push(
    {
        file : fileArray[count],
    }
    );
}

//Fonts
fileArray = OEBPSFolder.searchFile(new RegExp(/\.otf|\.ttf/));
for (var count = 0; count < fileArray.length; count++)
{
    fontsArray.push(
    {
        file : fileArray[count],
    }
    );
}

//CSS
fileArray = OEBPSFolder.searchFile(new RegExp(/\.css$/));
for (var count = 0; count < fileArray.length; count++)
{
    cssArray.push(
    {
        file : fileArray[count],
    }
    );
}
//ncx
fileArray = OEBPSFolder.searchFile(new RegExp(/\.ncx$/));
for (var count = 0; count < fileArray.length; count++)
{
    ncxArray.push(
    {
        file : fileArray[count],
    }
    );
}

//html
fileArray = OEBPSFolder.searchFile(new RegExp(/\.html|\.xhtml/));
for (var count = 0; count < fileArray.length; count++)
{
    htmlsArray.push(
    {
        file : fileArray[count],
    }
    );
}

//$.writeln(app.activeDocument.metadataPreferences.copyrightNotice);

var opfFile = new File(OEBPSFolder + '\\content.opf');
opfFile.open('w');
opfFile.encoding = "utf-8";
opfFile.writeln('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>');
opfFile.writeln('<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" prefix="rendition: http://www.idpf.org/vocab/rendition/# ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/">');
opfFile.writeln('<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">');
opfFile.writeln('<meta name="cover-image" content="cover.jpg" \/>');
opfFile.writeln('<meta property="ibooks:specified-fonts">true<\/meta>');
opfFile.writeln('<dc:title>' + app.activeDocument.metadataPreferences.documentTitle + '<\/dc:title>');
opfFile.writeln('<dc:language>en-US<\/dc:language>');
opfFile.writeln('<dc:identifier id="bookid"><\/dc:identifier>');

opfFile.writeln('<!--fixed-layout options-->');
opfFile.writeln('<meta property="rendition:layout">pre-paginated</meta>');
opfFile.writeln('<meta property="rendition:orientation">portrait<\/meta>');
opfFile.writeln('<meta property="rendition:spread">none<\/meta>');

opfFile.writeln('</metadata>');
opfFile.writeln('<manifest>');
opfFile.writeln('<!--html-->');

for(var hA=0; hA<htmlsArray.length; hA++){
    
    opfFile.writeln('<item id="' + htmlsArray[hA].file.name.toString().replace('.html','').replace('.xhtml','') + '" href="html/' + htmlsArray[hA].file.name + '" media-type="application\/xhtml+xml" \/>');

}

opfFile.writeln('<!--images-->\n');

for(var iA=0; iA<imagesArray.length; iA++){
    if(imagesArray[iA].file.name == 'cover.jpg'){
        opfFile.writeln('<item id="cover-image' + '" href="images/' + imagesArray[iA].file.name + '" media-type="image\/jpeg"  properties="cover-image" \/>');    
    }
    else{
        opfFile.writeln('<item id="img-' + (iA+1) + '" href="images/' + imagesArray[iA].file.name + '" media-type="image\/jpeg"\/>');
    }

}

opfFile.writeln('<!--css-->\n');

for(var cA=0; cA<cssArray.length; cA++){

    opfFile.writeln('<item id="css-' + (cA+1) + '" href="css/' + cssArray[cA].file.name + '" media-type="text\/css"\/>');

}

opfFile.writeln('<!--Fonts-->\n');

for(var fA=0; fA<fontsArray.length; fA++){
    if(fontsArray[fA].file.name.toString().match('.otf')){
        opfFile.writeln('<item id="fonts-' + (fA+1) + '" href="font/' + fontsArray[fA].file.name + '" media-type="application\/x-font-otf"\/>');
    }
    else if(fontsArray[fA].file.name.toString().match('.ttf')){
        opfFile.writeln('<item id="fonts-' + (fA+1) + '" href="font/' + fontsArray[fA].file.name + '" media-type="application\/x-font-ttf"\/>');
    }

}

opfFile.writeln('</manifest>\n');

opfFile.writeln('<spine>\n');

for(var hA=0; hA<htmlsArray.length; hA++){
    
    opfFile.writeln('<itemref idref="' + htmlsArray[hA].file.name.toString().replace('.html','').replace('.xhtml','') + '" />');

}


opfFile.writeln('</spine>\n');

opfFile.writeln('</package>\n');

opfFile.close();

outputFolder.zip(new File(outputFolder + "/" + app.activeDocument.name.toString().replace(/\.indd/g,'.epub')));



