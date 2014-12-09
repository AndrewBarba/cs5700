from optparse import OptionParser
import socket
from struct import *
import json
import threading
import time
import SocketServer
from DNSRequestHandler import DNSRequestHandler
from DNSServer import DNSServer
from ScamperRequestHandler import ScamperRequestHandler
from ScamperServer import ScamperServer
from GeoLocator import Locator

host_list = [('ec2-54-174-6-90.compute-1.amazonaws.com', '54.174.6.90'),\
             ('ec2-54-149-9-25.us-west-2.compute.amazonaws.com', '54.149.9.25'),\
             ('ec2-54-67-86-61.us-west-1.compute.amazonaws.com', '54.67.86.61'),\
             ('ec2-54-72-167-104.eu-west-1.compute.amazonaws.com', '54.72.167.104'),\
             ('ec2-54-93-182-67.eu-central-1.compute.amazonaws.com', '54.93.182.67'),\
             ('ec2-54-169-146-226.ap-southeast-1.compute.amazonaws.com', '54.169.146.226'),\
             ('ec2-54-65-104-220.ap-northeast-1.compute.amazonaws.com', '54.65.104.220'),\
             ('ec2-54-66-212-131.ap-southeast-2.compute.amazonaws.com', '54.66.212.131'),\
             ('ec2-54-94-156-232.sa-east-1.compute.amazonaws.com', '54.94.156.232')]

hosts = {}
IP = '129.10.117.186'
#IP = '127.0.0.1'
SCAMPER_PORT = 44446

def start_server(dns_server, port):
  '''
  This function starts the dns server as well as the scamper server
  '''
  scamper_server = ScamperServer((IP, SCAMPER_PORT), ScamperRequestHandler)
  scamper_server.start_dns(IP, port, dns_server, hosts, host_list)
  scamper_server.serve_forever()
 
def load_locations():
  '''
  Loads all of the geolocations of the replica servers
  '''
  locator = Locator()
  for host in host_list:
    data = locator.find_coordinates(host[1])
    hosts[host[0]] = {'ip':host[1], 'lat': data['lat'], 'lon': data['lon']}

# parses the command line args
parser = OptionParser()

parser.add_option("-p", "--port", dest="port", 
  help="choose a port to connect to", default="44444")
parser.add_option("-n", "--name", dest="name", 
  help="choose a name", default="cs5700cdn.example.com")
(options, args) = parser.parse_args()

load_locations()
print "DNS Server Running: %s" % options.port
start_server(options.name, int(options.port))