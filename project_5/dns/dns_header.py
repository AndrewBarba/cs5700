from struct import *

class DNSHeader():
  '''
  Represents a Header in a DNS Request/Response
  '''
  def __init__(self, data=None, id=0, qr=0, opcode=0, aa=0, tc=0, rd=0, \
    ra=0, z=0, rcode=0, qdcount=0, ancount=0, nscount=0, arcount=0, parse=False):
    if parse:
      self.parse(data)
    else:
      self.id = id
      self.qr = qr
      self.opcode = opcode
      self.aa = aa
      self.tc = tc
      self.rd = rd
      self.ra = ra
      self.z = z
      self.rcode = rcode
      self.qdcount = qdcount
      self.ancount = ancount
      self.nscount = nscount
      self.arcount = arcount
    

  def parse(self, data):
    '''
    parses all of the fields from a header
    '''
    (id, flags, qdcount, ancount, nscount, arcount) = unpack('!HHHHHH', data)
    self.id = id
    self.flags = flags

    self.rcode = (flags & 15)
    self.z = (flags & 112) >> 4
    self.ra = (flags & 128) >> 8
    self.rd = (flags & 256) >> 9
    self.tc = (flags & 512) >> 10
    self.aa = (flags & 1024) >> 11
    self.opcode = (flags & 30720) >> 12
    self.qr = (flags & 32768) >> 15

    self.qdcount = qdcount
    self.ancount = ancount
    self.nscount = nscount
    self.arcount = arcount

  def construct(self):
    '''
    constructs a DNS Header from all of the fields in this instance
    '''
    second_row = self.rcode +\
      (self.z << 4) +\
      (self.ra << 8) +\
      (self.rd << 9) +\
      (self.tc << 10) +\
      (self.aa << 11) +\
      (self.opcode << 12) +\
      (self.qr << 15)
    return pack('!HHHHHH', self.id, second_row, self.qdcount, self.ancount, self.nscount, self.arcount)

  def __str__(self):
    return "DNS HEADER" \
    + "\nID:\t" + str(self.id) \
    + "\nrcode:\t" + str(self.rcode) \
    + "\nz:\t" + str(self.z) \
    + "\nra:\t" + str(self.ra) \
    + "\nrd:\t" + str(self.rd) \
    + "\ntc:\t" + str(self.tc) \
    + "\naa:\t" + str(self.aa) \
    + "\nopcode:\t" + str(self.opcode) \
    + "\narcount:\t" + str(self.arcount) \
    + "\nqdcount:\t" + str(self.qdcount) \
    + "\nancount:\t" + str(self.ancount) \
    + "\nnscount:\t" + str(self.nscount) \
    + "\narcount:\t" + str(self.arcount)