package com.gsoeller.fakebook.Http;

public enum HttpStatus {
	OK(200),
	MOVED_PERMANENTLY(301),
	FOUND(302),
	FORBIDDEN(403),
	NOT_FOUND(404),
	INTERNAL_SERVER_ERROR(500);
	
	private int status;
	
	private HttpStatus(int status) {
		this.status = status;
	}
	
	public int getStatus() {
		return status;
	}
}
