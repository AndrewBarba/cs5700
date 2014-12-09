/*============================================================================*
 * Dependencies                                                               *
 *============================================================================*/
 
var util = require("util");
var _ = require("./underscore");
var utils = require("./utils");
var cache = require("./cache");

/*============================================================================*
 * Constants                                                                  *
 *============================================================================*/

var SAMPLE_TIME = 5.0;

/*============================================================================*
 * Metrics                                                                    *
 *============================================================================*/

var Metrics = function() {
	this.id = utils.guid();
	this.responseTime = 0;
	this.rpm = 0;
};

/*============================================================================*
 * Initialize                                                                 *
 *============================================================================*/

Metrics.prototype.bind = function(server) {
	// monitor response time
	responseTime(this, server);
	// monitor requests per minute
	requestsPerMinute(this, server);
};

/*============================================================================*
 * Methods                                                                    *
 *============================================================================*/

Metrics.prototype.toJSON = function() {
	return {
		"id": this.id,
		"timestamp": Date.now(),
		"responseTime": this.responseTime,
		"rpm": this.rpm,
		"cacheSize": cache.size
	};
};

/*============================================================================*
 * Monitors                                                                   *
 *============================================================================*/

function responseTime(self, server) {
 	
	var SAMPLE = SAMPLE_TIME;
	var times = [];

	// listen for incoming request
 	server.on("request", function(req, res){
 		var start = Date.now();
 		res.on("finish", function(){
 			var diff = Date.now() - start;
 			times.push(diff);
 		});
 	});

 	// run a sample every x seconds
 	setInterval(function(){
 		var total = _.reduce(times, function(a, b){
 			return a + b;
 		}, 0);
 		self.responseTime = times.length ? (total / times.length) : 0;
 		times = [];
 	}, SAMPLE * 1000);
};

function requestsPerMinute(self, server) {
	
	var SAMPLE = SAMPLE_TIME; // sample every x seconds
	var count = 0; // request count for current sample

	// listen for incoming request
	server.on("request", function(req, res){
		count++;	
	});

	// run a sample every x seconds
	setInterval(function(){
		self.rpm = count * (60 / SAMPLE);
		count = 0;
	}, SAMPLE * 1000);
};

module.exports = new Metrics();
