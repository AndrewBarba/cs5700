
import socket, sys
from struct import *

class InPacket():

	def __init__(self, packet):
		self.packet = packet

class OutPacket():

	def checksum(self, msg):
		s = 0
		 
		# loop taking 2 characters at a time
		for i in range(0, len(msg)-1, 2):
		    w = ord(msg[i]) + (ord(msg[i+1]) << 8 )
		    s = s + w
		 
		s = (s>>16) + (s & 0xffff);
		s = s + (s >> 16);
		 
		#complement and mask to 4 byte short
		s = ~s & 0xffff
		 
		return s

	def ip_header(self):
		ip = self.ip
		source_ip = self.source_ip
		dest_ip = ip
		 
		# ip header fields
		ip_ihl = 5
		ip_ver = 4
		ip_tos = 0
		ip_tot_len = 0  # kernel will fill the correct total length
		ip_id = 54321   #Id of this packet
		ip_frag_off = 0
		ip_ttl = 255
		ip_proto = socket.IPPROTO_TCP
		ip_check = 0    # kernel will fill the correct checksum
		ip_saddr = socket.inet_aton ( source_ip )   #Spoof the source ip address if you want to
		ip_daddr = socket.inet_aton ( dest_ip )
		 
		ip_ihl_ver = (ip_ver << 4) + ip_ihl
		 
		# the ! in the pack format string means network order
		return pack('!BBHHHBBH4s4s' , ip_ihl_ver, ip_tos, ip_tot_len, ip_id, ip_frag_off, ip_ttl, ip_proto, ip_check, ip_saddr, ip_daddr)

	def tcp_header(self, check=0):
		# tcp header fields
		tcp_source = 1234   # source port
		tcp_dest = 80   # destination port
		tcp_seq = 454
		tcp_ack_seq = 0
		tcp_doff = 5    #4 bit field, size of tcp header, 5 * 4 = 20 bytes
		#tcp flags
		tcp_fin = self.tcp_fin
		tcp_syn = self.tcp_syn
		tcp_rst = self.tcp_rst
		tcp_psh = self.tcp_psh
		tcp_ack = self.tcp_ack
		tcp_urg = self.tcp_urg
		tcp_window = socket.htons (5840)    #   maximum allowed window size
		tcp_check = check
		tcp_urg_ptr = 0
		 
		tcp_offset_res = (tcp_doff << 4) + 0
		tcp_flags = tcp_fin + (tcp_syn << 1) + (tcp_rst << 2) + (tcp_psh <<3) + (tcp_ack << 4) + (tcp_urg << 5)
		 
		# the ! in the pack format string means network order
		if check != 0:
			return pack('!HHLLBBH' , tcp_source, tcp_dest, tcp_seq, tcp_ack_seq, tcp_offset_res, tcp_flags,  tcp_window) + pack('H' , tcp_check) + pack('!H' , tcp_urg_ptr)
		else:
			return pack('!HHLLBBHHH' , tcp_source, tcp_dest, tcp_seq, tcp_ack_seq, tcp_offset_res, tcp_flags,  tcp_window, tcp_check, tcp_urg_ptr)

	def psh(self):
		# pseudo header fields
		tcp_header = self.tcp_header()
		user_data = self.data
		source_address = socket.inet_aton( self.source_ip )
		dest_address = socket.inet_aton(self.ip)
		placeholder = 0
		protocol = socket.IPPROTO_TCP
		tcp_length = len(tcp_header) + len(user_data)
		 
		psh = pack('!4s4sBBH' , source_address , dest_address , placeholder , protocol , tcp_length);
		return psh + tcp_header + self.data;

	def packet(self):
		ip_header = self.ip_header()
		psh = self.psh()
		tcp_check = self.checksum(psh)
		tcp_header = self.tcp_header(tcp_check)
		return ip_header + tcp_header + self.data

	def __init__(self, ip, data=''):
		self.ip = ip
		self.source_ip = socket.gethostbyname(socket.gethostname())
		self.data = data
		self.tcp_fin = 0
		self.tcp_syn = 0
		self.tcp_rst = 0
		self.tcp_psh = 0
		self.tcp_ack = 0
		self.tcp_urg = 0


class RawSocket():

	def connect(self, domain, port):
		# set ip and port number
		print "connecting to %s" % domain
		self.ip = socket.gethostbyname(domain)
		self.port = port
		print "resolved ip: %s" % self.ip

		# send syn
		self.send_syn()

		# receive syn/ack
		synack = self.recv_next()

		# send ack
		self.send_ack()

		return self.ip

	def send_syn(self):
		print "sending syn"
		syn = OutPacket(self.ip)
		syn.tcp_syn = 1
		self.socket.sendto(syn.packet(), (self.ip, 0))
		print "sent syn"

	def send_ack(self):
		print "sending ack"
		ack = OutPacket(self.ip)
		ack.tcp_ack = 1
		self.socket.sendto(ack.packet(), (self.ip, 0))
		print "sent ack"

	def send(self, data):
		print "sending data"
		packet = OutPacket(self.ip, data)
		packet.tcp_ack = 1
		packet.tcp_psh = 1
		self.socket.sendto(packet.packet(), (self.ip, 0))
		print "sent data"

	def recv_next(self, bytes=65565):
		print "receiving packet"
		while True:
			packet = self.rsocket.recvfrom(65565)
			ip = packet[1][0]
			if ip == self.ip:
				print "received packet"
				return packet
				

	def recv(self, bytes=65565):
		print "receiving data"
		while True:
			data = self.recv_next()
			packet = InPacket(data)
			self.send_ack()
		print "received data"

	def close(self):
		print "closing socket"
		while True:
			self.ip
		print "closed socket"

	def __init__(self):
		self.socket = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_RAW)
		self.rsocket = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_TCP)

def rawsocket():
	return RawSocket()
