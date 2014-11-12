// REAL
{
  "link_type": "LINKTYPE_ETHERNET",
  "link": {
    "dhost": "00:00:5e:00:01:67",
    "shost": "04:01:2e:83:c5:01",
    "ethertype": 2048,
    "ip": {
      "version": 4,
      "header_length": 5,
      "header_bytes": 20,
      "diffserv": 0,
      "total_length": 60,
      "identification": 60700,
      "flags": {
        "reserved": 0,
        "df": 1,
        "mf": 0
      },
      "fragment_offset": 0,
      "ttl": 64,
      "protocol": 6,
      "header_checksum": 59910,
      "saddr": "104.236.53.85",
      "daddr": "216.97.236.245",
      "protocol_name": "TCP",
      "tcp": {
        "sport": 58598,
        "dport": 80,
        "seqno": 3968417575,
        "ackno": 0,
        "data_offset": 74,
        "header_bytes": 40,
        "reserved": 0,
        "flags": {
          "cwr": 0,
          "ece": 0,
          "urg": 0,
          "ack": 0,
          "psh": 0,
          "rst": 0,
          "syn": 1,
          "fin": 0
        },
        "window_size": 29200,
        "checksum": 25543,
        "urgent_pointer": 0,
        "options": {
          "mss": 1460,
          "sack_ok": true,
          "timestamp": 213701179,
          "echo": 0,
          "window_scale": 256
        },
        "data_end": 74,
        "data_bytes": 0
      }
    }
  },
  "pcap_header": {
    "tv_sec": 1415821870,
    "tv_usec": 794876,
    "caplen": 74,
    "len": 74,
    "link_type": "LINKTYPE_ETHERNET",
    "time_ms": 1415821870794.876
  }
}