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

module.exports = function (input,reportFolder)
{

	var content = readfile(input);
	var $ = cheerio.load(content);
	ImageRemoval();
	unwantedDivRemoval();
	nestedDiv();
	unwantedDivRemoval();

	fs.writeFileSync(input.toString().replace('.html','_1.html'),$.xml());


	function ImageRemoval(){
		$('div').find('img').each(function (element,index){
			$(this).remove();
		});
	}

	function unwantedDivRemoval(){
		$('div').each(function (element,index){
			if($(this).text().toString().match('[A-z0-9]+')){}
			else{
				try{
					if($(this).attr('class').toString().match('Page')){}
					else{
						$(this).remove();
					}
				}
				catch(e){
					
				}
			}
		});
	}

	function nestedDiv(){

		$('div').find('div').each(function (index,element){
			try{
				if($(this).children()[0].name == 'div'){}
				else{
					$(this).parent().before($(this).html());
					$(this).remove();
				}
			}
			catch(e){}
		});
	}

}