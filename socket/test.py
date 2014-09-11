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

print 'connecting...'
sock.connect(options)
print 'connected'

print 'sending message...'
sock.send('hello')
print 'sent message'

print 'closing...'
sock.close()
print 'closed'