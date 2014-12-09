import sys

"""
Parses a wiki dump and creates a JSON 
key-value map of paths to frequency
"""

print '{'
for line in open(sys.argv[-1]):
	parts = line.split(" ")
	if parts[0] == "en":
		count = int(parts[-1])
		if count >= (10 * 1000 * 1000):
			print '"%s": %d,' % (parts[1], count)
print '}'