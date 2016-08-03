fs=require('fs'); //File System
var argv=require ('optimist').argv; //Passing Arguments
var readfile=require('./libs/readfile'); //file writer
var mkdirp=require('mkdirp'); //Creating Directory
var ncp = require('ncp').ncp;
var inputFolder = argv.i;
var reportFolder = argv.r;
var input = inputFolder.substr(0,inputFolder.lastIndexOf('\\')) + '\\Temp\\temp.html';
var output = inputFolder.substr(0,inputFolder.lastIndexOf('\\')) + '\\Output';
var divRemoval = require('./libs/unwantedDivRemoval.js');
var contentMerging = require('./libs/frameWiseTravel.js');
var folioUpdate = require('./libs/foliotravel.js');

divRemoval(input,reportFolder);
contentMerging(input,output,reportFolder);
folioUpdate(output);