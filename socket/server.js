/*=========================================*/
/* Node.js TCP Server
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
			socket.write('12345 hello_world BYE');
		} else {
			socket.write('12345 10 / 3');
			count++;
		}
	});

	socket.on('end', function(){
		console.log('Socket closed.\n');
	});

}).listen(port);

console.log('\n\n' + 'Running server on port: ' + port + '\n\n');