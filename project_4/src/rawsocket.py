
import socket, sys, struct, random

class InPacket():

    def __init__(self, packet):
        self.packet = packet[0]
        self.src_prt = 0
        self.dst_prt = 0
        self.seqn = 0
        self.ackn = 0
        self.offset = 0
        self.flags = 0
        self.flg_fin = 0
        self.flg_syn = 0
        self.flg_rst = 0
        self.flg_psh = 0
        self.flg_ack = 0
        self.flg_urg = 0
        self.window = 0
        self.chksum = 0
        self.urg_prt = 0
        self.header_size = 0
        self.data_size = 0
        self.data = 0

    def parse(self):
        header = struct.unpack('!HHLLBBHHH', self.packet[20:40])
        self.src_prt = header[0]
        self.dst_prt = header[1]
        self.seqn = header[2]
        self.ackn = header[3]
        self.offset = header[4]
        self.flags = header[5]
        self.flg_fin = (self.flags & 1)
        self.flg_syn = (self.flags & 2) >> 1
        self.flg_rst = (self.flags & 4) >> 2
        self.flg_psh = (self.flags & 8) >> 3
        self.flg_ack = (self.flags & 16) >> 4
        self.flg_urg = (self.flags & 32) >> 5
        self.window = header[6]
        self.chksum = header[7]
        self.urg_prt = header[8]
        self.header_size = 20 + (4 * (self.offset >> 4))
        self.data_size = len(self.packet) - self.header_size
        self.data = self.packet[self.header_size:]
        return self
        

class OutPacket():

    def tcp_checksum(self, msg):
        s = 0
        for i in range(0, len(msg), 2):
            w = ord(msg[i]) + (ord(msg[i+1]) << 8 )
            s = s + w
        s = (s>>16) + (s & 0xffff);
        s = s + (s >> 16);
        s = ~s & 0xffff
        return s

    def ip(self):
        version = 4
        headlen = 5 # Internet Header Length
        tos = 0 # Type of Service
        totallen = 0 # total length will be filled by kernel
        id = 54321
        flags = 0 # More fragments
        offset = 0
        ttl = 255
        protocol = socket.IPPROTO_TCP
        checksum = 0 # will be filled by kernel
        source = socket.inet_aton(self.ip_srcip)
        destination = socket.inet_aton(self.ip_dstip)
        ver_ihl = (version << 4) + headlen
        flags_offset = (flags << 13) + offset
        ip_header = struct.pack("!BBHHHBBH4s4s",
                                ver_ihl,
                                tos,
                                totallen,
                                id,
                                flags_offset,
                                ttl,
                                protocol,
                                checksum,
                                source,
                                destination)
        return ip_header

    def tcp(self):
        data_offset = (self.tcp_offset << 4) + 0
        flags = self.tcp_flg_fin + (self.tcp_flg_syn << 1) + (self.tcp_flg_rst << 2) + (self.tcp_flg_psh << 3) + (self.tcp_flg_ack << 4) + (self.tcp_flg_urg << 5)
        tcp_header = struct.pack('!HHLLBBHHH',
                                 self.tcp_srcp,
                                 self.tcp_dstp,
                                 self.tcp_seqn,
                                 self.tcp_ackn,
                                 data_offset,
                                 flags, 
                                 self.tcp_window,
                                 self.checksum,
                                 self.urgp)
        #pseudo header fields
        source_ip = socket.inet_aton(self.ip_srcip)
        destination_ip = socket.inet_aton(self.ip_dstip)
        reserved = 0
        protocol = socket.IPPROTO_TCP
        total_length = len(tcp_header) + len(self.payload)
        # Pseudo header
        psh = struct.pack("!4s4sBBH",
                    source_ip,
                    destination_ip,
                    reserved,
                    protocol,
                    total_length)
        psh = psh + tcp_header + self.payload
        tcp_checksum = self.tcp_checksum(psh)
        tcp_header = struct.pack("!HHLLBBH",
                            self.tcp_srcp,
                            self.tcp_dstp,
                            self.tcp_seqn,
                            self.tcp_ackn,
                            data_offset,
                            flags,
                            self.tcp_window)
        tcp_header += struct.pack('H', tcp_checksum)
        tcp_header += struct.pack('!H', self.urgp)
        return tcp_header

    def packet(self):
        ip = self.ip()
        tcp = self.tcp()
        return ip + tcp + self.payload

    def __init__(self, sock, data=''):
        self.ip_srcip = socket.gethostbyname(socket.gethostname())
        self.ip_dstip = sock.ip
        self.tcp_srcp = sock.src_port
        self.tcp_dstp = 80
        self.tcp_seqn = sock.seqn
        self.tcp_ackn = sock.ackn
        self.tcp_offset = 5 # Data offset: 5x4 = 20 bytes
        self.tcp_reserved = 0
        self.tcp_flg_urg = 0
        self.tcp_flg_ack = 0
        self.tcp_flg_psh = 0
        self.tcp_flg_rst = 0
        self.tcp_flg_syn = 0
        self.tcp_flg_fin = 0
        self.tcp_window = socket.htons(5840)
        self.checksum = 0
        self.urgp = 0

        if len(data) % 2 == 1:
            data += "0"
        self.payload = data

class RawSocket():

    def connect(self, domain, port):
        # set ip and port number
        self.ip = socket.gethostbyname(domain)
        self.port = port
        # send syn
        self.send_syn()
        # receive syn/ack
        self.recv_next()
        # send ack
        self.send_ack()

    def send_syn(self):
        syn = OutPacket(self)
        syn.tcp_flg_syn = 1
        self.socket.sendto(syn.packet(), (self.ip, 0))

    def send_ack(self):
        ack = OutPacket(self)
        ack.tcp_flg_ack = 1
        self.socket.sendto(ack.packet(), (self.ip, 0))

    def send_fin(self):
        fin = OutPacket(self)
        fin.tcp_flg_ack = 1
        fin.tcp_flg_fin = 1
        self.socket.sendto(fin.packet(), (self.ip, 0))

    def send(self, data):
        packet = OutPacket(self, data)
        packet.tcp_flg_ack = 1
        packet.tcp_flg_psh = 1
        self.socket.sendto(packet.packet(), (self.ip, 0))
        self.recv_next()

    def recv_next(self, bytes=65565):
        while True:
            packet = self.rsocket.recvfrom(65565)
            ip = packet[1][0]
            if ip == self.ip:
                packet = InPacket(packet).parse()
                self.seqn = packet.ackn
                self.ackn = packet.seqn + packet.data_size + 1
                return packet

    def recv(self, bytes=65565):
        data = ""
        while True:
            packet = self.recv_next()
            data += packet.data
            self.send_ack()
            if packet.flg_fin:
                return data

    def close(self):
        self.send_fin()
        self.recv_next()
        self.send_ack()

    def __init__(self):
        self.src_port = random.randint(49152,65535)
        self.port = 1234
        self.seqn = 454
        self.ackn = 0
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_RAW)
        self.rsocket = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_TCP)

def rawsocket():
    return RawSocket()
