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
var MAX_SECRETS = 5;

/*==========================================*
/* Crawler
/*==========================================*/

var SECRETS = [];
var HISTORY = {};
var QUEUE = [];

// begin by logging into Fakebook
fb.login(USER_NAME, PASSWORD, function(err, res, body){
	
	QUEUE = _.union(QUEUE, fb.parseLinks(body));
	
	async.whilst(

		// stop if the queue is empty or if we have 5 secrets
		function() {
			return QUEUE.length > 0 && SECRETS.length < MAX_SECRETS;
		},

		// crawl
		function(next) {
			var url = QUEUE.pop();

			fb.crawl(url, function(err, res, body){
				
				// mark the page as crawled
				HISTORY[url] = true;
				
				// gather uncrawled links
				var links = fb.parseLinks(body);
				_.each(links, function(link){
					if (!HISTORY[link]) {
						QUEUE.push(link);
					}
				});

				// grab any secrets that may have been on the page
				var secrets = fb.parseSecrets(body);
				SECRETS = _.union(SECRETS, secrets);
		
				next();
			});
		},

		// nothing left to crawl, print our secrets
		function() {
			_.each(SECRETS, function(secret){
				console.log(secret);
			});
		});
});
