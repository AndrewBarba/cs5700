package com.gsoeller.fakebook.FakebookCrawler;

import static org.junit.Assert.*;

import java.net.URISyntaxException;
import java.util.List;

import org.junit.Before;
import org.junit.Test;

import com.google.common.collect.Lists;

public class ParserTest {

	private String html = "<html><body><h2 class='secret_flag'>FLAG: abhjdfhgjtivk384jgjfndjvnaklvnwe;vno</h2> </body></html>";
	private Parser parser;
	
	@Before
	public void setup() throws URISyntaxException {
		parser = new Parser();
	}
	
	@Test
	public void testHasFlag() {
		List<String> flags = Lists.newArrayList("abhjdfhgjtivk384jgjfndjvnaklvnwe;vno");
		assertEquals(flags, parser.getSecretFlags(html));
	}
}
