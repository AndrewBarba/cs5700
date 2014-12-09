
var util = require("util");
var _ = require("../http/lib/underscore");
var http = require("http");
var wiki = require("../http/lib/wiki-en.json");

var HOSTS = [
	"ec2-54-174-6-90.compute-1.amazonaws.com",
	"ec2-54-149-9-25.us-west-2.compute.amazonaws.com",
	"ec2-54-67-86-61.us-west-1.compute.amazonaws.com",
	"ec2-54-72-167-104.eu-west-1.compute.amazonaws.com",
	"ec2-54-93-182-67.eu-central-1.compute.amazonaws.com",
	"ec2-54-169-146-226.ap-southeast-1.compute.amazonaws.com",
	"ec2-54-65-104-220.ap-northeast-1.compute.amazonaws.com",
	"ec2-54-66-212-131.ap-southeast-2.compute.amazonaws.com",
	"ec2-54-94-156-232.sa-east-1.compute.amazonaws.com"
];

var keys = _.sortBy(Object.keys(wiki), function(key){
	return wiki[key];
}).reverse();

_.each(keys, function(path){
	var url = util.format("http://%s:40080/wiki/%s", _.sample(HOSTS), path);
	http
		.get(url, function(res){
			res.on("data", function(){});
			var status = res.statusCode;
			var cache = res.headers['x-cache'];
			var print = util.format("%s %s %s", path, status, cache);
			console.log(print);
		})
		.on("error", function(){
			console.log(path + " error");
		});
});