# Crawlerjs

A super simple crawling embdder for `.md` files. Point crawlerjs where your `.md` files are, give crawlerjs a `sentence transformer` and watch it go!


Usage:
```js
import Crawler from "./crawler.js";

const crawler = new Crawler("data"); //specify a directory where you keep your .md files in this case /data/*.md
const embeddings = await crawler.crawl();
console.log(embeddings);
```
