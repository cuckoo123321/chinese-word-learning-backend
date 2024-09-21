const adminModel = require('../models/adminModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const adminController = {
    login: (req, res) =>{
        res.render('admin/login', { admin_name: req.session.admin_name });
    },

    handleLogin: (req, res, next) => {
        // 獲取從表單提交的帳號和密碼
        const { admin_name, admin_password } = req.body;
    
        // 檢驗欄位是否空白
        if (!admin_name || !admin_password) {
            req.flash('errorMessage', '欄位不可空白');
            return res.redirect('/login'); 
        }
        
    
        adminModel.get(admin_name, (err, admin) => {
            if (err) {
                req.flash('errorMessage', '系統錯誤，請稍後再試');
                console.error('Database error:', err); 
                return res.redirect('/login'); 
            }
            if (!admin) {
                req.flash('errorMessage', '使用者不存在');
                return res.redirect('/login'); 
            }
            // 檢查使用者是否被停權
            if (admin.admin_disabled === 1) {
                req.flash('errorMessage', '此帳號已被停權，無法登入');
                console.log(`Login failed: Account ${admin_name} is disabled`);
                return res.redirect('/login');
            }
    
            // 檢查雜湊密碼是否正確
            bcrypt.compare(admin_password, admin.admin_password, function(err, isSuccess) {
                if (err) {
                    req.flash('errorMessage', '系統錯誤，請稍後再試');
                    console.error('Bcrypt error:', err); 
                    return res.redirect('/login');
                }
                if (!isSuccess) {
                    req.flash('errorMessage', '帳號或密碼錯誤或被停權');
                    console.log(`Login failed: Incorrect password for user ${admin_name},${admin_password}, ${admin.admin_password}`);
                    return res.redirect('/login'); 
                }
    
                // 儲存使用者資訊和權限等級到 session
                req.session.admin_name = admin.admin_name;
                req.session.admin_full_name = admin.admin_full_name;
                req.session.admin_permission_level = admin.admin_permission_level;
                res.redirect('/');
                });
        });
    },
    
    add: (req, res) => {
        const admin_permission_level = req.session.admin_permission_level;
        res.render('admin/adminAdd', { admin_name: req.session.admin_name, admin_permission_level });
    },
    

    handleAdd: (req, res, next) => {
        if (!req.session.admin_permission_level || req.session.admin_permission_level !== 'Super') {
            req.flash('errorMessage', '您沒有權限進行此操作。');
            return res.redirect('/');
        }
        const { admin_name, admin_password, admin_full_name, admin_email, admin_permission_level, admin_disabled } = req.body;
    
        if (!admin_name || !admin_password || !admin_full_name || !admin_email || !admin_permission_level || admin_disabled === undefined) {
            req.flash('errorMessage', '缺少必要欄位');
            return res.redirect('/adminAdd');
        }
    
        // 將 admin_disabled 轉換成布林值
        const isDisabled = admin_disabled === '1' ? 1 : 0;
    
        // 先檢查 admin_name 是否已存在
        adminModel.findByName(admin_name, (err, existingAdmin) => {
            if (err) {
                req.flash('errorMessage', err.toString());
                return next();
            }
            
            if (existingAdmin) {
                req.flash('errorMessage', '帳號已存在');
                return res.redirect('/adminAdd'); 
            }
    
            // 如果 admin_name 不存在，進行密碼雜湊加密
            bcrypt.hash(admin_password, saltRounds, function (err, hash) {
                if (err) {
                    req.flash('errorMessage', '密碼雜湊錯誤');
                    console.error('Bcrypt hash error:', err);
                    return next();
                }
                
                // 寫入資料庫
                adminModel.add({
                    admin_name,
                    admin_password: hash, // 存儲已雜湊的密碼
                    admin_full_name,
                    admin_email,
                    admin_permission_level,
                    admin_disabled: isDisabled
                }, (err) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            req.flash('errorMessage', '帳號已存在');
                            return res.redirect('/adminAdd'); 
                        }
                        req.flash('errorMessage', '資料庫錯誤');
                        console.error('Database error:', err);
                        return next();
                    }
                    req.session.admin_name = admin_name;
                    res.redirect('/adminList');
                });
            });
        });
    },
    

    logout: (req, res) => {
        req.session.admin_name = null;
        res.redirect('/');
    },
    
    getAll: (req, res)=>{
        adminModel.getAll((err, results)=>{
            if(err){
                console.log(err);
            }
            res.render('admin/adminList',{
                admin: results,
                admin_full_name: req.session.admin_full_name,
                admin_permission_level: req.session.admin_permission_level
            });
        })
    },   

    delete: (req, res) => {
        const adminID = req.params.id;
        const adminPermissionLevel = req.session.admin_permission_level;
    
        if (adminPermissionLevel !== 'Super') {
            req.flash('errorMessage', '您沒有權限進行此操作');
            return res.redirect('/adminList');
        }
        
        adminModel.countSuperAdmins((err, count) => {
            if (err) {
                console.error('計算 Super 管理員數量時出錯:', err);
                req.flash('errorMessage', '系統錯誤，請稍後再試');
                return res.redirect('/adminList');
            }
    
            if (count === 1) {
                req.flash('errorMessage', '無法刪除最後一個擁有 Super 權限的管理員');
                return res.redirect('/adminList');
            }
    
            // 如果有超過一個「Super」管理員，則繼續刪除操作
            adminModel.delete(adminID, err => {
                if (err) {
                    console.error('刪除管理員時出錯:', err);
                    req.flash('errorMessage', '系統錯誤，請稍後再試');
                }
                res.redirect('/adminList');
            });
        });
    },
    
    update: (req, res) => {
        const admin_permission_level = req.session.admin_permission_level;
    
        adminModel.getUpdate(req.params.id, (err, result) => {
            if (err) {
                console.error('Error fetching admin for update:', err);
                req.flash('errorMessage', '系統錯誤，請稍後再試');
                return res.redirect('/adminList');
            }
    
            // Render the update page and pass the permission level
            res.render('admin/adminUpdate', {
                admin: result,
                admin_name: req.session.admin_name,
                admin_permission_level
            });
        });
    },
     
    handleUpdate: (req, res) => {
        if (!req.session.admin_permission_level || req.session.admin_permission_level !== 'Super') {
            req.flash('errorMessage', '您沒有權限進行此操作。');
            return res.redirect('/');
        }
    
        const { admin_name, admin_password, admin_full_name, admin_email, admin_permission_level, admin_disabled } = req.body;
    
        // 檢查欄位是否為空值
        if (!admin_name || !admin_full_name || !admin_email || !admin_permission_level || admin_disabled === undefined) {
            req.flash('errorMessage', '缺少必要欄位');
            return res.redirect(`/update_admin/${req.params.id}`);
        }
    
        // 先檢查啟用的「Super」管理員數量
        adminModel.countActiveSuperAdmins((err, count) => {
            if (err) {
                req.flash('errorMessage', '系統錯誤，請稍後再試');
                return res.redirect(`/update_admin/${req.params.id}`);
            }
    
            // 如果只剩一位啟用的「Super」管理員
            if (count === 1 && admin_disabled === '1' && req.session.admin_name === admin_name) {
                req.flash('errorMessage', '您是唯一啟用的Super管理員，無法將自己設為停權。');
                return res.redirect(`/update_admin/${req.params.id}`);
            }
    
            // 如果密碼欄位有值，則進行密碼加密
            if (admin_password) {
                bcrypt.hash(admin_password, saltRounds, (err, hash) => {
                    if (err) {
                        console.error('Bcrypt error:', err);
                        return res.redirect(`/update_admin/${req.params.id}`);
                    }
    
                    const admin_updated_at = new Date();
                    adminModel.updateWithPassword(
                        admin_name,
                        hash,
                        admin_full_name,
                        admin_email,
                        admin_permission_level,
                        admin_disabled,
                        admin_updated_at,
                        req.params.id,
                        (err) => {
                            if (err) {
                                console.error('Error:', err);
                                return res.redirect(`/update_admin/${req.params.id}`);
                            }
                            res.redirect('/adminList');
                        }
                    );
                });
            } else {
                // 如果密碼欄位留空，則不更新密碼
                const admin_updated_at = new Date();
                adminModel.updateWithoutPassword(
                    admin_name,
                    admin_full_name,
                    admin_email,
                    admin_permission_level,
                    admin_disabled,
                    admin_updated_at,
                    req.params.id,
                    (err) => {
                        if (err) {
                            console.error('Error:', err);
                            return res.redirect(`/update_admin/${req.params.id}`);
                        }
                        res.redirect('/adminList');
                    }
                );
            }
        });
    },

    search: (req, res) => {
        const keyword = req.query.keyword;
        adminModel.search(keyword, (err, results) => {
            if (err) {
                console.log('Error:', err);
                return res.status(500).send('搜尋失敗');
            }
            res.render('admin/adminList', {
                admin: results,
                admin_full_name: req.session.admin_full_name
            });
        });
    }   

};

module.exports = adminController;