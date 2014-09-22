
/*==========================================*
/* Dependencies
/*==========================================*/

var net = require('net')
  , url = require('url')
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

var HTTP = function(){

	this.connections = 0;
};

/*==========================================*
/* API
/*==========================================*/

HTTP.prototype.get = function(url, params, headers, next) {
	return this.request(METHODS.GET, url, params, headers, next);
};

HTTP.prototype.post = function(url, body, headers, next) {
	return this.request(METHODS.POST, url, body, headers, next);
};

HTTP.prototype.put = function(url, body, headers, next) {
	return this.request(METHODS.PUT, url, body, headers, next);
};

HTTP.prototype.delete = function(url, params, headers, next) {
	return this.request(METHODS.DELETE, url, params, headers, next);
};

/*==========================================*
/* Utilities
/*==========================================*/

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

HTTP.prototype.cookieString = function(cookies) {
	return this.dataString(cookies, '; ');
};

HTTP.prototype.initialLine = function(method, path) {
	return util.format('%s %s %s%s', method.toUpperCase(), path, HTTP_VERSION, LINE_ENDING);
};

/*==========================================*
/* HTTP Response
/*==========================================*/

function Response(res) {

	var parts = res.split(LINE_ENDING);

	if (!parts.length <= 1) {
		console.log(res);
	}

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

HTTP.prototype.request = function(method, urlString, data, headers, next) {
	next = next || function(){};
	data = data || {};
	headers = headers || {};

	var _this = this;
	var urlParts = url.parse(urlString)
	var host = urlParts.host;
	var path = urlParts.pathname;
	var dataString = this.dataString(data);
	var isURLData = (method == METHODS.GET) || (method == METHODS.DELETE);

	// append url data if needed
	// or set content length
	if (isURLData) {
		path = path + '?' + dataString;
	} else {
		headers['Content-Length'] = encodeURI(dataString).split(/%..|./).length - 1;
		headers['Content-Type'] = 'application/x-www-form-urlencoded';
	}

	var options = {
		host: host,
		port: 80
	};

	var socket = net.connect(options, function(){
		_this.connections++;

		// build request
		var req = '';
		
		// initial line
		req += _this.initialLine(method, path);

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

		socket.write(req);
	});

	var res = '';

	socket.on('data', function(data){
		res += data;
	});

	socket.on('close', function(){
		_this.connections--;
		var response = new Response(res.toString('utf8'));
		next(null, response, response.body);
	});

	socket.on('error', function(err){
		console.log(err);
		_this.connections--;
		next(err);
	});

	return socket;
};

module.exports = new HTTP();
