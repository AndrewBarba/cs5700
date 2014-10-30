
import rawsocket
from urlparse import urlparse

HTTP_VERSION = "HTTP/1.0"
LINE_ENDING = "\r\n"

def get(url):

	# parse url into parts
	parts = urlparse(url)

	# open socket
	sock = rawsocket.rawsocket()
	sock.connect(parts.netloc, 80)

	# build http request
	req = "GET %s %s%s" % (parts.path, HTTP_VERSION, LINE_ENDING)
	req += "Host: %s%s" % (parts.netloc, LINE_ENDING)
	req += LINE_ENDING
	
	# send http request
	sock.send(req)

	# get data
	data = ""
	while 1:
		line = sock.recv()
		data += line
		if len(line) == 0:
			break

	# close the socket
	sock.close()

	# parse page data
	page = data.split(LINE_ENDING)[-1]

	return page