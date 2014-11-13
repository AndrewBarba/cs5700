default:
	chmod +x ./rawhttpget

iptables:
	iptables -A OUTPUT -p tcp --tcp-flags RST RST -j DROP

get:
	./rawhttpget http://david.choffnes.com/classes/cs4700fa14/project4.php
	
get2:
	./rawhttpget http://david.choffnes.com/
	
get3:
	./rawhttpget http://david.choffnes.com