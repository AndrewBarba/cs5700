package com.gsoeller.fakebook.Http;

import java.io.IOException;
import java.net.UnknownHostException;
import java.util.HashMap;

import com.google.common.collect.Maps;

public class HttpRequest {
	private final HttpMethod method;
	private final String host;
	private final String path;
	private final HashMap<String, String> headers;
	private final HashMap<String, String> payload;
	
	private static final String VERSION = "HTTP/1.0";
	private static final String USER_AGENT = "Fakebook Crawler";
	
	private final HttpClient httpClient;
	
	private HttpRequest(HttpRequestBuilder builder) throws UnknownHostException, IOException {
		this.method = builder.method;
		this.host = builder.host;
		this.headers = builder.headers;
		this.path = builder.path;
		this.payload = builder.payload;
		this.httpClient = new HttpClient();		
	}
	
	public String buildRequest() {
		String initialRequestLine = String.format("%s %s %s\r\n", method.name(), path, VERSION);
		String userAgentLine = String.format("User-Agent: %s\r\n", USER_AGENT);
		String hostLine = String.format("Host: %s\r\n", host);
		String headers = "";
		for(String header: this.headers.keySet()) {
			headers += String.format("%s: %s\r\n", header, this.headers.get(header));
		}
		String request = initialRequestLine + userAgentLine + hostLine + headers;
		
		if(method == HttpMethod.POST) {
			request += buildPayload();
		}
		return request;
	}
	
	private String buildPayload() {
		String payload = "\r\n";
		for(String parameter: this.payload.keySet()) {
			payload += parameter + "=" + this.payload.get(parameter) + "&";
		}
		payload += "\r\n";
		return payload;
	}
	
	public HttpResponse sendRequest() {
		try {
			return new HttpResponse.HttpResponseBuilder(httpClient.sendRequest(this)).build();
		} catch (UnknownHostException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		throw new RuntimeException("An error occurred while sending the request");
	}
	
	public static class HttpRequestBuilder {
		private final String host;
		
		private String path = "/";
		private HttpMethod method = HttpMethod.GET;
		private HashMap<String, String> headers = Maps.newHashMap();
		private HashMap<String, String> payload = Maps.newHashMap();
		private int contentLength = 0;
		
		public HttpRequestBuilder(String host) {
			this.host = host;
		}
		
		public HttpRequestBuilder setPath(String path) {
			this.path = path;
			return this;
		}
		
		public HttpRequestBuilder addHeader(String headerName, String headerValue) {
			this.headers.put(headerName, headerValue);
			return this;
		}
		
		public HttpRequestBuilder addPayloadParameter(String parameterName, String parameterValue) {
			this.payload.put(parameterName, parameterValue);
			String newPayload = parameterName + "=" + parameterValue + "&";
			this.contentLength += newPayload.getBytes().length;
			return this.addHeader("Content-Length", String.valueOf(contentLength));
		}
		
		public HttpRequestBuilder setMethod(HttpMethod method) {
			this.method = method;
			return this;
		}
				
		public HttpRequest build() throws UnknownHostException, IOException {
			return new HttpRequest(this);
		}
	}
}