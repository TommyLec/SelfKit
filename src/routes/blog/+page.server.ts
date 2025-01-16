import type { Post } from "$lib/types/post";

export async function load({ fetch }) {
	const response = await fetch('api/posts');
	let posts: Post[] = await response.json();
	posts = posts.sort((a, b) => b.date.localeCompare(a.date));
	return { posts, pageName: "Blog", description: "All actuality of SelfKit!" };
}
