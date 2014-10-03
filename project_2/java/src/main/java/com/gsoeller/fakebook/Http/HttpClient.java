package com.gsoeller.fakebook.Http;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;
import java.net.UnknownHostException;

public class HttpClient {

	private static final int PORT = 80;
	private static final String HOST = "cs5700f14.ccs.neu.edu";
	private Socket socket;

	private BufferedReader br;
	private BufferedWriter wr;
	
	public HttpClient() throws UnknownHostException, IOException {
		connect();
	}
	
	public void connect() throws UnknownHostException, IOException {
		socket = new Socket(HOST, PORT);
		wr = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), "UTF8"));
		br = new BufferedReader(new InputStreamReader(socket.getInputStream()));
	}
	
	public void disconnect() throws IOException {
		socket.close();
	}
	
	public String sendRequest(HttpRequest request) throws UnknownHostException, IOException { 
		wr.write(request.buildRequest());
		wr.write("\r\n");
		wr.flush();
		String content = "";
		String line;
		while((line = br.readLine()) != null) {
			content += line + "\n";
		}
		return content;
	}
}