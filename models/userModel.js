const db = require('../db');

const userModel = {
    add: (user, cb) =>{
        db.query(
            `INSERT INTO users(user_name, user_password, user_disabled) values (?, ?, ?)`,
            [
                user.user_name,
                user.user_password,
                user.user_disabled
            ],
            (err, results)=>{
                if(err) return cb(err);
                cb(null);
            }
        )
    },

    getAll: (cb) =>{
        db.query(
          `SELECT * FROM users ORDER BY user_created_at`,
          (err, results) => {
            if(err) return cb (err);
            cb(null, results);
          }
        );
    },

    getUpdate:(user_id, cb)=>{
        db.query(
            `SELECT * FROM users WHERE user_id = ?`,[user_id],
            (err, results) => {
                if(err) return cb (err);
                cb(null, results[0] || {});
            }
        );
    },
    update: (user_name, user_password, user_disabled, user_updated_at, user_id, cb) => {
        db.query(
            `UPDATE users SET user_name = ?, user_password = ?, user_disabled = ?, user_updated_at = ? WHERE user_id = ?`,
            [ user_name, user_password, user_disabled, user_updated_at, user_id ],
            (err, results) => {
                if(err) return cb (err);
                cb(null);
            }
        )
    },
    softDelete: (user_id, cb) => {
        db.query('UPDATE users SET user_disabled = 1 WHERE user_id = ?',
            [user_id],(err, results) => {
                if (err) return cb(err);
                cb(null, results);
            }
        )
    },

    search:(keyword, cb) => {
        // 使用 SQL 查詢進行模糊搜尋
        db.query(
          'SELECT * FROM users WHERE user_name LIKE ? OR user_disabled LIKE ?',
          [`%${keyword}%`, `%${keyword}%`],
          (err, results) => {
              if (err) return cb(err);
              cb(null, results);
          }
        );
      },  

    //Function to get data from the database (API)
    getUserData: (username, cb) => {
        db.query(
            'SELECT * FROM users WHERE user_name = ?',
            [username],
            (err, results) => {
                if (err) {
                    return cb({ success: false, message: '伺服器錯誤' });
                }
                if (results.length === 0) {
                    return cb({ success: false, message: '帳號或密碼錯誤' });
                }    
                const user = results[0];
                cb(null, user);
            }
        );
    },

    getUserById: async (userId) => {
        return new Promise((resolve, reject) => {
          db.query(
            'SELECT * FROM users WHERE user_id = ?',
            [userId],
            (err, results) => {
              if (err) {
                reject({ success: false, message: '伺服器錯誤' });
              } else if (results.length === 0) {
                reject({ success: false, message: '查無使用者' });
              } else {
                const user = results[0];                
                resolve(user);
              }
            }
          );
        });
      },
    

    registerUser: (user_name, user_password) => {
        return new Promise((resolve, reject) => {          
            db.query('INSERT INTO users (user_name, user_password) VALUES (?, ?)', 
                [user_name, user_password], (err, result) => {
                if (err) {
                console.error('Database error:', err);
                return reject(err);
                }
        
                // 返回插入後的結果，你可以返回用戶的其他相關資訊
                resolve({
                user_id: result.insertId,
                user_name: user_name,
                });
            });
        });
    },

    checkUsernameExists: (user_name, cb) => {
        db.query(
          'SELECT * FROM users WHERE user_name = ?',
          [user_name],
          (err, results) => {
            if (err) {
              return cb({ success: false, message: '伺服器錯誤' });
            }
            return cb(null, results.length > 0);
          }
        );
    },

    FrontendUpdate: (user_name, user_password, user_updated_at, user_id, cb) => {
        db.query(
            `UPDATE users SET user_name = ?, user_password = ?, user_updated_at = ? WHERE user_id = ?`,
            [user_name, user_password, user_updated_at, user_id],
            (err, results) => {
                if (err) return cb(err);
                cb(null, results);
            }
        );
    },

}

module.exports = userModel;