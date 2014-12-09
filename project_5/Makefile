
default:
	# CDN Project 5 - Andrew Barba and Gary Soeller

http-test:
	./httpserver -p 40080 -o ec2-54-164-51-70.compute-1.amazonaws.com

dns-test:
	./dnsserver -p 40080 -n test.com

ssh:
	ssh -i ~/.ssh/cs5700_rsa abarba@ec2-54-174-6-90.compute-1.amazonaws.com

ssh-dns:
	ssh -i ~/.ssh/cs5700_rsa abarba@cs5700cdnproject.ccs.neu.edu

deploy:
	./deployCDN -u abarba -i ~/.ssh/cs5700_rsa

run:
	./runCDN -u abarba -i ~/.ssh/cs5700_rsa -p 40080 -o ec2-54-164-51-70.compute-1.amazonaws.com -n cs5700cdn.example.com

stop:
	./stopCDN -u abarba -i ~/.ssh/cs5700_rsa