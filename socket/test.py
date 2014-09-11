#!/usr/bin/python

import sys, socket, operator, ssl

# arguments
HOSTNAME = sys.argv[-1]
PORT = 27993

# connect
options = ( HOSTNAME, PORT )
print options

sock = socket.socket()
print sock

sock.connect(options)
print 'connected'

sock.send('hello')
print 'sent message'

sock.close()
print 'closed'