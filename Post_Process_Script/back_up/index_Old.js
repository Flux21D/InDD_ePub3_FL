var path = require('path'); //File System
fs=require('fs'); //FileSystem
var argv=require('optimist').argv; //Arguments
var writetofile=require('./libs/writetofile'); //file writer
var readfile=require('./libs/readfile'); //file writer
var cheerio=require('cheerio');
var underscore=require('./libs/underscore.js'); //file writer
var mkdirp=require('mkdirp'); //Creating Directory
var ncp = require('ncp').ncp;
var copy = require('ncp');
var cssParser = require('css-parse');
var input = argv.i;
var output = argv.o;
var fileNameArray = [];
var filePathArray = [];
var newContent = "";
var inputContent = readfile(input);
var $ = cheerio.load(inputContent);

inputModification($);
lineSplitting('p');
lineSplitting('h1');
lineSplitting('h2');
lineSplitting('h3');
//lineSplittingheading('h1');
fs.writeFileSync(output + '\\temp1.html',$.xml().toString().replace(/<p\/>/g,'<\/p>').replace(/\/>/g,'>').replace(/\t/g,''));

inputContent = ""; /* Reset the variable */
inputContent = readfile(output + '\\temp1.html');
$ = ""; /* Reset the variable */
$ = cheerio.load(inputContent);

fromDir(output, '.html');
pageWiseTagUpdate();
fs.writeFileSync(output + '\\temp2.html',$.xml().toString().replace(/<p\/>/g,'<\/p>').replace(/\/>/g,'>').replace(/\t/g,''));

inputContent = ""; /* Reset the variable */
inputContent = readfile(output + '\\temp2.html');
var newContents = pageWiseTagCorrection(inputContent,fileNameArray);
fs.writeFileSync(output + '\\temp3.html',newContents);

inputContent = ""; /* Reset the variable */
inputContent = readfile(output + '\\temp3.html');
$ = ""; /* Reset the variable */
$ = cheerio.load(inputContent);
FileLoop($,filePathArray);




function FileLoop($,filePathArray){
	for(var f=0; f<filePathArray.length; f++){
		var fileFullName = filePathArray[f];
		var rootPath = fileFullName.substr(0, fileFullName.lastIndexOf('\\'));
		var fileName = fileFullName.replace(rootPath + '\\', '');
		var pageNumber = fileName.toString().replace('page','Page').replace('.html','');
		contentMerging(fileFullName,rootPath,fileName,pageNumber,$);
	}
}

function contentMerging(fileFullName,rootPath,fileName,pageNumber,$){
	var content = readfile(fileFullName);
	var $$ = cheerio.load(content);
	console.log($('div.'+ pageNumber).html());
	if($('div.'+ pageNumber).html() != null){
		if($$('body').find('div[class*="TextFrame"]').length == 1){
			$$('body').find('div[class*="TextFrame"]').eq(0).html($('div.'+ pageNumber).html());
		}
		else{
			$$('body').find('div[class*="TextFrame"]').eq(0).html($('div.'+ pageNumber).html());
		}
	}
	fs.writeFileSync(rootPath + '\\' + fileName,$$.xml());
}

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

function pageWiseTagUpdate(){
	for(var f=0; f<fileNameArray.length; f++){
		var pageNumber = fileNameArray[f].toString().replace('page','Page').replace('.html','');
		$('div').find('span[class*="' + pageNumber + '_"]').eq(0).parent().before('\n<div class="' + pageNumber + '_open">\n' + '</div>\n');
		$('div').find('span[class*="' + pageNumber + '_"]').eq($('div').find('span[class*="' + pageNumber + '_"]').length-1).parent().after('\n<div class="' + pageNumber + '_close">\n' + '</div>\n');
	}
}

function pageWiseTagCorrection(content,fileNameArray){
	for(var f=0; f<fileNameArray.length; f++){
		var pageNumber = fileNameArray[f].toString().replace('page','Page').replace('.html','');
		content = replaceAll(content,'\n<div class="' + pageNumber + '_open">\n</div>\n','\n<div class="' + pageNumber + '">\n');
		content = replaceAll(content,'\n<div class="' + pageNumber + '_close">\n</div>\n','\n</div>\n');
	}
	return content;
}

function inputModification ($){
	$('img').each(function(inde,elem){
		$(this).remove();
	});
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
			$(this).find('span[class*="FirstWord"]').each(function (ind,ele){
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
		if($(this).find('span[class*="_Frame"]').length > 1){
			$(this).find('span[class*="FrameEnd"]').each(function (ind,ele){
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
			$(this).find('span[class*="FrameStart"]').each(function (ind,ele){
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
	});
}

function lineSplittingheading(varTag){
	$(varTag).each(function(index,element){
	
		var varClass = $(this).attr('class');
		if($(this).find('span[class*="Word"]').length > 1){
			$(this).find('span[class*="LastWord"]').each(function (ind,ele){
				if($(this).next().html() != null){ 
					$(this).before($(this).html() + '<\/h1>\n' + '<h1 class="' + varClass +'">');
					$(this).remove();
				}
				else{
					$(this).before($(this).html());
					$(this).remove();
				}
			});
		}
		else{
			$(this).find('span[class*="FirstWord"]').each(function (ind,ele){
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
		if($(this).find('span[class*="_Frame"]').length > 1){
			$(this).find('span[class*="FrameEnd"]').each(function (ind,ele){
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
			$(this).find('span[class*="FrameStart"]').each(function (ind,ele){
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
	});
}

function replaceAll(tempContent,findContent,replaceContent){
	var newContent = tempContent.toString().replace(findContent,replaceContent);
	return newContent;
}
