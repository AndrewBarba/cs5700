
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
	socket.write('HELLO');
});

socket.on('data', function(data){
	var text = data.toString('utf8');
	var parts = text.split(' ');
	console.log(parts);
	var y = parseInt(parts.pop());
	var opString = parts.pop();
	var x = parseInt(parts.pop());
	var op = OPS[opString];
	socket.write(CLASS + ' ' + op(x,y).toFixed(0));
});

socket.on('end', function(){
	console.log('connection closed...');
	console.log(SECRET);
});





















