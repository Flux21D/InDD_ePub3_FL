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


fromDir(input,'.html');

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
			if(filename.indexOf('temp') >=0){}
			else{
				var htmlFolderPath = filename.substr(0, filename.lastIndexOf('\\'));
				var OEBPSFolderPath = htmlFolderPath.substr(0, htmlFolderPath.lastIndexOf('\\'));
				if(OEBPSFolderPath.endsWith('OEBPS') == 'false'){}
				var templateCSSFile = OEBPSFolderPath + '\\css\\template.css';
				//console.log(templateCSSFile);
				Travel_Through_HTML(filename,templateCSSFile);
				
			}
			
		}
		else{};
    };

};

function Travel_Through_HTML(htmlFile,cssFile){
	var htmlContent = readfile(htmlFile);
	var $ = cheerio.load(htmlContent);
	var cssContent = readfile(cssFile);
	var cssDom = cssParser(cssContent);
	
	cssDom.stylesheet.rules.forEach(function(e,j){
		if(e.selectors){
			e.selectors.forEach(function(e2,k){
				for(var i=0;i<e.declarations.length;i++)
				{
					if(e.declarations[i].property == 'text-indent'){
						if(e.declarations[i].value == 0 || e.declarations[i].value == '0px'){}
						else{
							cssContent = cssContent.toString().replace(e.declarations[i].property + ':' + e.declarations[i].value, e.declarations[i].property + ': ' + '0');
							if(e2.toString().match('.')){
								if($(e2.toString().split('.')[0] + '.' + e2.toString().split('.')[1]).html()){
									$(e2.toString().split('.')[0] + '.' + e2.toString().split('.')[1]).addClass(e2.toString().split('.')[1] + '_firstLineIndent');
									break;
								}
							}
							//cssContent = cssContent.toString().replace(cssContent,cssContent + '\n' + e.selectors + '_firstLineIndent {\n' + e.declarations[i].property + ':' + e.declarations[i].value + '\n}\n');
						}
					}
				}
			});
		}
	});
	//fs.writeFileSync(cssFile,cssContent);
	fs.writeFileSync(htmlFile,$.xml());
	
}