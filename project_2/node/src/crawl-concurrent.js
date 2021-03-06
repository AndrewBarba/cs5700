/**
 * Project 2 Solution written in Node.js
 */

/*==========================================*
/* Dependencies
/*==========================================*/

var net   = require('net')
  , snet  = require('tls')
  , util  = require('util')
  , async = require('async')
  , _     = require('underscore')
  , fb    = require('./fakebook');

/*==========================================*
/* Constants
/*==========================================*/

var USER_NAME = process.argv[2];
var PASSWORD = process.argv[3];
var MAX_SECRETS = process.argv[4] || 5;
var CONCURRENCY = process.argv[5] || 10;
var DEBUG = process.argv.indexOf('DEBUG') >= 0;

/*==========================================*
/* Logging
/*==========================================*/

console.debug = function(message) {
	if (!DEBUG) return;
	console.log(message);
};

/*==========================================*
/* Crawler
/*==========================================*/

var SECRETS = [];
var HISTORY = {};
var QUEUE = [];

// begin by logging into Fakebook
fb.login(USER_NAME, PASSWORD, function(err, res, body){
	
	// load initial links into queue
	QUEUE = [ _.union(QUEUE, fb.parseLinks(body)) ];

	async.whilst(

		// stop if the queue is empty or if we have 5 secrets
		function() {
			return QUEUE.length > 0 && SECRETS.length < MAX_SECRETS;
		},

		// crawl
		function(done) {
			
			// grab last url off queue
			var urls = QUEUE.pop();

			// concurrently fetch urls
			// limit the number of concurrent connections
			async.eachLimit(urls, CONCURRENCY, function(url, next){

				// mark the page as crawled
				HISTORY[url] = true;
				
				fb.crawl(url, function(err, res, body){

					// check for error, could be a 40x error so we skip
					if (err) {
						console.debug(err);
						console.debug(res.statusCode);
						return next();
					}
					
					// gather uncrawled links and add them to the queue
					var links = fb.parseLinks(body);
					links = _.filter(links, function(link){
						return !HISTORY[link];
					});

					QUEUE.push(links);

					// grab any secrets that may have been on the page
					var secrets = fb.parseSecrets(body);
					if (secrets && secrets.length) {
						SECRETS = _.union(SECRETS, secrets);
						console.debug('Found Secret!');
						console.debug(secrets);
					}
			
					next();
				});

			}, done);
		},

		// nothing left to crawl, print our secrets
		// cleanly exit process
		function() {
			_.each(SECRETS, function(secret){
				console.log(secret);
			});

			process.exit();
		});
});