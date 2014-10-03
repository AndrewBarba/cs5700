package com.gsoeller.fakebook.FakebookCrawler;

import static org.junit.Assert.*;

import java.net.URI;
import java.net.URISyntaxException;

import org.junit.Before;
import org.junit.Test;

import com.gsoeller.fakebook.Data.FakebookQueue;

public class FakebookQueueTest {

	private URI domain1;
	private URI domain2;
	private FakebookQueue queue;

	@Before
	public void setup() throws URISyntaxException {
		queue = new FakebookQueue();
		domain1 = new URI("gsoeller.com");
		domain2 = new URI("fakebook.com");
	}

	@Test
	public void testAddDomain() {
		queue.addUrl(domain1);
		assertEquals(domain1, queue.getNextUrl());
		assertTrue(queue.hasVisted(domain1));

	}

	@Test
	public void testAddTwoDomains() {
		queue.addUrl(domain1);
		queue.addUrl(domain2);
		assertEquals(domain1, queue.getNextUrl());
		assertTrue(queue.hasVisted(domain1));
		assertFalse(queue.hasVisted(domain2));
		assertEquals(domain2, queue.getNextUrl());
		assertTrue(queue.hasVisted(domain2));
	}
}
