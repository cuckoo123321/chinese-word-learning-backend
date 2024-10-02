const express = require('express');
const db = require('./db');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5001;
const adminController = require('./controllers/adminController');
const userController = require('./controllers/userController');
const articleController = require('./controllers/articleController');
const carouselController = require('./controllers/carouselController');
const favoriteController = require('./controllers/favoriteController');
const productController = require('./controllers/productController')
const path = require('path');
const cors = require('cors'); //同源政策
const apiRoutes = require('./routes/apiRoutes'); //API路由

// 設定 /CKIS_API 作為基礎路徑
const baseUrl = process.env.BASE_URL || '/CKIS_API';


//設置視圖引擎
app.set('view engine', 'ejs');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//確保 app.use(cors()) 的設定位於 app.use(apiRoutes) 之前
app.use(cors());
app.use(apiRoutes);

// 將 baseUrl 傳遞給 EJS 模板
app.use((req, res, next) => {
  res.locals.baseUrl = baseUrl;  
  next();
});


//配置中間件
app.use(flash());

app.use((req, res, next) => {
  res.locals.admin_name = req.session.admin_name;
  res.locals.errorMessage = req.flash('errorMessage');
  res.locals.totalPages = 0;
  next();
});

// 設定靜態資源路徑
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


function redirectBack(req, res){  
  res.redirect('back');
}

//設置路由處理
app.get(`${baseUrl}/`,(req, res) => {
  const admin_full_name = req.session.admin_full_name; // 從 session 中獲取變數
  res.render('index',{ admin_full_name });// 傳遞變數到模板
});



//admin
app.get(`${baseUrl}/login`, adminController.login);
app.post(`${baseUrl}/login`, adminController.handleLogin, redirectBack);
app.get(`${baseUrl}/logout`, adminController.logout);
app.get(`${baseUrl}/adminAdd`, adminController.add);
app.post(`${baseUrl}/adminAdd`, adminController.handleAdd, redirectBack);
app.get(`${baseUrl}/adminList`, adminController.getAll);
app.get(`${baseUrl}/delete_admin/:id`, adminController.delete);
app.get(`${baseUrl}/update_admin/:id`, adminController.update);
app.post(`${baseUrl}/update_admin/:id`, adminController.handleUpdate);
app.get(`${baseUrl}/search`, adminController.search);

//user
app.get(`${baseUrl}/userAdd`, userController.add);
app.post(`${baseUrl}/userAdd`, userController.handleAdd, redirectBack);
app.get(`${baseUrl}/userList`, userController.getAll);
app.get(`${baseUrl}/update_user/:id`, userController.update);
app.post(`${baseUrl}/update_user/:id`, userController.handleUpdate);
app.get(`${baseUrl}/delete_user/:id`, userController.softDelete);
app.get(`${baseUrl}/userSearch`, userController.search);
//user前端用 API
app.post('/userLogin', userController.userLogin);
app.get('/user', userController.getUserInfo);
app.post('/userRegister', userController.userRegister);
app.put('/userUpdate/:id', userController.FrontendHandleUpdate);

//article
app.get(`${baseUrl}/articleAdd`, articleController.add);
app.post(`${baseUrl}/articleAdd`, articleController.handleAdd, redirectBack);
app.get(`${baseUrl}/articleList`, articleController.getAll);
app.get(`${baseUrl}/update_article/:id`, articleController.update);
app.post(`${baseUrl}/update_article/:id`, articleController.handleUpdate);
app.get(`${baseUrl}/delete_article/:id`, articleController.delete);
app.get(`${baseUrl}/articleSearch`, articleController.search);
//article 前端用API
app.get('/article', articleController.getArticleData);

//carousel
app.get(`${baseUrl}/carouselAdd`, carouselController.add);
app.post(`${baseUrl}/carouselAdd`, carouselController.handleAdd, redirectBack);
app.get(`${baseUrl}/carouselList`, carouselController.getAll);
app.get(`${baseUrl}/update_carousel/:id`, carouselController.update);
app.post(`${baseUrl}/update_carousel/:id`, carouselController.handleUpdate);
app.get(`${baseUrl}/delete_carousel/:id`, carouselController.delete);
app.get(`${baseUrl}/carouselSearch`, carouselController.search);
//carousel前端API
app.get('/carousel', carouselController.getCarouselData);



//product
app.get(`${baseUrl}/productAdd`, productController.add);
app.post(`${baseUrl}/productAdd`, productController.handleAdd, redirectBack);
app.get(`${baseUrl}/productList`, productController.getAll);
app.get(`${baseUrl}/update_product/:id`, productController.update);
app.post(`${baseUrl}/update_product/:id`, productController.handleUpdate);
app.get(`${baseUrl}/delete_product/:id`, productController.delete);
app.get(`${baseUrl}/productSearch`, productController.search);
//product前端用API
app.get('/:id', productController.getProductById);
app.put('/update_productStock', productController.updateProductStock)


//favorite
app.post('/favoriteAdd', favoriteController.addToFavorites);
app.get('/favoriteList/:user_id?', favoriteController.getFavorite);
app.delete('/favoriteRemove/:favorite_id', favoriteController.removeFromFavorites);
app.get('/isFavorite/:user_id/:product_id', favoriteController.checkIfFavorite);


//啟動伺服器
app.listen(port, () => {
  db.connect();
  console.log(`app_project listening on port ${port}`);
});