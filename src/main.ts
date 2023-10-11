import Crawler from "./crawler.js";


const crawler = new Crawler("data");
const embeddings = await crawler.crawl();
console.log(embeddings);
