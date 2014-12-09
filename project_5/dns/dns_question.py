from struct import *

class DNSQuestion():
  '''
  Represents a DNS Question in a DNS Response/Request
  '''
  def __init__(self, data, qtype=0, qclass=0):
    self.data = data
    self.qname = self.parse_qname(data)
    self.qtype = qtype
    self.qclass = qclass
    self.name_length = len(self.qname) + 1
    self.name_type = self.parse_type(self.name_length, data) # we only handle 1 which is an A type
    self.name_class = self.parse_class(self.name_length, data)

  def parse_type(self, name_length, data):
    '''
    parses the type field from a DNS Question
    '''
    t = unpack('!H', data[name_length:name_length+2])[0]
    return t

  def parse_class(self, name_length, data):
    '''
    parses the class field
    '''
    return ord(data[name_length+3:])

  def parse_qname(self, data):
    '''
    parses the qname field
    '''
    get_size = True
    current_size = 0
    count = 0
    domain = ''
    for char in data:
      next_char = unpack('!c', char)[0]
      if get_size:
        current_size = ord(next_char)
        get_size = False
        if current_size == 0:
          self.domain = domain[1:]
          return domain[1:] + '.'
        domain += '.'
      else:
        domain += next_char
        count += 1
        if count == current_size:
          get_size = True
          count = 0
    print 'ERROR'
    print data, domain

  def construct(self):
    return self.data

  def __str__(self):
    return 'DNS Question\n' +\
      'QNAME:\t' + str(self.qname) +\
      '\nQTYPE:\t' + str(self.qtype) +\
      '\nQCLASS:\t' + str(self.qclass)


