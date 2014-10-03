package com.gsoeller.fakebook.FakebookCrawler;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.google.common.collect.Lists;
import com.gsoeller.fakebook.Http.HttpResponse;

public class Parser {

	public List<String> getLinks(HttpResponse response) throws URISyntaxException {
		Document doc = Jsoup.parse(response.getContent());
		doc.setBaseUri("http://cs5700f14.ccs.neu.edu");
		Elements elements = doc.select("a[href]");
		List<String> links = Lists.newArrayList();
		for(Element link: Lists.newArrayList(elements.iterator())) {
			URI linkURI = new URI(link.attr("abs:href"));
			if(!linkURI.toString().contains("mailto") &&
			   linkURI.getHost().equals("cs5700f14.ccs.neu.edu")) {
				links.add(linkURI.getPath());
			}
		}
		return links;
	}
	
	public List<String> getSecretFlags(String content) {
		Document doc = Jsoup.parse(content);
		Elements elements = doc.select("h2.secret_flag");
		List<String> flags = Lists.newArrayList();
		for(Element element: elements) {
			flags.add(element.ownText().split(": ")[1]);
		}
		return flags;
	}
}
