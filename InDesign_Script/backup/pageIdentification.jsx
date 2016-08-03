pageWiseCharacterIdentification(app.activeDocument);
var CharacterStyleErrorDetails = 'File Name,InDesign Page Number,HTML Page Number,Word,Character Style Name,Comments';
$.writeln(CharacterStyleErrorDetails);
alert('Completed');

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
                        CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstWord.contents + '"' + ',' + '"' + firstWord.appliedCharacterStyle.name + '"' + ',' + 'First Word of the Page not Found';
                    }
                    
                    if(lastWord.appliedCharacterStyle.name == '[None]' && lastWord.appliedCharacterStyle.name != pageStartStyle && lastWord.appliedCharacterStyle.name != pageEndStyle && lastWord.appliedCharacterStyle.name != pageStartEndStyle &&  lastWord.appliedCharacterStyle.name != frameEndStyle && lastWord.appliedCharacterStyle.name != frameStartEndStyle && lastWord.appliedCharacterStyle.name != frameStartStyle){
                        lastWord.appliedCharacterStyle = frameEndStyle;
                    }
                    else{
                        CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + lastWord.contents + '"' + ',' + '"' + lastWord.appliedCharacterStyle.name + '"' + ',' + 'Last Word of the Page not Found';    
                    }
                    
                }/* if First Frame Condition ends Here */
            
                else if(tF == textFrames.length-1){ /* Last Frame of the page */
                    firstWord = textFrame.words[0];
                    lastWord = textFrame.words[(textFrame.words.length-1)];
                    if(lastWord.appliedCharacterStyle.name == '[None]' && lastWord.appliedCharacterStyle.name != pageStartStyle && lastWord.appliedCharacterStyle.name != pageEndStyle && lastWord.appliedCharacterStyle.name != pageStartEndStyle &&  lastWord.appliedCharacterStyle.name != frameEndStyle && lastWord.appliedCharacterStyle.name != frameStartEndStyle && lastWord.appliedCharacterStyle.name != frameStartStyle){
                        lastWord.appliedCharacterStyle = pageEndStyle;
                    }
                    else{
                        CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + lastWord.contents + '"' + ',' + '"' + lastWord.appliedCharacterStyle.name + '"' + ',' + 'Last Word of the Page not Found';
                    }
                    
                    if(firstWord.appliedCharacterStyle.name == '[None]' && firstWord.appliedCharacterStyle.name != pageStartStyle && firstWord.appliedCharacterStyle.name != pageEndStyle && firstWord.appliedCharacterStyle.name != pageStartEndStyle &&  firstWord.appliedCharacterStyle.name != frameEndStyle && firstWord.appliedCharacterStyle.name != frameStartEndStyle && firstWord.appliedCharacterStyle.name != frameStartStyle){
                        firstWord.appliedCharacterStyle = frameStartStyle;
                    }
                    else{
                        CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstWord.contents + '"' + ',' + '"' + firstWord.appliedCharacterStyle.name + '"' + ',' + 'First Word of the Frame not Found';
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
                            CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstWord.contents + '"' + ',' + '"' + firstWord.appliedCharacterStyle.name + '"' + ',' + 'First Word of the Frame not Found';    
                        }
                        if(lastWord.appliedCharacterStyle.name == '[None]' && lastWord.appliedCharacterStyle.name != pageStartStyle && lastWord.appliedCharacterStyle.name != pageEndStyle && lastWord.appliedCharacterStyle.name != pageStartEndStyle &&  lastWord.appliedCharacterStyle.name != frameEndStyle && lastWord.appliedCharacterStyle.name != frameStartEndStyle && lastWord.appliedCharacterStyle.name != frameStartStyle){
                            lastWord.appliedCharacterStyle = frameEndStyle;
                        }
                        else{
                            CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + lastWord.contents + '"' + ',' + '"' + lastWord.appliedCharacterStyle.name + '"' + ',' + 'Last Word of the Frame not Found';
                        }
                    }
                    else{
                        firstLastWord = textFrame.words[0];
                        if(firstLastWord.appliedCharacterStyle.name == '[None]' && firstLastWord.appliedCharacterStyle.name != pageStartStyle && firstLastWord.appliedCharacterStyle.name != pageEndStyle && firstLastWord.appliedCharacterStyle.name != pageStartEndStyle &&  firstLastWord.appliedCharacterStyle.name != frameEndStyle && firstLastWord.appliedCharacterStyle.name != frameStartEndStyle && firstLastWord.appliedCharacterStyle.name != frameStartStyle){
                            firstLastWord.appliedCharacterStyle = frameStartEndStyle;
                        }
                        else{
                            CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstLastWord.contents + '"' + ',' + '"' + firstLastWord.appliedCharacterStyle.name + '"' + ',' + 'First & Last Word of the Frame not Found';
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
                        CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstWord.contents + '"' + ',' + '"' + firstWord.appliedCharacterStyle.name + '"' + ',' + 'First Word of the Page not Found';
                    }
                    
                    if(lastWord.appliedCharacterStyle.name == '[None]' && lastWord.appliedCharacterStyle.name != pageStartStyle && lastWord.appliedCharacterStyle.name != pageEndStyle && lastWord.appliedCharacterStyle.name != pageStartEndStyle &&  lastWord.appliedCharacterStyle.name != frameEndStyle && lastWord.appliedCharacterStyle.name != frameStartEndStyle && lastWord.appliedCharacterStyle.name != frameStartStyle){
                        lastWord.appliedCharacterStyle = pageEndStyle;
                    }
                    else{
                        CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + lastWord.contents + '"' + ',' + '"' + lastWord.appliedCharacterStyle.name + '"' + ',' + 'Last Word of the Page not Found';
                    }
                } 
                else{ /* Less than or equal to 1 words is found within the frame */
                    firstLastWord = textFrame.words[0];
                    if(firstLastWord.appliedCharacterStyle.name == '[None]' && firstLastWord.appliedCharacterStyle.name != pageStartStyle && firstLastWord.appliedCharacterStyle.name != pageEndStyle && firstLastWord.appliedCharacterStyle.name != pageStartEndStyle &&  firstLastWord.appliedCharacterStyle.name != frameEndStyle && firstLastWord.appliedCharacterStyle.name != frameStartEndStyle && firstLastWord.appliedCharacterStyle.name != frameStartStyle){
                        firstLastWord.appliedCharacterStyle = pageStartEndStyle;
                    }
                    else{
                        CharacterStyleErrorDetails = CharacterStyleErrorDetails + '\n' + myDoc.name + ',' + 'page' + page.name + ',' + 'Page' + (p+1) + '.html' + ',' + '"' + firstLastWord.contents + '"' + ',' + '"' + firstLastWord.appliedCharacterStyle.name + '"' + ',' + 'First & Last Word of the Page not Found';
                    }
                }
            
            } /* One Frame page ends here */
            
          }
          
    }

}
