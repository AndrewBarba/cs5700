import SocketServer
import json

class ScamperRequestHandler(SocketServer.BaseRequestHandler):
  '''
  This is the Scamper handler for the Scamper Server
  '''
  def handle(self):
    '''
    handles scamper requests from the replicas
    '''
    self.data = self.request.recv(1024)
    data = json.loads(self.data)
    ip = str(data['ip'])
    rtt = int(data['rtt'])
    print "%s : %dms" % (ip, rtt)
    if rtt >= 0:
      self.server.update_rtt(ip, self.client_address[0], rtt)