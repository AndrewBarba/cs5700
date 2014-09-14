"""
Simple python script to help learn basic socket API
"""

import sys, socket

HOSTNAME = sys.argv[-2]
PORT = sys.argv[-1]

options = ( HOSTNAME, int(PORT) )
print options

print 'creating socket...'
sock = socket.socket()
print 'socket created'

print 'connecting...'
sock.connect(options)
print 'connected'

print 'sending message...'
sock.send('hello')
print 'sent message'

print 'closing...'
sock.close()
print 'closed'