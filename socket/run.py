#!/usr/bin/python

import sys, socket, operator, ssl

# constants
CLASS = "cs5700fall2014"
OPS = { 
	"+": operator.add, 
	"-": operator.sub,
	"/": operator.div,
	"*": operator.mul
}

# arguments
NEUID = sys.argv[-1]
HOSTNAME = sys.argv[-2]
PORT = 27993
SSL = False

# secret key
SECRET = ''

# parse additional args
port_set = False
for i, val in enumerate(sys.argv):
	if val == "-p":
		port_set = True
		PORT = int(sys.argv[i + 1])
	if val == "-s":
		SSL = True
		if not port_set:
			PORT = 27994

# connect
options = ( HOSTNAME, PORT )
sock = socket.socket()
if SSL:
	sock = ssl.wrap_socket(sock)
sock.connect(options)

# send hello
HELLO = "%s %s %s\n" % (CLASS, "HELLO", NEUID)
sock.send(HELLO)

# solve math problems
working = True
while working:

	# parse message
	status = sock.recv(512).replace('\n', '').split(' ')

	# check for end
	if status[-1] == "BYE":
		working = False
		SECRET = status[-2]
	else:
		op = OPS[status[-2]]
		num1 = int(status[-3])
		num2 = int(status[-1])
		ans = int(op(num1, num2))
		ANSWER = "%s %d\n" % (CLASS, ans)
		sock.send(ANSWER)

# close connection
sock.close()

# done
print SECRET