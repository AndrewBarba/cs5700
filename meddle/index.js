
// Dependencies
var fs = require('fs');
var _ = require('underscore');
var async = require('async');
var utf8 = require('to-utf-8');
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
    		var data = packet.data.toString('utf8');
    		console.log(data);
    	});
    });
});