package com.gsoeller.fakebook.Http;

import java.util.List;

import com.google.common.collect.Lists;

public class HttpResponse {

	private final String content;
	private final List<String> headers;
	private final HttpStatus status;

	private HttpResponse(HttpResponseBuilder builder) {
		this.content = builder.content;
		this.headers = builder.headers;
		this.status = builder.status;
	}
	
	public HttpStatus getStatus() {
		return status;
	}
	
	public String getContent() {
		return content;
	}
	
	public String getLocation() {
		for(String header: headers) {
			String[] splitHeader = header.split(": ");
			if(splitHeader[0].equals("Location")) {
				return splitHeader[1];
			}
		}
		throw new RuntimeException("Cannot find a location header");
	}
	
	public String getCSRF() {
		String cookies = getCookies();
		List<String> splitCookies = Lists.newArrayList(cookies.split(";"));
		for(String cookie: splitCookies) {
			String[] splitCookie = cookie.split("=");
			if(splitCookie[0].equals("csrftoken")) {
				return splitCookie[1];
			}
		}
		throw new RuntimeException("There is no CSRF token in the headers.");
	}
	
	public String getCookies() {
		String cookieHeader = "";
		for(String header: headers) {
			String[] splitHeader = header.split(": ");
			if(splitHeader[0].equals("Set-Cookie")) {
				cookieHeader += splitHeader[1].split(";")[0] +";";
			}
		}
		return cookieHeader;
	}
	
	public static class HttpResponseBuilder {
		private final String content;
		private final List<String> headers;
		private final HttpStatus status;

		public HttpResponseBuilder(String content) {
			List<String> lines = Lists.newArrayList(content.split("\n"));
			List<String> tempHeaders = Lists.newArrayList();
			String tempContent = "";
			boolean readingContent = false;
			for (String line : lines) {
				if (readingContent) {
					tempContent += line;
				} else if (line.equals("")) {
					readingContent = true;
				} else {
					tempHeaders.add(line);
				}
			}
			this.content = tempContent;
			this.headers = tempHeaders;
			this.status = parseStatusCode(tempHeaders);
		}
		
		private HttpStatus parseStatusCode(List<String> headers) {
			int status = Integer.valueOf(headers.get(0).split(" ")[1]);
			if(status == 200) {
				return HttpStatus.OK;
			} else if(status == 301) {
				return HttpStatus.MOVED_PERMANENTLY;
			} else if(status == 302) {
				return HttpStatus.FOUND;
			} else if(status == 403) {
				return HttpStatus.FORBIDDEN;
			} else if(status == 404) {
				return HttpStatus.NOT_FOUND;
			} else if(status == 500) {
				return HttpStatus.INTERNAL_SERVER_ERROR;
			} else {
				throw new RuntimeException("Parsed an unknown status code, " + String.valueOf(status));
			}
		}

		public HttpResponse build() {
			return new HttpResponse(this);
		}
	}
}
