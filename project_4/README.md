Andrew Barba
Will Tome

#### Summary ####

We began project 4 by completing the assignment with the normal python socket
class which was implemented in http.py. From here we created RawSocket class
in rawsocket.py that was backed by the default socket class. After migrating
http.py to use the rawsocket class, we could now work completely in 
rawsocket.py and reimplement features of the default socket class using raw
sockets. 

The journey begins with sending a single syn packet and looking for a response
from the server. In order to monitor these responses we installed wireshark
on a hosted ubuntu box and cloned our code onto the box. We could now deploy 
using git and pull from the box while being able to monitor the traffic. Once
we successfully a simple syn packet, we implented a simple ack packet. The
hardest part of the assignment was successfully sending the HTTP GET packet
with a proper checksum. This took a lot of online research as well as trial
and error. Once completed, the rest of the assignment fell into place since
it is mostly recieving data and sending simple ack packets as well as a final
fin packet to close the tcp session.
