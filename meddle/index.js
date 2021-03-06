
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

    	parser.on('packet', function(packet) {
    		scan(packet, path);
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
function scan(packet, path) {
    var text = packet.data.toString('utf8').replace(/( |-|,)/gi, '').toLowerCase();

    if (text.indexOf('[password]') >= 0) {
        console.log('WARNING: PASSWORD' + path);
        // console.log(text);
    }

    if (text.indexOf('[first name]') >= 0) {
        console.log('WARNING: FIRST NAME ' + path);
        // console.log(text);
    }

    if (text.indexOf('[last name]') >= 0) {
        console.log('WARNING: LAST NAME');
        // console.log(text);
    }

    if (text.indexOf('[email]') >= 0) {
        console.log('WARNING: EMAIL' + path);
        // console.log(text);
    }

    if (text.indexOf('[phone]') >= 0) {
        console.log('WARNING: PHONE' + path);
        // console.log(text);
    }

    if (text.indexOf('lat') >= 0) {
        console.log('WARNING: LATITUDE' + path);
        // console.log(text);
    }

    if (text.indexOf('lon') >= 0) {
        console.log('WARNING: LONGITUDE' + path);
        // console.log(text);
    }
};
