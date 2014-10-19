#Open the trace file (before you start the experiment!)
set tf [open trace.tr w]
$ns trace-all $tf






# Close the trace file (after you finish the experiment!)
close $tf