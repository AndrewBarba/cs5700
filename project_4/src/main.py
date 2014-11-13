#!/usr/bin/python
"""
Project 4 Solution written in Python
"""

#### Dependencies

import sys
import os
from urlparse import urlparse
import http

#### Constants

URL = sys.argv[-1]

#### Helpers

def getpath(url):
	"""
	Returns a file path based on a given url
	"""
	filename = urlparse(URL).path.split("/")[-1]
	if len(filename) == 0:
		filename = "index.html"
	return "%s/%s" % (os.getcwd(), filename)

def writefile(data, path):
	"""
	Writes data to a given path
	"""
	f = open(path, "w")
	f.write(data)
	f.close()

# Perform GET request
data = http.get(URL)

# Write data to file
writefile(data, getpath(URL))
