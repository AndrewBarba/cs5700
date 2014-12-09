import socket
import json

'''
test harness for scamper
'''
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('127.0.0.1', 44446))

data = json.dumps({'ip': '123.255.7.89', 'rtt': 666})
s.send(data)