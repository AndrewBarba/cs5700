/*============================================================================*
 * Dependencies                                                               *
 *============================================================================*/

var fs = require("fs");
var stream = require("stream");
var util = require("util");
var _ = require("./underscore");
var dist = require("./wiki-en");

/*============================================================================*
 * Constants                                                                  *
 *============================================================================*/

var MAX_BYTES = 10 * 1000 * 1000;

/*============================================================================*
 * Stream                                                                     *
 *============================================================================*/

var TransformStream = function(key, cache, next) {
	this.readable = true;
	this.writable = true;
	this.key = key;
	this.cache = cache;
	this.data = new Buffer("");
	this.onComplete = next || function(){};
};
util.inherits(TransformStream, stream);

/**
 * Buffer incoming data into existing data
 * Emit data event to next pipe
 */
TransformStream.prototype.buffer = function(data) {
 	if (data) {
 		this.data = Buffer.concat([ this.data, new Buffer(data) ]);
 		this.emit("data", data);
 	}
};

/**
 * Write data through next pipe
 */
TransformStream.prototype.write = function () {
 	this.buffer.apply(this, arguments);
};

/**
 * All data is in the buffer.
 * Update cache size and evict something
 * if necessary. Call completion handler
 */
TransformStream.prototype.end = function () {
	this.buffer.apply(this, arguments);

	// update cache and size
	var key = this.key;
	var path = key.split("/").pop();
	this.cache.size += this.data.length;
	this.cache.cache[key] = {
		frequency: dist[path] || 0,
		data: this.data
	};

	// check if we need to remove something
	this.cache.evict();

	// emit end event and call completion handler
	this.emit("end");
	this.onComplete();
};

/*============================================================================*
 * Cache                                                                      *
 *============================================================================*/

var Cache = function() {
	this.cache = {};
	this.meta = {};
	this.size = 0;
};

/**
 * Get data associated with given key
 * null if it does not exist
 */
Cache.prototype.get = function(key) {
	var obj = this.cache[key];
	return obj ? obj.data : null;
};

/**
 * Gets request metadata
 */
Cache.prototype.getMeta = function(key) {
	return this.meta[key];
};

/**
 * Cache incoming data via a stream
 * Completion handler will be called
 * when all data has been cached
 */
Cache.prototype.set = function(key, next) {
	return new TransformStream(key, this, next);
};

/**
 * Stores metadata info for a request
 */
Cache.prototype.setMeta = function(key, res) {
	this.meta[key] = {
		statusCode: res.statusCode,
		headers: res.headers
	};
};

/**
 * Remove a single item from the cache
 * and update cache size
 */
Cache.prototype.remove = function(key) {
	var data = this.get(key);
	if (data) {
		var size = this.size - data.length;
		this.size = Math.max(0, size);
		delete this.cache[key];
	}
};

/**
 * Evict an item from the cache if
 * we exceeded our memory limit
 */
Cache.prototype.evict = function() {
	while (this.size > MAX_BYTES) {
		var low = null;
		_.each(this.cache, function(obj, key){
			if (!low || low.frequency > obj.frequency) {
				low = { key: key, frequency: obj.frequency };
			}
		});
		if (low) {
			this.remove(low.key);
		}
	}
};

module.exports = new Cache();
