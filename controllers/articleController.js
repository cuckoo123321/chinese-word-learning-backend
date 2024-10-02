const articleModel = require('../models/articleModel');
require('dotenv').config(); 
const baseUrl = process.env.BASE_URL || '/CKIS_API'; 

const articleController = {
    add: (req, res) => {
        res.render('article/articleAdd');
    },
    handleAdd: (req, res, next) => {
        const { article_title, article_date, article_author, article_journal, article_abstract, article_link, article_publish } = req.body;

        if(!article_title || !article_date || !article_author) {
            req.flash('errorMessage', '缺少必要欄位');
            return next();
        }
        articleModel.add({
            article_title, 
            article_date, 
            article_author, 
            article_journal, 
            article_abstract, 
            article_link, 
            article_publish
        }, (err) => {
            if(err){
                req.flash('errorMessage', err.toString());
                return next();
            }
            res.redirect(`${baseUrl}/articleList`);
        });
    },

    
    getAll: (req, res)=>{
        articleModel.getAll((err, results)=>{
            if(err){
                console.log(err);
            }
            res.render('article/articleList',{
                article: results,
            });
        })
    },


    update:(req, res) => {
        articleModel.getUpdate(req.params.id, (err, results)=>{
            res.render('article/articleUpdate',{
                article: results
            })
        })
    },

    handleUpdate: (req, res)=>{
        const article_updated_at = new Date();
        articleModel.update(
            req.body.article_title, 
            req.body.article_date, 
            req.body.article_author, 
            req.body.article_journal, 
            req.body.article_abstract, 
            req.body.article_link, 
            req.body.article_publish,
            article_updated_at, 
            req.params.id,
            (err)=>{
                if (err) {
                    console.error('Error:', err);
                } else {
                    res.redirect(`${baseUrl}/articleList`);
                }
            }
        )
    },
    delete:(req, res)=>{
        const articleID = req.params.id;
        articleModel.delete(articleID, err => {
            if (err) {
                console.error('Error deleting article:', err);
            } 
            res.redirect(`${baseUrl}/articleList`);
        })
    },

    search: (req, res) => {
        const keyword = req.query.keyword;
        articleModel.search(keyword, (err, results) => {
            if (err) {
                console.log('Error:', err);
                return res.status(500).send('搜尋失敗');
            }
            res.render('article/articleList', {
                article: results,
                article_title: req.session.article_title
            });
        });
    },

    getArticleData: async (req, res) => {
        try {
            const articleData = await articleModel.getArticleData();
            res.json(articleData);
        } catch (error) {
            console.error('Error fetching article data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = articleController;