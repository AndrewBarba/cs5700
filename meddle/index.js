
// Dependencies
var fs = require('fs');
var _ = require('underscore');
var async = require('async');
var zlib = require('zlib');
var pcap = require('pcap-parser');

// Constants
var dir = process.argv[2];

// Read packets
fs.readdir(dir, function(err, files){
    if (err) throw err;

    async.eachSeries(files, function(file, done){
    	var path = dir + '/' + file;
    	var parser = pcap.parse(path);

    	var pdata = new Buffer("");

    	parser.on('packet', function(packet) {
    		scan(packet);
    	});

    	parser.on('end', function(){
    		done();
    	});

  		parser.on('error', function(){
  			done();
  		});
    });
});

// scan for valuable info
function scan(packet) {
    var text = packet.data.toString('utf8').replace(/( |-|,)/gi, '').toLowerCase();

    if (text.indexOf('werdna') >= 0) {
        console.log('WARNING: PASS 1');
        // console.log(text);
    }

    if (text.indexOf('st1ffl3r') >= 0) {
        console.log('WARNING: PASS 2');
        // console.log(text);
    }

    if (text.indexOf('andrew') >= 0) {
        // console.log('WARNING: FIRST NAME');
        // console.log(text);
    }

    if (text.indexOf('barba') >= 0) {
        // console.log('WARNING: LAST NAME');
        // console.log(text);
    }

    if (text.indexOf('abarba') >= 0) {
        console.log('WARNING: EMAIL');
        // console.log(text);
    }

    if (text.indexOf('9085667524') >= 0) {
        console.log('WARNING: PHONE');
        // console.log(text);
    }

    if (text.indexOf('lat') >= 0) {
        // console.log('WARNING: LATITUDE');
        // console.log(text);
    }

    if (text.indexOf('lon') >= 0) {
        // console.log('WARNING: LONGITUDE');
        // console.log(text);
    }
};