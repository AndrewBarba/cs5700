import SocketServer
from DNSRequestHandler import DNSRequestHandler
from DNSServer import DNSServer
import threading
import time

class ScamperServer(SocketServer.ThreadingMixIn, SocketServer.TCPServer):
  '''
  This is an asynchronous tcp server that listens for scamper requests from
  from the replica servers
  '''
  def update_rtt(self, client_ip, replica_ip, rtt):
    '''
    update the round trip time for a client from a replica
    '''
    self.dnsserver.update_rtt(client_ip, replica_ip, rtt)

  def start_dns(self, ip, port, dns_server, hosts, host_list):
    '''
    start running the dns server
    '''
    self.dnsserver = DNSServer((ip, port), DNSRequestHandler)
    self.dnsserver.dns_server = dns_server
    self.dnsserver.ip_rtt = {}
    self.dnsserver.hosts = hosts
    self.dnsserver.host_list = host_list
    self.dns_server_thread = threading.Thread(target=self.dnsserver.serve_forever)
    self.dns_server_thread.setDaemon(True)
    self.dns_server_thread.start()
