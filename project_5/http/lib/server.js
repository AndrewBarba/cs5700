/*============================================================================*
 * Dependencies                                                               *
 *============================================================================*/

var fs = require("fs");
var http = require("http");
var net = require("net");
var util = require("util");
var _ = require("./underscore");

/*============================================================================*
 * Modules                                                                    *
 *============================================================================*/

var cache = require("./cache");
var metrics = require("./metrics");
var scamper = require("./scamper");

/*============================================================================*
 * Constants                                                                  *
 *============================================================================*/

var PORT = process.argv[3];
var ORIGIN = process.argv[5];
var ORIGIN_PORT = "8080";

/*============================================================================*
 * HTTP Server                                                                *
 *============================================================================*/

var server = http.createServer(function(req, res){

	// origin url
 	var url = util.format("http://%s:%s%s", ORIGIN, ORIGIN_PORT, req.url);

 	// check cache
 	var data = cache.get(url);

 	// if we have data return it
 	// otherwise fetch from origin
 	if (data) {
 		var meta = cache.getMeta(url);
 		setMetadata(res, meta, true);
 		res.end(data);
 	} else {
 		http
 			.get(url, function(response){
 				cache.setMeta(url, response);
 				setMetadata(res, response);
 				response.pipe(cache.set(url)).pipe(res);
 			})
 			.on("error", function(err){
 				res.statusCode = 500;
 				res.end(err.toString("utf8"));
 			});
 	}

 	// Helper function for setting response metadata
 	// like statusCode and headers
 	function setMetadata(res, meta, cacheHit) {
 		if (!res || !meta) return;
 		res.statusCode = meta.statusCode;
 		_.each(meta.headers, function(val, key){
 			res.setHeader(key, val);
 		});
 		res.setHeader("x-cache", cacheHit ? "hit" : "miss");
 		res.setHeader("x-powered-by", "node.js/0.10.33");
 	}
});

// Start listening
server.listen(PORT);
console.log("HTTP Server " + PORT);

/*============================================================================*
 * Metrics                                                                    *
 *============================================================================*/

// Setup metrics
metrics.bind(server);

// Log metrics
setInterval(function(){
	console.log(metrics.toJSON());
}, 10 * 1000);

/*============================================================================*
 * Error Handling                                                             *
 *============================================================================*/

// Catch uncaught errors
process.on("uncaughtException", function(err) {
 	console.log("Caught exception: " + err);
});
