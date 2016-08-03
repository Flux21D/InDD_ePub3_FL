#target 'indesign'
#include 'lib/impelsys/common/common_lib.js'

softEnterAddingforEachLines(app.activeDocument);

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