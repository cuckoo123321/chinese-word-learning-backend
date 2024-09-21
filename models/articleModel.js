const db = require('../db');

const articleModel = {
    add: (article, cb)=> {
        db.query(
            `INSERT INTO articles(
            article_title, 
            article_date, 
            article_author, 
            article_journal, 
            article_abstract, 
            article_link, 
            article_publish) values (?, ?, ?, ?, ?, ?, ?)`,
            [
                article.article_title, 
                article.article_date, 
                article.article_author, 
                article.article_journal, 
                article.article_abstract, 
                article.article_link,
                article.article_publish
            ],
            (err, results)=>{
                if(err) return cb(err);
                cb(null);
            }
        )
    },

    getAll: (cb) =>{
        db.query(
        `SELECT * FROM articles ORDER BY article_date DESC`,
        (err, results) => {
            if(err) return cb (err);
            cb(null, results);
        }
        );
    },



    getCount:(cb)=>{
        db.query(`SELECT COUNT(*) AS count FROM articles`,(err, results)=>{
            if(err) return cb(err);
            const count = results[0].count;
            cb(null, count);
        })
    },
    getUpdate:(article_id, cb)=>{
        db.query(
            `SELECT * FROM articles WHERE article_id = ?`,[article_id],
            (err, results) => {
              if(err) return cb (err);
              cb(null, results[0] || {});
            }
          );
    },
    update: (article_title, 
        article_date, 
        article_author, 
        article_journal, 
        article_abstract, 
        article_link, 
        article_publish, 
        article_updated_at,
        article_id, cb) => {
        db.query('UPDATE articles SET article_title = ?, article_date = ?, article_author = ?, article_journal = ?, article_abstract = ?, article_link = ?, article_publish = ?, article_updated_at = ? WHERE article_id = ?',
            [
                article_title, 
                article_date, 
                article_author, 
                article_journal, 
                article_abstract, 
                article_link, 
                article_publish, 
                article_updated_at,
                article_id
            ],
            (err, results) => {
                if(err)return cb(err);
                cb(null);
            }
        )
    },
    
    delete:(article_id, cb) => {
        db.query('DELETE FROM articles WHERE article_id = ?', [article_id],
            (err, results) => {
                if (err) return cb(err);
                cb(null);
            }
        )
    },

    search:(keyword, cb) => {
        // 使用 SQL 查詢進行模糊搜尋
        db.query(
          'SELECT * FROM articles WHERE article_title LIKE ? OR article_author LIKE ? OR article_journal LIKE ? OR article_abstract LIKE ? ORDER BY article_date DESC',
          [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`],
          (err, results) => {
              if (err) return cb(err);
              cb(null, results);
          }
        );
      },  

     // Function to get data from the database (API)
    getArticleData: () => {
        return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM articles WHERE article_publish = 'publish' ORDER BY article_date DESC;
        `, (error, results) => {
            if (error) {
            reject(error);
            } else {
            resolve(results);
            }
        });
        });
    },

}

module.exports = articleModel;