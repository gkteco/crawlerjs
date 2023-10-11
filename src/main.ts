import Crawler from "./crawler.js";
const { pipeline } = await import("@xenova/transformers");

const crawler = new Crawler(
    "data", 
    "Xenova/all-MiniLM-L6-v2", 
    2, 
    pipeline);
const embeddings = await crawler.crawl();
console.log(embeddings)
