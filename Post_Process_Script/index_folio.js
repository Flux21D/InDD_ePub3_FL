fs=require('fs'); //File System
var argv=require ('optimist').argv; //Passing Arguments
var readfile=require('./libs/readfile'); //file writer
var mkdirp=require('mkdirp'); //Creating Directory
var ncp = require('ncp').ncp;
var inputFolder = argv.i;
var reportFolder = argv.r;
var output = inputFolder.substr(0,inputFolder.lastIndexOf('\\')) + '\\Output';
var folioUpdate = require('./libs/foliotravel.js');


folioUpdate(output,reportFolder);