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

/*==========================================*
/* Crawler
/*==========================================*/

var SECRETS = [];
var HISTORY = {};
var QUEUE = [];

// begin by logging into Fakebook
fb.login(USER_NAME, PASSWORD, function(err, res, body){
	(function crawl(urls){
		if (SECRETS.length >= MAX_SECRETS) {
			_.each(SECRETS, function(secret){
				console.log(secret);
			});
			process.exit();
		}

		_.each(urls, function(url){
			if (HISTORY[url]) return;
			HISTORY[url] = true;
			
			fb.crawl(url, function(err, res, body){
				if (!body) console.log(res);

				// grab any secrets that may have been on the page
				var secrets = fb.parseSecrets(body);
				SECRETS = _.union(SECRETS, secrets);
			
				// gather uncrawled links
				var links = fb.parseLinks(body);
				crawl(links);
			});
		});

	})(fb.parseLinks(body));
});
