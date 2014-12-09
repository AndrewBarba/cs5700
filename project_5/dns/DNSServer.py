import SocketServer
import socket
import json

SCAMPER_PORT = 44447

class DNSServer(SocketServer.ThreadingMixIn, SocketServer.UDPServer):
  def update_rtt(self, client_ip, replica_ip, rtt):
    '''
    Updates the round trip time for the client IP with the replica
    '''
    if replica_ip not in self.ip_rtt:
      self.ip_rtt[replica_ip] = {}
    self.ip_rtt[replica_ip][client_ip] = rtt

  def send_ip(self, client_ip):
    '''
    Sends a scamper request to every replica for the clients IP
    '''
    for host in self.host_list:
      print "%s : %d" % (host[1], SCAMPER_PORT)
      s = socket.socket()
      s.connect((host[1], SCAMPER_PORT))
      data = json.dumps({'ip': client_ip})
      s.send(data)
      s.close()
