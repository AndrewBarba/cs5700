
/*==========================================*
/* Dependencies
/*==========================================*/

var http = require('./http');

/*==========================================*
/* Constants
/*==========================================*/

var BASE_PATH = 'http://cs5700f14.ccs.neu.edu';
var ENDPOINTS = {
	LOGIN: '/accounts/login/'
};

/*==========================================*
/* Service
/*==========================================*/

var Fakebook = function(){
	this.cookies = {};
};

/*==========================================*
/* API
/*==========================================*/

Fakebook.prototype.login = function(username, password, next) {
	next = next || function(){};

	var _this = this;

	// first fetch root page
	var params = { next: '/fakebook/' };
	_this.get(ENDPOINTS.LOGIN, params, function(err){
		if (err) return next(err);

		// attempt login with given username and password
		var body = {
			username: username,
			password: password,
			csrfmiddlewaretoken: _this.cookies['csrftoken'],
			next: params.next
		};

		_this.post(ENDPOINTS.LOGIN, body, next);
	});
};

/**
 * Clears all cookies, effectively logging us out from Fakebook
 */
Fakebook.prototype.logout = function() {
	this.cookies = {};
};

/**
 * A convenecince method for GETing a webpage
 */
Fakebook.prototype.crawl = function(url, next) {
	return this.get(url, null, next);
};

/**
 * Returns an array of all valid Fakebook links 
 * found in a given string of html
 */
Fakebook.prototype.parseLinks = function(html) {
	var re = /href=("|')[a-zA-Z0-9:\.\/-]*("|')/gi;
	var matches = html.match(re) || [];
	var links = [];
	for (var i = 0; i < matches.length; i++) {
		var match = matches[i].trim();
		var link = match.replace(/(href=|'|")/gi, '');
		if (link.indexOf('://') < 0) {
			link = this.httpUrl(link);
		}
		if (link.indexOf(BASE_PATH) == 0) {
			links.push(link);
		}
	}
	return links;
};

/**
 * Returns an array of all secret tokens 
 * found in a given string of html
 */
Fakebook.prototype.parseSecrets = function(html) {
	var re = /<h2.*secret_flag.*[a-zA-Z0-9]{64}.*h2>/gi;
	var matches = html.match(re) || [];
	var secrets = [];
	for (var i = 0; i < matches.length; i++) {
		var match = matches[i];
		var secrets = match.match(/[a-zA-Z0-9]{64}/gi) || [];
		secrets.push(secrets.pop());
	}
	return secrets;
};

/*==========================================*
/* Utilities
/*==========================================*/

/**
 * Returns a fully qualified http url to Fakebook
 */
Fakebook.prototype.httpUrl = function(endpoint) {
	if (endpoint.indexOf(BASE_PATH) < 0) {
		return BASE_PATH + endpoint;
	} else {
		return endpoint;
	}
};

/**
 * Returns default headers to be sent on every request
 */
Fakebook.prototype.defaultHeaders = function() {
	return {
		Cookie: http.cookieString(this.cookies)
	};
};

/**
 * Stores a cookie locally to be sent on all future requests
 */
Fakebook.prototype.setCookie = function(key, value) {
	this.cookies[key] = value;
};

/**
 * Imports cookies from an http response
 */
Fakebook.prototype.importCookies = function(cookies) {
	cookies = cookies || [];

	for (var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i].split(';')[0];
		var parts = cookie.split('=');
		this.setCookie(parts[0], parts[1]);
	}
};

/*==========================================*
/* Requests
/*==========================================*/

/**
 * Performs a GET request to the fakebook web service
 */
Fakebook.prototype.get = function(endpoint, params, next) {
	next = next || function(){};

	var _this = this;
	var url = this.httpUrl(endpoint);
	var headers = this.defaultHeaders();

	http.get(url, params, headers, function(err, res, body){
		if (err) return next(err);

		// import cookies
		_this.importCookies(res.headers['set-cookie']);

		// retry the request if it fails
		if (res.statusCode >= 500) {
			console.debug('GET 500: ' + url);
			return _this.get(endpoint, params, next);
		};

		// abandon request
		if (res.statusCode >= 400) {
			console.debug('GET 400: ' + url);
			return next(new Error('Not Found'));
		};

		// handle redirect
		if (res.statusCode == 301 || res.statusCode == 302) {
			console.debug('GET 300: ' + url);
			var redirect = res.headers.location;
			var headers = _this.defaultHeaders();
			return http.get(redirect, {}, headers, next);
		};

		next(null, res, body);
	});
};

/**
 * Performs a POST request to the fakebook web service
 */
Fakebook.prototype.post = function(endpoint, data, next) {
	next = next || function(){};

	var _this = this;
	var url = this.httpUrl(endpoint);
	var headers = this.defaultHeaders();

	http.post(url, data, headers, function(err, res, body){
		if (err) return next(err);

		// import cookies
		_this.importCookies(res.headers['set-cookie']);

		// retry the request if it fails
		if (res.statusCode >= 500) {
			console.debug('POST 500: ' + url);
			return _this.post(endpoint, data, next);
		};

		// abandon request
		if (res.statusCode >= 400) {
			console.debug('POST 400: ' + url);
			return next(new Error('Not Found'));
		};

		// handle redirect
		if (res.statusCode == 301 || res.statusCode == 302) {
			console.debug('POST 300: ' + url);
			var redirect = res.headers.location;
			var headers = _this.defaultHeaders();
			return http.get(redirect, {}, headers, next);
		};

		next(null, res, body);
	});
};

module.exports = new Fakebook();
