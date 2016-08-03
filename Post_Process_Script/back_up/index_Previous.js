var path = require('path'); //File System
fs=require('fs'); //FileSystem
var argv=require('optimist').argv; //Arguments
var writetofile=require('./libs/writetofile'); //file writer
var readfile=require('./libs/readfile'); //file writer
var cheerio=require('cheerio');
var underscore=require('./libs/underscore.js'); //file writer
var mkdirp=require('mkdirp'); //Creating Directory
var html = require("html");
var ncp = require('ncp').ncp;
var copy = require('ncp');
var cssParser = require('css-parse');
var input = argv.i;
var output = argv.o;
var fileNameArray = [];
var filePathArray = [];
var indentValue = [];
var newContent = "";
var inputContent = readfile(input);
var $ = cheerio.load(inputContent);
fromDir(output, '.html');

inputModification($);
divRemoval($,'div');
divRemoval($,'div');
divRemoval($,'body');
lineSplitting('p');
lineSplitting('h1');
lineSplitting('h2');
lineSplitting('h3');

var cssFile = output + '\\OEBPS\\css\\template.css';
var cssContent = readfile(cssFile);
var cssDom = cssParser(cssContent);
cssUpdate(cssDom,cssFile);

//console.log($('span[class^=Page][class$=Start]').length);
//html.prettyPrint($.xml(),{indent_size:2});

fs.writeFileSync(output + '\\temp1.html',$.xml().toString().replace(/<p\/>/g,'<\/p>').replace(/\/>/g,'>').replace(/\t/g,''));

// Reading a input Directory
function fromDir(startPath, filter) {

    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
			fromDir(filename, filter); //recurse
        }
		else if(filename.indexOf(filter) >= 0){
			if(filename.indexOf('temp.html') >=0){}
			else{
				fileNameArray.push(files[i]);
				filePathArray.push(filename);
				//contentConversion(filename,files[i]);
			}
			
		}
		else{};
    };

};

function divRemoval($,TagName){
	$(TagName).children('div').each(function(element,index){
		$(this).before($(this).html());
		$(this).remove();
	});
}

function inputModification ($){
	$('img').each(function(inde,elem){
		$(this).remove();
	});
}

function cssUpdate(cssDom,cssFile){

	cssDom.stylesheet.rules.forEach(function(e,j){
		if(e.selectors){
			e.selectors.forEach(function(e2,k){
				for(var i=0;i<e.declarations.length;i++){
					if(e.declarations[i].property == 'text-indent'){
						if(e.declarations[i].value == 0 || e.declarations[i].value == '0px'){}
						else{
							indentValue.push(e2 + '_indent' + '{\n' + e.declarations[i].property + ': ' + e.declarations[i].value + '\n}');
							cssContent = cssContent.toString().replace(e.declarations[i].property + ':' + e.declarations[i].value, e.declarations[i].property + ': ' + '0');
						}
					}
				}
			});
			
		}
	});

	for(var iV=0; iV<indentValue.length; iV++){

		cssContent = cssContent.toString().replace(cssContent, cssContent + '\n' + indentValue[iV]);

	}

fs.writeFileSync(cssFile,cssContent);
}


function lineSplitting(varTag){
	$(varTag).each(function(index,element){
	
		var varClass = $(this).attr('class');
		if($(this).find('span[class*="Line"]').length > 1){
			$(this).find('span[class*="LineStart"]').each(function (ind,ele){
				if($(this).next().html() != null){ 
					$(this).before($(this).html() + '<\/p>\n' + '<p class="' + varClass +'">');
					$(this).remove();
				}
				else{
					$(this).before($(this).html());
					$(this).remove();
				}
			});
		}
		else{
			$(this).find('span[class*="LineStart"]').each(function (ind,ele){
				if($(this).next().html() != null){
					$(this).before($(this).html() + '<\/p>\n' + '<p class="' + varClass +'">');
					$(this).remove();
				}
				else{
					$(this).before($(this).html());
					$(this).remove();
				}
			});
		}
		if($(this).find('span[class*="Frame"]').length > 1){
		
			$(this).find('span[class^=Frame][class$=Start]').each(function (ind,ele){
				if($(this).next().html() != null){ 
					$(this).before('<span class="' + $(this).attr('class') + '">' + $(this).html() + '</span>' + '<\/p>\n' + '<p class="' + varClass +'">');
					$(this).remove();
				}
				else{
					$(this).before('<span class="' + $(this).attr('class') + '">' + $(this).html() + '</span>');
					$(this).remove();
				}
			});
		}
		else{
			$(this).find('span[class^=Frame][class$=Start]').each(function (ind,ele){
				if($(this).next().html() != null){
					$(this).before('<span class="' + $(this).attr('class') + '">' + $(this).html() + '</span>' + '<\/p>\n' + '<p class="' + varClass +'">');
					$(this).remove();
				}
				else{
					$(this).before('<span class="' + $(this).attr('class') + '">' + $(this).html() + '</span>');
					$(this).remove();
				}
			});
		}
		
		if($(this).find('span[class*="Page"]').length > 1){
		
			$(this).find('span[class^=Page][class$=Start]').each(function (ind,ele){
				if($(this).next().html() != null){ 
					$(this).before('<span class="' + $(this).attr('class') + '">' + $(this).html() + '</span>' + '<\/p>\n' + '<p class="' + varClass +'">');
					$(this).remove();
				}
				else{
					$(this).before('<span class="' + $(this).attr('class') + '">' + $(this).html() + '</span>');
					$(this).remove();
				}
			});
		}
		else{
			$(this).find('span[class^=Page][class$=Start]').each(function (ind,ele){
				if($(this).next().html() != null){
					$(this).before('<span class="' + $(this).attr('class') + '">' + $(this).html() + '</span>' + '<\/p>\n' + '<p class="' + varClass +'">');
					$(this).remove();
				}
				else{
					$(this).before('<span class="' + $(this).attr('class') + '">' + $(this).html() + '</span>');
					$(this).remove();
				}
			});
		}
		
		
		$(this).find('span').each(function (index,element){
			if($(this).children().attr('class')){
			
				if($(this).children().attr('class').toString().match('_Frame')){
					if($(this).attr('class')){
						$(this).before('<span class="' + $(this).attr('class') + ' ' + $(this).children().attr('class') + '">' + $(this).children().html() + '</span>');
						$(this).remove();
					}
					else{	
						$(this).before('<span class="' + $(this).children().attr('class') + '">' + $(this).children().html() + '</span>');
						$(this).remove();
					}
				}
				
			}
		});
		$(this).find('span[class*="FirstWord"]').each(function (ind,ele){
			$(this).before($(this).html());
			$(this).remove();
		});
		$(this).find('br').each(function (ind,ele){
			$(this).remove();
		});
		$(this).find('span[class*="LineEnd"]').each(function (ind,ele){
			$(this).before($(this).html());
			$(this).remove();
		});

	});
}
