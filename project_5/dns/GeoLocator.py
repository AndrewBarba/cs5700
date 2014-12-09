import urllib2
import json

class Locator():
  '''
  The purpose of this class is to get a geolocation associated with an ip address
  '''
  def find_coordinates(self, ip):
    '''
    fetch a location for a given ip
    '''
    response = urllib2.urlopen('http://ip-api.com/json/' + ip)
    return json.load(response)