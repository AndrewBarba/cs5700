
/*==========================================*
/* Dependencies
/*==========================================*/

var net  = require('net')
  , util = require('util');

/*==========================================*
/* Constants
/*==========================================*/

var CLASS    = 'cs5700fall2014'
  , NEUID    = process.argv.pop()
  , HOSTNAME = process.argv.pop()
  , SSL      = false
  , PORT     = 27993
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

process.argv.forEach(function(val, index){
	if (val == '-p') {
		PORT = process.argv[index + 1];
	}
	if (val == '-s') {
		SSL = true;
	}
});

/*==========================================*
/* Sockets
/*==========================================*/

var socket = net.connect(PORT, HOSTNAME, function(){
	var hello = util.format('%s %s %s\n', CLASS, 'HELLO', NEUID);
	socket.write(hello);
});

socket.on('data', function(data){
	var text = data.toString('utf8');
	console.log(text);
	var res = new Response(text);
	if (res.goodBye()) {
		console.log('goodbye...');
		SECRET = res.secret();
		socket.close();
	} else {
		var ans = res.calculate();
		var message = util.format('%s %d\n', CLASS, parseInt(ans));
		socket.write(message);
	}
});

socket.on('close', function(){
	console.log(SECRET);
	process.exit();
});

/*==========================================*
/* Response Object
/*==========================================*/

function Response(text) {
	
	this.text = text;
	
	this.parts = function() {
		return this.text.trim().split(' ');
	};

	this.part = function(index) {
		if (index >= 0) {
			return this.parts()[index];
		} else {
			var parts = this.parts();
			var len = parts.length;
			return parts[len + index];
		}
	};

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

	this.goodBye = function() {
		var part = this.part(-1);
		console.log(part);
		return part == "BYE";
	};

	this.secret = function() {
		if (this.goodBye()) {
			return this.part(-2);
		} else {
			return null;
		}
	};
}
