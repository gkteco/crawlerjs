import fs from "fs";
import { join } from "path";
import { dirname } from "path";
import frontMatter from "front-matter";
import { fileURLToPath } from 'url';

class Crawler {
	dataPath: string;
	pipe: any;	

	constructor(pathSegment: string) {
		const __filename = fileURLToPath(import.meta.url);
		this.dataPath = join(dirname(__filename), "..", pathSegment);
	}
	async init() {
		const { pipeline } = await import("@xenova/transformers");
		this.pipe = await pipeline("embeddings", "Xenova/all-MiniLM-L6-v2");
	}

	async embedder(text: string) {
		const embedding = await this.pipe(text);
		return embedding;
	}
	// @param batchSize: number of words per batch (in this context, the sequence length for the model)
	// @text: the content to be batched
	// @return batch: array of strings
	private batchAndClean(text:string, batchSize: number): string[] {
		const words = text.split(" ").map((word) => word.replace(/\n/g," ")).join(" ").split(/\s+/);
		const batch: string[] = [];

		for(let i=0; i < words.length; i += batchSize) {
			batch.push(words.slice(i, i+batchSize).join(" "));
		}
		return batch;
	}
	//async crawler function that crawls the data path, reads md files, and calls an encoder to return a list of embeddings
	async crawl(): Promise<any[]> {
		await this.init();
		return new Promise((resolve, reject) => {
			fs.readdir(this.dataPath, async (err: any, files: string[]) => {
				if (err) return reject(err);
	
				const allEmbeddingsWithMetaData: any[] = [];
				
				for (let file of files) {
					try {
						const data = await fs.promises.readFile(this.dataPath + "/" + file, "utf8");
						const content = (frontMatter as any)(data);
						const articles: string[] = this.batchAndClean(content.body, 2);
						const embeddingsWithMetaData = await Promise.all(articles.map(async (article) => {
							return {
								metadata: content.attributes,
								content: await this.pipe(article)
							};
						}));
						
						allEmbeddingsWithMetaData.push(...embeddingsWithMetaData);
					} catch (e) {
						return reject(e);
					}
				}
	
				resolve(allEmbeddingsWithMetaData);
			});
		});
	}

}

export default Crawler;
