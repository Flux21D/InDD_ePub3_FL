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
var parentTagName,ClassName = "";
var report = '';

module.exports = function (input,output,reportFolder)
{

	var content = readfile(input);
	var $ = cheerio.load(content);

	fromDir(output,'.xhtml');

	fs.writeFileSync(input.toString().replace('_1.html','_2.html'),$.xml().toString().replace('\<title\/>','\<title\>\<\/title\>'));



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
		outputHTMLContent = outputHTMLContent.toString().replace('\<title\/\>','<title><\/title>');
		var $$ = cheerio.load(outputHTMLContent);
		$('div[class*="' + PageNumber + '_Frame"]').each(function (index,element){
			var FrameNumber = 'Text' + $(this).attr('class').toString().split('_')[1];
			$$('div.' + FrameNumber).html($(this).html());
			$(this).remove();
		});
		$('div.' + PageNumber).each(function (index,element){
			var FrameNumber = 'TextFrame1';
			$$('div.' + FrameNumber).html($(this).html());
			$(this).remove();
		});
		
		fs.writeFileSync(filePath,$$.xml().toString());	
	}

}