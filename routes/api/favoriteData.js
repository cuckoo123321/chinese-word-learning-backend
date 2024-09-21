const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/favoriteController');

// POST 請求處理添加到收藏清單的路由
router.post('/favoriteAdd', favoriteController.addToFavorites);
router.get('/favoriteList/:user_id?', favoriteController.getFavorite);
// DELETE 請求處理移除收藏清單的路由
router.delete('/favoriteRemove/:favorite_id', favoriteController.removeFromFavorites);
// GET 請求處理獲取某一使用者的某一收藏產品
router.get('/isFavorite/:user_id/:product_id', favoriteController.checkIfFavorite);


module.exports = router;