import SocketServer
from GeoLocator import Locator
from dns_header import DNSHeader
from dns_question import DNSQuestion
from dns_answer import DNSAnswer
from math import sin, cos, sqrt, atan2, radians

class DNSRequestHandler(SocketServer.BaseRequestHandler):
  '''
  This is the handler for incoming DNS requests
  '''
  def handle(self):
    '''
    This function handles the incoming DNS request
    '''
    self.data = self.request[0].strip()
    best_ip = self.get_metrics(self.client_address[0])
    send_scamper = False
    if best_ip == None:
      send_scamper = True
      best_ip = self.find_closest_location(self.client_address[0])
    header = DNSHeader(self.data[0:12], parse=True)
    question = DNSQuestion(self.data[12:])
    domain = question.domain
    if domain == self.server.dns_server:
      new_header = DNSHeader(ancount=1, qdcount=1, id=header.id)
      answer = DNSAnswer(domain, best_ip)
      packet = new_header.construct() + question.construct() + answer.construct()
      self.request[1].sendto(packet, self.client_address)
    if send_scamper:
      self.server.send_ip(self.client_address[0])

  def get_metrics(self, client_ip):
    '''
    Finds the best replica for the client
    The best replica is based off of smallest rtt 
    '''
    current_best_rtt = None
    current_best_ip = None
    for replica_ip in self.server.ip_rtt:
      if client_ip in self.server.ip_rtt[replica_ip]:
        if current_best_rtt == None:
          current_best_rtt = self.server.ip_rtt[replica_ip][client_ip]
          current_best_ip = replica_ip
        elif self.server.ip_rtt[replica_ip][client_ip] < current_best_rtt:
          current_best_rtt = self.server.ip_rtt[replica_ip][client_ip]
          current_best_ip = replica_ip
    return current_best_ip

  def find_closest_location(self, ip_address):
    '''
    Finds the replcia that is closest to the given IP address
    '''
    locator = Locator()
    coord = locator.find_coordinates(ip_address)
    try:
      if coord['status'] == 'fail':
        return self.server.host_list[0][1]
    except Exception:
      pass
    closest_distance = None
    closest_ip = None
    for host in self.server.hosts:
      distance = self.find_distance(self.server.hosts[host]['lat'], self.server.hosts[host]['lon'], coord['lat'], coord['lon'])
      if closest_distance == None:
        closest_distance = distance
        closest_ip = self.server.hosts[host]['ip']
      elif distance < closest_distance:
        closest_distance = distance
        closest_ip = self.server.hosts[host]['ip']
    return closest_ip

  def find_distance(self, lat1, lon1, lat2, lon2):
    '''
    Finds the distance between 2 lat/lon pairs
    '''
    radius = 6373.0
    lat1 = radians(lat1)
    lon1 = radians(lon1)
    lat2 = radians(lat2)
    lon2 = radians(lon2)
    lon_distance = lon2 - lon1
    lat_distance = lat2 - lat1
    a = (sin(lat_distance/2))**2 + cos(lat1) * cos(lat2) * (sin(lon_distance/2))**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return radius * c