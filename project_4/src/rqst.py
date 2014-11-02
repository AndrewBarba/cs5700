import socket
import itertools
import re

## convenience methods ##
def get(domain, path="/", headers={}):
    r = Request(domain)
    return r.get(path,headers)

def post(domain, path="/", headers={}, data={}):
    r = Request(domain)
    return r.post(path,headers,data)


class Request:
    """
      Provides api access to HTTP get and post request
    """
    def __init__(self,domain):
        self.conn = Connection()
        self.domain = domain

    def get(self, path="/",headers={}):
        """
          creates a new connection
          constrcuts a vaid datagram
          sends the datagram
          returns a response object from the response string
        """
        self.conn.new_connection(self.domain)
        self.conn.connect()

        d = Datagram("GET", path, headers)
        self.conn.send(d.data)

        return Response(self.conn.recv())

    def post(self, path, headers, data):
        """
          same as get but adds Content headers and post data
        """
        self.conn.new_connection(self.domain)
        self.conn.connect()

        data_url= self.buildLoginPostString(data)

        headers["Content-Type"] = "application/x-www-form-urlencoded"
        headers["Content-Length"] = str(len(data_url))

        d = Datagram("POST", path, headers)
        d.add(data_url)

        self.conn.send(d.data)
        
        return Response(self.conn.recv())

    def buildLoginPostString(self, data):
        """
          used to generate a valid post request for fakebooks account login page
        """
        # order matters...
        data_url="&"
        key = "username"
        data_url+=(key + "=" + data[key]+"&")
        key = "password"
        data_url+=(key + "=" + data[key]+"&")
        key = "csrfmiddlewaretoken"
        data_url+=(key + "=" + data[key]+"&")
        key = "next"
        data_url+=(key + "=" + data[key])
        return data_url



class Response:
    """
      Wraps the raw string returned from server
      parses components for ease of access
    """
    def __init__(self, raw):
        self.code = -1
        self.version = ""
        self.raw = raw
        self.headers = {}
        self.html = ""
        self.cookies = []
        self.parse(raw)

    def parse(self,recvData):
        if len(recvData) <= 0:
            print("No recieved data for response")
            return
        lines = recvData.splitlines()

        # parse out HTTP/1.X {CODE} {MESSAGE}
        response = lines[0].split(" ",2)
        if len(response) > 1:
            try:
                self.code = int(response[1])
                self.version = response[0]
            except ValueError as e:
                print("Failed to parse, assuming 400")
                self.code = 400
                return

        # parse remaining response headers, break at html
        ctr=0
        bpoint=0
        for line in lines[1:]:
            ctr+=1
            if len(line) == 0:
                bpoint=ctr+1
                break
            else:
                q = line.split(": ", 1)
                if q[0] in self.headers:
                    tmp = self.headers[q[0]]
                    self.headers[q[0]] = [tmp, q[1]]
                else:
                    self.headers[q[0]] = q[1]

        # parse html
        for line in lines[bpoint:-1]:
            self.html += line + "\n"
        self.html += lines[-1:][0]

        # parse cookie from previously parsed headers
        if "Set-Cookie" in self.headers:
            q = self.headers["Set-Cookie"]
            if type(q) == str:
                self.cookies.append(Cookie(q))
            else:
                for i in q:
                    self.cookies.append(Cookie(i))


    def getCookiesAsString(self):
        """
          turns the Set-Cookie string into valid Cookie: request string
        """
        cookieString = ""
        csrftoken = ""
        for cookie in self.cookies:
            if len(cookie.csrftoken) > 0:
                cookieString += "csrftoken="+cookie.csrftoken
                cookieString+="; "
                csrftoken=cookie.csrftoken
            if len(cookie.sessionid) > 0:
                cookieString += "sessionid="+cookie.sessionid
        return cookieString

    def getCsrfToken(self):
        """
          returns csrftoken field from Set-Cookie: response header
        """
        for cookie in self.cookies:
            if len(cookie.csrftoken) > 0:
                return cookie.csrftoken

    def __str__(self):
        return self.raw

class Cookie:
    def __init__(self,cookieString=""):
        self.sessionid=""
        self.csrftoken=""
        self.expires=""
        self.maxage=0
        self.path=""
        self.raw_string = cookieString
        self.parse(cookieString)

    def parse(self,responseString):
        if len(responseString) > 0:
          parts = responseString.split("; ")
          for part in parts:
              q = part.split("=")
              if q[0] == "sessionid":
                  self.sessionid = q[1]
              elif q[0] == "expires":
                  self.expires = q[1]
              elif q[0] == "Max-Age":
                  self.maxage = q[1]
              elif q[0] == "Path":
                  self.path = q[1]
              elif q[0] == "csrftoken":
                  self.csrftoken = q[1]
              else:
                  print("Response string had unaccounted for fields: " + responseString)

    def __str__(self):
        return self.raw_string


class Datagram:
    def __init__(self, request_type, path, headers):
        self.request_type = request_type
        self.path = path
        self.version = "HTTP/1.1"
        self.user_agent = "Mozilla/5.0 (X11; Linux x86_64; rv:32.0) Gecko/20100101 Firefox/32.0"
        self.accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        self.lang = "en-US,en;q=0.5"
        self.encoding = "utf-8"
        self.connection = "keep-alive"
        self.cookie = ""
        self.CRLF = "\r\n"
        self.data = ""
        self.build(headers)

    def build(self,headers):
        self.add(self.request_type + " " + self.path + " " + self.version)
        self.add("Host: cs5700f14.ccs.neu.edu")
        self.add("User-Agent: " + self.user_agent)
        self.add("Accept: " + self.accept)
        self.add("Accept-Language: " + self.lang)
        self.add("Accept-Encoding: " + self.encoding)
        self.add("Connection: " + self.connection)
        for i in headers:
            self.add(i + ": " + headers[i])

        self.add(self.CRLF)

    def add(self,arg):
        self.data += arg + self.CRLF

    def __str__(self):
        return self.data


class Connection:
    def __init__(self):
        self.BUFFER_SIZE = (2**16)
    def new_connection(self,hostname):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.settimeout(5.30)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.port = 80
        self.buf = ""
        self.hostname = hostname

    def connect(self):
        try:
            self.sock.connect((self.hostname,self.port))
        except socket.gaierror as e:
            print("Recieved error when connecting to " + str((self.hostname, self.port)))
            raise e

    def close(self):
        self.sock.shutdown(1)
        self.sock.close()

    def send(self, data):
        self.sock.send(bytes(data, "UTF-8"))

    def recv(self):
        self.buf = self.sock.recv(self.BUFFER_SIZE).decode("UTF-8","replace")
        return self.buf
