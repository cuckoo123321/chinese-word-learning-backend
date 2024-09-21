const db = require('../db');
const path = require('path');


const productModel = {
    add: (product, cb) => {
        db.query(
            `INSERT INTO products(product_number, product_rank, product_title, product_translation,product_category, product_author, product_publisher, product_date, product_description, product_description_foreign, product_path, product_link, product_publish) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                product.product_number,
                product.product_rank, 
                product.product_title, 
                product.product_translation,
                product.product_category, 
                product.product_author, 
                product.product_publisher, 
                product.product_date,
                product.product_description, 
                product.product_description_foreign,
                product.filename, // 使用 filename 替代 product_path 
                product.product_link,
                product.product_publish
            ],
            (err, results) => {
                if (err) return cb(err);
                cb(null, results);
            }
        );
    },

    getAll:(cb) => {
        db.query(
            `SELECT * FROM products ORDER BY product_rank ASC`,
            (err, results) => {
                if(err) return cb(err);
                cb(null, results);
            }
        );
    },

    delete: (product_id, cb) => {
        db.query('DELETE FROM products WHERE product_id = ?', [product_id], (err, results) => {
          if (err) return cb(err);
          cb(null);
        });
    },
    getFilePath: (product_id, cb) => {
        db.query('SELECT product_path FROM products WHERE product_id = ?', [product_id], (err, results) => {
          if (err) {
            return cb(err);
          }
      
          if (results.length === 0) {
            return cb(new Error('product not found'));
          }
      
          const filePath = results[0].product_path;
          
          // 使用 path.join 來組成完整路徑，要找到 backend/uploads
          const absolutePath = path.join(__dirname, '..','uploads', filePath);
          // console.log('Absolute path:', absolutePath);
          cb(null, absolutePath);
        });
      },

    getUpdate:(product_id, cb)=>{
        db.query(
            `SELECT * FROM products WHERE product_id = ?`,[product_id],
            (err, results) => {
            if(err) return cb (err);
            cb(null, results[0] || {});
            }
        );
    },


    update: (product_number, product_rank,  product_title, product_translation,product_category, product_author,product_publisher, product_date, product_description,  product_description_foreign, newImageFilename, product_link, product_publish, product_updated_at, product_id, cb) => {
        const query = 'UPDATE products SET product_number = ?,product_rank=?, product_title = ?, product_translation = ?, product_category = ?, product_author = ?,product_publisher = ?, product_date = ?, product_description = ?, product_description_foreign = ?, product_path = ?, product_link = ?, product_publish = ?, product_updated_at = ? WHERE product_id = ?';

        db.query(query,
            [
                product_number, 
                product_rank,
                product_title, 
                product_translation,
                product_category, 
                product_author,
                product_publisher, 
                product_date, 
                product_description,
                product_description_foreign,
                newImageFilename, // 將新圖片的檔名作為參數傳入
                product_link,
                product_publish, 
                product_updated_at,
                product_id
            ],
            (err, results) => {
                if (err) return cb(err);
                cb(null);
            }
        );
    },

    search:(keyword, cb) => {
        // 使用 SQL 查詢進行模糊搜尋
        db.query(
          'SELECT * FROM products WHERE product_number LIKE ? OR product_title LIKE ? OR product_category LIKE ? OR product_author LIKE ? OR product_publisher LIKE ? ',
          [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`],
          (err, results) => {
              if (err) return cb(err);
              cb(null, results);
          }
        );
      },

    // Function to get data from the database (API)
    getProductData: () => {
        return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM products WHERE product_publish = 'publish' ORDER BY product_rank ASC `, (error, results) => {
            if (error) {
            reject(error);
            } else {
            resolve(results);
            }
        });
        });
    },

    getProductById: (product_id, cb) => {
        db.query('SELECT * FROM products WHERE product_id = ?', [product_id], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return cb(err);
            }
            // 檢查是否找到商品
            if (results.length === 0) {
                const notFoundError = new Error('Product not found');
                return cb(notFoundError);
            }        
            cb(null, results[0]);// 找到商品，回傳結果
        });
    },



}

module.exports = productModel;