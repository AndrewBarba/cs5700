
import socket

class RawSocket():

	def connect(self, domain, port):
		self.ip = socket.gethostbyname(domain)
		self.port = port
		return self.ip

	def send(self, data):
		return self.socket.send(data)

	def recv(self, bytes=64):
		return self.socket.recv(bytes)

	def close(self):
		return self.socket.close()

	def __init__(self):
		self.socket = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_IP)
		host = socket.gethostbyname(socket.gethostname())
		self.socket.bind((host, 0))
		self.socket.setsockopt(socket.IPPROTO_IP, socket.IP_HDRINCL, 1)

def rawsocket():
	return RawSocket()
