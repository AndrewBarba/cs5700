
/*==========================================*
/* Dependencies
/*==========================================*/

var net = require('net')
  , liburl = require('url')
  , util = require('util');

/*==========================================*
/* Constants
/*==========================================*/

var HTTP_VERSION = 'HTTP/1.0';
var LINE_ENDING = '\r\n';
var METHODS = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE'
};

/*==========================================*
/* Service
/*==========================================*/

var HTTP = function(){};

/*==========================================*
/* API
/*==========================================*/

/**
 * Performs an HTTP GET request
 * Attaches given params to the url
 */
HTTP.prototype.get = function(url, params, headers, next) {
	return this.request(METHODS.GET, url, params, headers, next);
};

/**
 * Performs an HTTP POST request
 * Writes given body to the end of the request
 */
HTTP.prototype.post = function(url, body, headers, next) {
	return this.request(METHODS.POST, url, body, headers, next);
};

/**
 * Performs an HTTP PUT request
 * Writes given body to the end of the request
 */
HTTP.prototype.put = function(url, body, headers, next) {
	return this.request(METHODS.PUT, url, body, headers, next);
};

/**
 * Performs an HTTP DELETE request
 * Attaches given params to the url
 */
HTTP.prototype.delete = function(url, params, headers, next) {
	return this.request(METHODS.DELETE, url, params, headers, next);
};

/*==========================================*
/* Utilities
/*==========================================*/

/**
 * Converts a key-value map into an HTTP data string
 * Each piece of data is seperated in the string according
 * to the provided delimiter
 */
HTTP.prototype.dataString = function(params, delimiter) {
	params = params || {};
	delimiter = delimiter || '&';

	var data = [];
    var keys = Object.keys(params);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var val = params[key];
        var param = encodeURIComponent(key) + '=' + encodeURIComponent(val);
        data.push(param);
    }

    return data.join(delimiter);
};

/**
 * Convenience method for creating a data string
 * with proper cookie delimiter
 */
HTTP.prototype.cookieString = function(cookies) {
	return this.dataString(cookies, '; ');
};

/**
 * Returns an HTTP initial line string based on the provided
 * HTTP method and path
 */
HTTP.prototype.initialLine = function(method, path) {
	return util.format('%s %s %s%s', method.toUpperCase(), path, HTTP_VERSION, LINE_ENDING);
};

/*==========================================*
/* HTTP Response
/*==========================================*/

/**
 * An HTTP response object
 * var body: the http response body
 * var headers: the http headers as a key-value map
 */
function Response(res) {

	var parts = res.split(LINE_ENDING);

	// set headers
	this.headers = {};

	// set body
	this.body = parts.pop();

	// loop through parts
	for (var i = 0; i < parts.length; i++) {

		var part = parts[i];

		// set status code
		if (i == 0) {
			var line = part.split(' ');
			this.statusCode = parseInt(line[1]);
		} else {

			var headerParts = part.split(': ');
			if (headerParts.length == 2) {
				var key = decodeURIComponent(headerParts[0]).toLowerCase();
				var val = decodeURIComponent(headerParts[1]);
				var current = this.headers[key];
				var cookie = key == 'set-cookie';
				
				if (!current) {
					this.headers[key] = cookie ? [ val ] : val;
				} else if (typeof current == 'string') {
					this.headers[key] = [ current, val ];
				} else {
					current.push(val);
				}
			}
		}
	}
}

/*==========================================*
/* HTTP Request
/*==========================================*/

/**
 * HTTP request object used to abstract basic
 * protocol related things
 */
function Request(method, url, data, headers) {
	data = data || {};
	headers = headers || {};

	this.url = url;
	this.method = method;
	this.headers = headers;
	this.data = data;
	this.host = liburl.parse(url).host;
	this.path = liburl.parse(url).pathname;
	this.responseData = '';

	this.requestOptions = function() {
		return {
			host: this.host,
			port: 80
		};
	};

	this.data = function(data) {
		this.responseData += data;
	};

	this.dataString = function() {
		return this.responseData.toString('utf8');
	};

	this.requestString = function() {
		var http = require('./http');

		var path = this.path;
		var dataString = http.dataString(data);
		var isURLData = (method == METHODS.GET) || (method == METHODS.DELETE);

		// append url data if needed
		// or set content length
		if (isURLData) {
			path = path + '?' + dataString;
		} else {
			headers['Content-Length'] = encodeURI(dataString).split(/%..|./).length - 1;
			headers['Content-Type'] = 'application/x-www-form-urlencoded';
		}

		// build request
		var req = http.initialLine(method, path);

		// header lines
		var keys = Object.keys(headers);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var val = headers[key];
			req += key + ': ' + val + LINE_ENDING;
		}

		// blank line
		req += LINE_ENDING;

		// request body
		if (!isURLData) {
			req += dataString;
		}

		return req;
	};
};

/*==========================================*
/* HTTP Request
/*==========================================*/

/**
 * Makes a single HTTP request with the given method
 * to the given url. Properly writes provided data
 * to request if it is a POST or PUT and attahces
 * provided data to url if it is a GET or DELETE.
 * Converts a key-value store of headers into proper
 * HTTP headers.
 */
HTTP.prototype.request = function(method, url, data, headers, next) {
	next = next || function(){};

	var _this = this;

	var request = new Request(method, url, data, headers);

	var options = request.requestOptions();
	var socket = net.connect(options, function(){
		var requestString = request.requestString(); 
		console.debug(requestString);
		socket.write(requestString);
	});

	socket.on('data', function(data){
		request.data(data);
	});

	socket.on('close', function(){
		var data = request.dataString();
		var response = new Response(data);
		next(null, response, response.body);
	});

	socket.on('error', function(err){
		next(err);
	});

	return socket;
};

module.exports = new HTTP();
