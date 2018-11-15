import Article from '../model/ArticleModel'

class ArticleConteoller {
    async getArticles (ctx) {
        ctx.body = await Article.getAllArticles()
    }
    async addArticle (ctx) {
        ctx.body = await Article.addArticle()
    }
    async getOneArticle (ctx) {
        ctx.body =  await Article.getOneArticle(ctx.params.id);
    }
}
export default new ArticleConteoller()