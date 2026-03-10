/**
 * Article Entity representing a news article data structure.
 */
class Article {
    constructor(data) {
        this.sourceName = data.source?.name || 'Unknown';
        this.author = data.author || 'Anonymous';
        this.title = data.title;
        this.description = data.description;
        this.url = data.url;
        this.urlToImage = data.urlToImage;
        this.publishedAt = data.publishedAt;
        this.content = data.content;
    }
    }
}
