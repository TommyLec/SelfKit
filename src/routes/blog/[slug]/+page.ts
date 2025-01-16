import { error } from '@sveltejs/kit';

export async function load({ params }) {
	try {
		const post = await import(`../../../posts/${params.slug}.md`);

		return {
			content: post.default,
			meta: post.metadata,
			pageName: post.metadata.title,
			description: post.metadata.description,
			imgUrl: post.metadata.image,
            imgAlt: post.metadata.title,
			keywords: post.metadata.keywords
		}
	} catch (e) {
        console.error(e);
		error(404, `Could not find ${params.slug}`);
	}
}
