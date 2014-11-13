default:
	iptables -A OUTPUT -p tcp --tcp-flags RST RST -j DROP
	chmod +x ./rawhttpget

get:
	./rawhttpget http://david.choffnes.com/classes/cs4700fa14/project4.php
	
get2:
	./rawhttpget http://david.choffnes.com/
	
get3:
	./rawhttpget http://david.choffnes.com