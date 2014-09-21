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

fb.login(USER_NAME, PASSWORD, function(err, res, body){
	console.log(body);
});

