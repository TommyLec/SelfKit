import type { Post } from '$lib/types/post';
import { config } from '$lib/selfkit.config.js';

export async function GET({ fetch }) {
	const response = await fetch('api/posts');
	const posts: Post[] = await response.json();

	const headers = { 'Content-Type': 'application/xml' };

	const xml = `
		<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
			<channel>
				<title>${config.appName}</title>
				<description>${config.appDescription}</description>
				<link>${config.appUrl}</link>
				<atom:link href="${config.appUrl}/rss.xml" rel="self" type="application/rss+xml"/>
				${posts
					.map(
						(post) => `
						<item>
							<title>${post.title}</title>
							<description>${post.description}</description>
							<link>${config.appUrl}/${post.slug}</link>
							<guid isPermaLink="true">${config.appUrl}/${post.slug}</guid>
							<pubDate>${new Date(post.date).toUTCString()}</pubDate>
						</item>
					`
					)
					.join('')}
			</channel>
		</rss>
	`.trim();

	return new Response(xml, { headers });
}
