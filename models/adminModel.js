const db = require('../db');

const adminModel = {
    get: (admin_name, cb) => {
        // 在資料庫中查找帳號
        db.query(
          `SELECT * FROM admins WHERE admin_name = ?`, [admin_name], 
          (err, results) => {
            if (err) {
              console.error('Database error:', err);
              return cb(err);
            }
            if (results.length === 0) {
              return cb(null, null);
            }
            const admin = results[0];
            cb(null, admin);
          }
        )          
    },

    add: (admin, cb) =>{
    db.query(
    `INSERT INTO admins(admin_name, admin_password, admin_full_name, admin_email, admin_permission_level, admin_disabled) values(?, ?, ?, ?, ?, ?)`, 
      [
        admin.admin_name,
        admin.admin_password, 
        admin.admin_full_name, 
        admin.admin_email,         
        admin.admin_permission_level, 
        admin.admin_disabled
      ],
      (err, results)=>{
        if(err) return cb(err);
        cb(null);
      }
    )
  },

  findByName: (admin_name, cb) => {
    const query = 'SELECT * FROM admins WHERE admin_name = ?';
    db.query(query, [admin_name], (err, results) => {
        if (err) {
            return cb(err);
        }
        cb(null, results.length > 0 ? results[0] : null);
    });
  },

  getAll: (cb) =>{
    db.query(
      `SELECT * FROM admins ORDER BY admin_created_at`,
      (err, results) => {
        if(err) return cb (err);
        cb(null, results);
      }
    );
  },

  delete: (admin_id, cb) => {
    db.query('DELETE FROM admins WHERE admin_id = ?', [admin_id], (err, results) => {
      if (err) return cb(err);
      cb(null);
    });
  },

  countSuperAdmins: (cb) => {
    db.query('SELECT COUNT(*) AS count FROM admins WHERE admin_permission_level = "Super"', (err, results) => {
        if (err) return cb(err);
        const count = results[0].count;
        cb(null, count);
    });
},


  getUpdate:(admin_id, cb)=>{
    db.query(
      `SELECT * FROM admins WHERE admin_id = ?`,[admin_id],
      (err, results) => {
        if(err) return cb (err);
        cb(null, results[0] || {});
      }
    );
  },
// 如果提供新密碼時的更新
updateWithPassword: (admin_name, hash, admin_full_name, admin_email, admin_permission_level, admin_disabled, admin_updated_at, id, cb) => {
  const query = `
      UPDATE admins 
      SET 
          admin_name = ?, 
          admin_password = ?, 
          admin_full_name = ?, 
          admin_email = ?, 
          admin_permission_level = ?, 
          admin_disabled = ?, 
          admin_updated_at = ? 
      WHERE admin_id = ?
  `;
  const params = [admin_name, hash, admin_full_name, admin_email, admin_permission_level, admin_disabled, admin_updated_at, id];

  db.query(query, params, (err, results) => {
      if (err) return cb(err);
      cb(null, results);
  });
},

// 如果未提供新密碼時的更新
updateWithoutPassword: (admin_name, admin_full_name, admin_email, admin_permission_level, admin_disabled, admin_updated_at, id, cb) => {
  const query = `
      UPDATE admins 
      SET 
          admin_name = ?, 
          admin_full_name = ?, 
          admin_email = ?, 
          admin_permission_level = ?, 
          admin_disabled = ?, 
          admin_updated_at = ? 
      WHERE admin_id = ?
  `;
  const params = [admin_name, admin_full_name, admin_email, admin_permission_level, admin_disabled, admin_updated_at, id];

  db.query(query, params, (err, results) => {
      if (err) return cb(err);
      cb(null, results);
  });
},
countActiveSuperAdmins: (cb) => {
  db.query('SELECT COUNT(*) AS count FROM admins WHERE admin_permission_level = "Super" AND admin_disabled = 0', (err, results) => {
      if (err) return cb(err);
      const count = results[0].count;
      cb(null, count);
  });
},

 
  search:(keyword, cb) => {
    // 使用 SQL 查詢進行模糊搜尋
    db.query(
      'SELECT * FROM admins WHERE admin_name LIKE ? OR admin_full_name LIKE ? OR admin_email LIKE ? OR admin_permission_level LIKE ? OR admin_created_at LIKE ? OR admin_updated_at LIKE ?',
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`],
      (err, results) => {
          if (err) return cb(err);
          cb(null, results);
      }
    );
  },  

}

module.exports = adminModel;