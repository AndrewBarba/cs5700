
/*==========================================*
/* Dependencies
/*==========================================*/

var http = require('http')
  , url = require('url');

/*==========================================*
/* Constants
/*==========================================*/

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

HTTP.prototype.request = function(method, urlString, data, headers, next) {
	next = next || function(){};
	data = data || {};
	headers = headers || {};

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
		path: path,
		method: method,
		headers: headers,
		port: 80
	};

	var request = http.request(options, function(res){

		var body = '';

		res.on('data', function (chunk) {
		    body += chunk;
		});

		res.on('end', function(){
		    next(null, res, body.toString('utf8'));
		});

		res.on('error', function(err){
			next(err, res, null);
		});
	});

	if (!isURLData) {
		request.write(dataString);
	}

	request.end();

	return request;
};

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

module.exports = new HTTP();
