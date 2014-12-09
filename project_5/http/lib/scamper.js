/*============================================================================*
 * Dependencies                                                               *
 *============================================================================*/

var net = require("net");
var spawn = require("child_process").spawn;

/*============================================================================*
 * Constants                                                                  *
 *============================================================================*/

var DNS_OPTIONS = {
	host: "cs5700cdnproject.ccs.neu.edu",
	port: 44446
};

/*============================================================================*
 * Server                                                                     *
 *============================================================================*/

/**
 * Simple TCP server used to accept
 * incoming requests for client round trip times.
 */
var server = net.createServer(function(socket){
	socket.on("data", function(data){
		var json = null;
		try {
			json = JSON.parse(data.toString("utf8"));
		} catch(err) {
			return socket.end();
		}
		rtt(json.ip, function(err, time){
			if (err) return;
			sendRtt(json.ip, time);
		});
	});
}).listen(44447);

/*============================================================================*
 * Response                                                                   *
 *============================================================================*/

/**
 * Send the rtt for the given IP to the 
 * DNS server via a simple TCP socket.
 */
function sendRtt(ip, time) {
	var socket = net.connect(DNS_OPTIONS, function(){
		var res = JSON.stringify({
			ip: ip,
			rtt: time
		});
		socket.write(res);
	}).on("close", function(){
		socket = null;
	}).on("error", function(err){
		console.log(err);
		socket = null;
	});
}

/*============================================================================*
 * Scamper                                                                    *
 *============================================================================*/

/**
 * Calculate roud trip time to a client
 * Start a new scamper process and callback
 * rtt in ms when complete. -1 indicates
 * something went wrong.
 */
function rtt(ip, next) {

	var text = "";

	scamper = spawn("scamper", ["-c", "ping -c 1", "-i", ip]);

	scamper.stdout.on("data", function(data){
	 	text += data.toString("utf8").trim();
	});

	scamper.stderr.on("data", function(err){
	 	console.log("stderr: " + err);
	 	next(null, -1);
	});

	scamper.on("close", function (code) {
	 	var lines = text.split("\n");
	 	var line = lines.pop();
	 	var parts = line.split(" ");
	 	var stats = parts[parts.length - 2];
	 	var sparts = stats ? stats.split("/") : [];
	 	var avg = parseFloat(sparts[0]);
	 	console.log(avg);
	 	next(null, isNaN(avg) ? -1 : 0);
	});
}