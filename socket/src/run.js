
/*==========================================*
/* Dependencies
/*==========================================*/

var net  = require('net')
  , snet = require('tls')
  , util = require('util');

/*==========================================*
/* Constants
/*==========================================*/

var CLASS    = 'cs5700fall2014'
  , NEUID    = process.argv.pop()
  , HOSTNAME = process.argv.pop()
  , SSL      = false
  , PORT     = 27993
  , SSL_PORT = 27994
  , SECRET   = null;

/*==========================================*
/* Operators
/*==========================================*/

var OPS = {
	'+': function(x,y){ return x + y },
	'-': function(x,y){ return x - y },
	'*': function(x,y){ return x * y },
	'/': function(x,y){ return x / y }
};

/*==========================================*
/* Parse Arguments
/*==========================================*/

(function(){
	
	var _setPort = false;
	
	process.argv.forEach(function(val, index){
		if (val == '-p') {
			PORT = process.argv[index + 1];
			_setPort = true;
		}
		if (val == '-s') {
			SSL = true;
			if (!_setPort) {
				PORT = SSL_PORT;
			}
		}
	});
})();

/*==========================================*
/* Sockets
/*==========================================*/

// connection options
var options = {
	host: HOSTNAME,
	port: PORT,
	rejectUnauthorized: false // don't verify SSL cert with root authority
};

// socket client
// if SSL is ture, use tls insteap of tcp
var client = SSL ? snet : net;

// open the connection
// send our initial 'hello' message
var socket = client.connect(options, function(){
	var hello = util.format('%s %s %s\n', CLASS, 'HELLO', NEUID);
	socket.write(hello);
});

// event handler when we recieve a data from socket
socket.on('data', function(data){
	
	// parse buffer into a string
	var text = data.toString('utf8');
	
	// create our response object
	var res = new Response(text);

	// check for goodbye message
	if (res.goodBye()) {
		// goodbye, set our secret
		SECRET = res.secret();
		// close the socket
		socket.end();
	} else {
		// lets do some math
		var ans = res.calculate();
		// send our answer up the socket
		var message = util.format('%s %d\n', CLASS, parseInt(ans));
		socket.write(message);
	}
});

// socket is closed
// print secret and cleanly exit process
socket.on('close', function(){
	if (SECRET) {
		console.log(SECRET);
	} else {
		console.error('Failed to parse secret.');
	}
	process.exit();
});

// handle errors gracefully
socket.on('error', console.error);

/*==========================================*
/* Response Object
/*==========================================*/

function Response(text) {
	
	// response text
	this.text = text;
	
	// turns a response string into an array of strings
	// to easily access different 'parts' of the response
	this.parts = function() {
		return this.text.trim().split(' ');
	};

	// getter for easily grabbing parts of our response
	// part(-Int) returns a part form the end of the array
	this.part = function(index) {
		if (index >= 0) {
			return this.parts()[index];
		} else {
			var parts = this.parts();
			var len = parts.length;
			return parts[len + index];
		}
	};

	// calculates the answer to a response
	// returns null if the operation is unsupported
	this.calculate = function() {
		var parts = this.parts();
		var op = OPS[this.part(-2)];
		if (op) {
			var x = parseFloat(this.part(-3));
			var y = parseFloat(this.part(-1));
			return op(x, y);
		} else {
			return null;
		}
	};

	// checks for a 'goodbye' message respone
	this.goodBye = function() {
		return this.part(-1) == 'BYE';
	};

	// returns secret if the message is a 'goodbye' response, null otherwise
	this.secret = function() {
		if (this.goodBye()) {
			return this.part(-2);
		} else {
			return null;
		}
	};
}
