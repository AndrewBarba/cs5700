################################################################################
#
# Experiment 1
#
################################################################################

# Create a simulator object
set ns [new Simulator]

# Open the trace file (before you start the experiment!)
set tf [open ./exp_1/trace.tr w]
$ns trace-all $tf

# Define a 'finish' procedure
proc finish {} {
    global tf        
    close $tf
    exit 0
}

################################################################################
#
# Topology
#
################################################################################

# Create six nodes
set n1 [$ns node]
set n2 [$ns node]
set n3 [$ns node]
set n4 [$ns node]
set n5 [$ns node]
set n6 [$ns node]

# Connect nodes
$ns duplex-link $n1 $n2 10Mb 10ms DropTail
$ns duplex-link $n5 $n2 10Mb 10ms DropTail
$ns duplex-link $n2 $n3 10Mb 10ms DropTail
$ns duplex-link $n3 $n4 10Mb 10ms DropTail
$ns duplex-link $n3 $n6 10Mb 10ms DropTail

################################################################################
#
# Add a CBR source at N2 and a sink at N3
#
################################################################################

# Create UDP agent at node 2
set udp [new Agent/UDP]
$ns attach-agent $n2 $udp

# Attach CBR to UDP at node 2
set cbr [new Application/Traffic/CBR]
$cbr set packetSize_ 500
$cbr set interval_ 0.005
$cbr attach-agent $udp

# Add sink at node 3 
set null [new Agent/Null]
$ns attach-agent $n3 $null

# Connect send data from node 2 to node 3
$ns connect $udp $null

################################################################################
#
# Add a single TCP stream from N1 to a sink at N4
#
################################################################################

# Add TCP agent to node 1
set tcp [new Agent/TCP]
$ns attach-agent $n1 $tcp

# Add TCP sink to node 4
set sink [new Agent/TCPSink]
$ns attach-agent $n4 $sink

# Send data from node 1 to node 4
$ns connect $tcp $sink

################################################################################
#
# Simulation
#
################################################################################

# Schedule events for the CBR and FTP agents
$ns at 0.1 "$cbr start"
#$ns at 1.0 "$tcp start"
$ns at 9.0 "$tcp stop"
$ns at 9.5 "$cbr stop"

# Call the finish procedure after 5 seconds of simulation time
$ns at 10.0 "finish"

#Run the simulation
$ns run

