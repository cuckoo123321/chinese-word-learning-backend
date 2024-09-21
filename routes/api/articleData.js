const express = require('express');
const router = express.Router();
const articleController = require('../../controllers/articleController');


router.get('/article', articleController.getArticleData);

module.exports = router;