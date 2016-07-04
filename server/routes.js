var express = require('express'),
	router = express.Router(),
	home = require('../controllers/home'),
	image = require('../controllers/image'),
	path = require('path'),
	multer = require('multer'),
	upload = multer({ dest: path.join(__dirname, 'public/upload/temp')});

module.exports = function(app) {
	router.get('/',home.index);
	router.get('/gallery/:image_id', image.index);
	router.post('/gallery/',upload.single('file'), image.create);
	router.post('/images/:image_id/like', image.like);
	router.post('/images/:image_id/comment', image.comment);
	router.delete('/images/:image_id', image.remove);
	app.use(router);
};
