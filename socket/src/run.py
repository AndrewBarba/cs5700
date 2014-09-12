#!/usr/bin/python
import sys, socket, operator, ssl

# constants
CLASS    = "cs5700fall2014"
NEUID    = sys.argv[-1]
HOSTNAME = sys.argv[-2]
PORT     = 27993
SSL      = False

# secret key
SECRET = ''

# basic operators for easy access
OPS = { 
	"+": operator.add, 
	"-": operator.sub,
	"/": operator.div,
	"*": operator.mul
}

# parse additional args
# loop through args and look
# for -p and -s options
# ignore anything else
port_set = False
for i, val in enumerate(sys.argv):
	if val == "-p":
		port_set = True
		PORT = int(sys.argv[i + 1])
	if val == "-s":
		SSL = True
		if not port_set:
			PORT = 27994

# connect to socket with given host and port number
# check for SSL option and handle accordingly
options = ( HOSTNAME, PORT )
sock = socket.socket()
if SSL:
	sock = ssl.wrap_socket(sock)
sock.connect(options)

# send initial hello message
HELLO = "%s %s %s\n" % (CLASS, "HELLO", NEUID)
sock.send(HELLO)

# solve math problems until we recieve BYE message
working = True
while working:

	# parse message recieved from socket
	status = sock.recv(512).replace('\n', '').split(' ')

	# check for BYE message before attempting math problems
	if status[-1] == "BYE":
		working = False

		# we have a secret, set it
		SECRET = status[-2]

	# need to solve a problem
	else:
		# operator is second to last arg
		op = OPS[status[-2]]

		# first num is 3rd to last arg
		num1 = int(status[-3])

		# second num is last arg
		num2 = int(status[-1])

		# perform op and cast to int
		ans = int(op(num1, num2))

		# send anser up socket
		ANSWER = "%s %d\n" % (CLASS, ans)
		sock.send(ANSWER)

# we recieved a BYE message so close the socket
sock.close()

# print our secret
print SECRET