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
var inputContent = readfile(input);

var tagRegex = />/g;
var endRegex = /\<span class="Page[0-9]+End">(.*?)<\/span>/g;
var startRegex = /<span class="Page[0-9]+Start">(.*?)<\/span>/g;
var pageNumberRegex = /Page[0-9]+Start/g;
var pageEnd = inputContent.toString().match(endRegex);
var pageStart = inputContent.toString().match(startRegex);
for(var p=0; p<pageStart.length; p++){
	inputContent = inputContent;
	var pageNumber = pageStart[p].toString().match(pageNumberRegex);
	for(var eP=0; eP<pageEnd.length; eP++){
		if(pageEnd[eP].toString().match(pageNumber.toString().replace('Start','End'))){
			inputContent = inputContent.toString().replace(pageStart[p],'<div id="' + pageNumber.toString().replace('Start','') + '">' + pageStart[p]).replace(pageEnd[eP],pageEnd[eP] + '</div>');
		}
	}
}
var $ = cheerio.load(inputContent);
//lineSplitting('p');


function lineSplitting(varTag){
	$(varTag).each(function(index,element){
	
		var varClass = $(this).attr('class');
		if($(this).find('span[class*="Line"]').length > 1){
			$(this).find('span[class*="LineEnd"]').each(function (ind,ele){
				if($(this).next().html() != null){ 
					$(this).before($(this).html() + '\n<\/p>\n' + '<p class="' + varClass +'">\n');
					$(this).remove();
				}
				else{
					$(this).before($(this).html());
					$(this).remove();
				}
			});
		}
	});
}



fs.writeFileSync(input.toString().replace('.html','_updated.html'),inputContent);
