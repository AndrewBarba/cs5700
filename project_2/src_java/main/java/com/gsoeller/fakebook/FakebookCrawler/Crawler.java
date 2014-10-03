package com.gsoeller.fakebook.FakebookCrawler;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.List;

import com.gsoeller.fakebook.Data.FakebookQueue;
import com.gsoeller.fakebook.Http.HttpMethod;
import com.gsoeller.fakebook.Http.HttpRequest;
import com.gsoeller.fakebook.Http.HttpRequest.HttpRequestBuilder;
import com.gsoeller.fakebook.Http.HttpResponse;
import com.gsoeller.fakebook.Http.HttpStatus;

public class Crawler {
	
	private static final String HOST = "cs5700f14.ccs.neu.edu";
	
	public static void main(String[] args) throws UnknownHostException,
			IOException, URISyntaxException {
		Parser parser = new Parser();
		FakebookQueue queue = new FakebookQueue();
		HttpRequestBuilder initialRequest = new HttpRequest.HttpRequestBuilder(HOST)
			.setPath("/accounts/login/?next=/fakebook/");
		HttpResponse initialResponse = sendRequest(initialRequest);
		
		HttpRequestBuilder postRequest = new HttpRequest.HttpRequestBuilder(HOST)
			.setPath("/accounts/login/")
			.setMethod(HttpMethod.POST)
			.addPayloadParameter("username", "000507111")
			.addPayloadParameter("password", "1H23Y6KA")
			.addPayloadParameter("csrfmiddlewaretoken", initialResponse.getCSRF())
			.addPayloadParameter("next", "/fakebook/")
			.addHeader("Content-Type", "application/x-www-form-urlencoded")
			.addHeader("Cookie", initialResponse.getCookies());
		
		HttpResponse postResponse = sendRequest(postRequest);		
		URI nextUri = new URI(postResponse.getLocation());
		HttpRequestBuilder firstRequest = new HttpRequest.HttpRequestBuilder(HOST)
			.setPath(nextUri.getPath())
			.addHeader("Cookie", postResponse.getCookies());
		HttpResponse firstResponse = sendRequest(firstRequest);
		List<String> paths = parser.getLinks(firstResponse);
		queue.addAll(paths);
		String cookies = firstResponse.getCookies();
		while(!queue.isEmpty()) {
			String path = queue.getNextUrl().getPath();
			HttpRequestBuilder nextRequest = new HttpRequest.HttpRequestBuilder(HOST)
				.setPath(path)
				.addHeader("Cookie", cookies);
			HttpResponse nextResponse = sendRequest(nextRequest);
			List<String> morePaths = parser.getLinks(nextResponse);
			printFlags(parser.getSecretFlags(nextResponse.getContent()));
			queue.addAll(morePaths);
		}
	}
	
	private static void printFlags(List<String> flags) {
		for(String flag: flags) {
			System.out.println(flag);
		}
	}
	
	public static HttpResponse sendRequest(HttpRequestBuilder requestBuilder) throws UnknownHostException, IOException {
		HttpResponse response = requestBuilder.build().sendRequest();
		if (response.getStatus() == HttpStatus.OK ||
			response.getStatus() == HttpStatus.FORBIDDEN ||
			response.getStatus() == HttpStatus.NOT_FOUND || 
			response.getStatus() == HttpStatus.FOUND) {
			return response;
		} else if (response.getStatus() == HttpStatus.MOVED_PERMANENTLY) {
			return sendRequest(requestBuilder.setPath(response.getLocation()));
		} else if (response.getStatus() == HttpStatus.INTERNAL_SERVER_ERROR) {
			return sendRequest(requestBuilder);
		} else {
			throw new RuntimeException("Unknown status code, " + response.getStatus());
		}
	}
}
