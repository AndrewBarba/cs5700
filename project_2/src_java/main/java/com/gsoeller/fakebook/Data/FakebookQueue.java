package com.gsoeller.fakebook.Data;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Set;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public class FakebookQueue {
	
	private List<URI> queue = Lists.newArrayList();
	private Set<URI> visited = Sets.newHashSet();
	
	public void addAll(List<String> paths) throws URISyntaxException {
		for(String path: paths) {
			URI nextDomain = new URI("http://cs5700f14.ccs.neu.edu" + path);
			addUrl(nextDomain);
		}
	}
	
	public void addUrl(URI url){
		if(!visited.contains(url) && !queue.contains(url)) {
			queue.add(url);
		}
	}
	
	public boolean hasVisted(URI domain) {
		return visited.contains(domain);
	}
	
	public URI getNextUrl(){
		if (queue.isEmpty()) {
			throw new RuntimeException("FakebookQueue is empty. Unable to get next url.");
		}
		URI nextDomain = queue.remove(0);
		visited.add(nextDomain);
		return nextDomain;
	}
	
	public boolean isEmpty() {
		return queue.isEmpty();
	}
	
	public int size() {
		return queue.size();
	}
	
	public int visited() {
		return visited.size();
	}
}
