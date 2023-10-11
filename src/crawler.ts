import fs from "fs";
import { join } from "path";
import { dirname } from "path";
import frontMatter from "front-matter";
import { fileURLToPath } from 'url';

class Crawler {
	dataPath: string;
	pipe: any;	
	model: string;
	pipeline: Function;
	seqLength: number;

	constructor(pathSegment: string, model: string, seqLength: number, transformerPipeline: Function) {
		const __filename = fileURLToPath(import.meta.url);
		this.dataPath = join(dirname(__filename), "..", pathSegment);
		this.model = model;
		this.pipeline = transformerPipeline;
		this.seqLength = seqLength;
	}
	async init() {
		this.pipe = await this.pipeline("embeddings", this.model); 
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
				
				for (const file of files) {
					try {
						const data = await fs.promises.readFile(this.dataPath + "/" + file, "utf8");
						const content = (frontMatter as any)(data);
						const articles: string[] = this.batchAndClean(content.body, this.seqLength);
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
