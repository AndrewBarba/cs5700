/*=========================================*/
/* Node.js TCP Testing Server
/*=========================================*/

var net = require('net');
var port = 27993;
var count = 0;

net.createServer(function(socket){

	console.log('Socket opened...\n');

	socket.on('data', function(data){
		var text = data.toString('utf8');
		console.log(text);
		if (count >= 10) {
			socket.write('12345 this_is_a_secret BYE');
		} else {
			socket.write('12345 10 / 3');
			count++;
		}
	});

	socket.on('end', function(){
		count = 0;
		console.log('Socket closed.\n');
	});

}).listen(port);

console.log('\n\n' + 'Running server on port: ' + port + '\n\n');