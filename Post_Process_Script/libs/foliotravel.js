var path = require('path'); //File System
fs=require('fs'); //FileSystem
var argv=require('optimist').argv; //Arguments
var writetofile=require('./writetofile'); //file writer
var readfile=require('./readfile'); //file writer
var cheerio=require('cheerio');
var underscore=require('./underscore.js'); //file writer
var mkdirp=require('mkdirp'); //Creating Directory
var html = require("html");
var ncp = require('ncp').ncp;
var copy = require('ncp');
var cssParser = require('css-parse');

module.exports = function (output)
{

	fromDir(output,'.xhtml');

	// Reading a input Directory
	function fromDir(startPath,filter) {
		if (!fs.existsSync(startPath)) {
			console.log("no dir ", startPath);
			return;
		}
		var files = fs.readdirSync(startPath);
		for (var i = 0; i < files.length; i++) {
			filename = path.join(startPath, files[i]);
			var stat = fs.lstatSync(filename);
			if (stat.isDirectory()) {
				fromDir(filename,filter); //recurse
			}
			else if(filename.indexOf(filter) >= 0){
				pageSplitting(filename,files[i],files[i].toString().replace('.xhtml','').replace('page','Page'));
			}
			else{};
		};
	};

	function pageSplitting(filePath,fileName,PageNumber){
		var outputHTMLContent = readfile(filePath);
		var $ = cheerio.load(outputHTMLContent);
		if($('div[class*="TextFrame"]').length > 0){
			if($('div[class*="TextFrame"]').eq($('div[class*="TextFrame"]').length-1).text() == ''){
				if($('div[class*="TextFrame"]').eq($('div[class*="TextFrame"]').length-1).find('p').length > 0){
					$('div[class*="TextFrame"]').eq($('div[class*="TextFrame"]').length-1).find('p').each(function (index,element){
						var pClass = $(this).attr('class');
						$(this).remove();
					});
				}
				
				$('div[class*="TextFrame"]').eq($('div[class*="TextFrame"]').length-1).html('<p class="FolioPageNumber">' + PageNumber.toString().replace('Page00','').replace('Page0','').replace('Page','') + '</p>');
				
			}
			else{
			}
			
		}
		fs.writeFileSync(filePath.toString(),$.xml().toString().replace(/\t/g,'').replace(/\n/g,'').replace(/\<div class\=\"TextFrame[0-9]+\"\/\>/g,''));	
	}

}