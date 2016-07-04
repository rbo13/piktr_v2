var fs = require('fs'),
    path = require('path'),
    sidebar = require('../helpers/sidebar'),
    url = require('../helpers/url'),
    Models = require('../models'),
    md5 = require('MD5');



module.exports = {
    index: function(req, res) {
        var viewModel = {
            image: {},
            comments: []
        };
        // find the image by searching the filename matching the url parameter:
        Models.Image.findOne({ filename: { $regex: req.params.image_id}}, function(err, image) {
            if(err) { throw err; }
            if(image) {
                // if the image was found, increment its views counter
                image.views = image.views + 1;
                // save the image object to the viewModel:
                viewModel.image = image;
                // save the model (since it has been updated):
                image.save();
                // find any comments with the same image_id as the image:
                Models.Comment.find({ image_id: image._id}, {}, { sort: {'timestamp': 1 }}, function(err, comments) {
                    if(err) { throw err; }
                    // save the comments collection to the viewModel:
                    viewModel.comments = comments;
                    // build the sidebar sending along the viewModel:
                    sidebar(viewModel, function(viewModel) {
                        // render the page view with its viewModel:
                        res.render('image', viewModel);
                    });
                });
            } else {
                // if no image was found, simply go back to the homepage:
                res.redirect('/');
            }
        });
    },
    create: function(req, res) {
        // res.send('The image:create POST controller');
        var saveImage = function() {

            /**
             * This block of code handles the randomizing of url
             * from: /helpers/url.js
             */
            var firstAdjective = url.capitalizeFirstLetter(url.firstAdjective[Math.floor(Math.random() * url.firstAdjective.length)]);
            var secondAdjective = url.capitalizeFirstLetter(url.secondAdjective[Math.floor(Math.random() * url.firstAdjective.length)]);
            var animal = url.capitalizeFirstLetter(url.animals[Math.floor(Math.random() * url.firstAdjective.length)]);

            /**
             * @description: final URL link:
             * {URL}/gallery/UpbeatSquareBrontosaurus
             */

            var imgUrl = ((firstAdjective+secondAdjective+animal).replace(/ /g, ''));

            //search for an image with the same filename by performing a find:
            Models.Image.find({filename: imgUrl}, function(err, image) {
                // if a matching image was found, try again (start over):
                if(image.length > 0) {
                    saveImage();
                } else {

                    // var tempPath = req.files.file.path,
                    var tempPath = req.file.path,
                        // ext = path.extname(req.files.file.name).toLowerCase(),
                        ext = path.extname(req.file.originalname).toLowerCase(),
                        targetPath = path.resolve('./public/upload/' + imgUrl + ext);

                    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                        fs.rename(tempPath, targetPath, function(err) {
                            if (err) throw err;
                            // create a new Image model, populate its details:
                            var newImg = new Models.Image({
                                title: req.body.title,
                                description: req.body.description,
                                filename: imgUrl + ext
                            });
                            // and save the new Image
                            newImg.save(function(err, image) {
                                console.log('Successfully inserted Image: ' + image.filename);
                                res.redirect('/gallery/'+ image.uniqueId);
                            });

                        });
                    } else {
                        fs.unlink(tempPath, function () {
                            if (err) throw err;

                            res.json(500, {error: 'Only image files are allowed.'});
                        });
                    }
                }
            });
        };
        saveImage();
    },
    like: function(req, res) {
        Models.Image.findOne({ filename: { $regex: req.params.image_id }}, function(err, image) {
            if(!err && image) {
                image.likes = image.likes + 1;
                image.save(function(err) {
                    if(err) {
                        res.json(err);
                    } else {
                        res.json({likes: image.likes });
                    }
                });
            }
        });
    },
    comment: function(req, res) {
        Models.Image.findOne({filename: { $regex: req.params.image_id}}, function(err, image) {
            if(!err && image) {
                var newComment = new Models.Comment(req.body);
                newComment.gravatar = md5(newComment.email);
                newComment.image_id = image._id;
                newComment.save(function(err, comment) {
                    if(err) { throw err; }

                    res.redirect('/images/' + image.uniqueId + '#' + comment._id);
                });
            } else {
                res.redirect('/');
            }
        });
    },
    remove: function(req, res) {
        Models.Image.findOne({ filename: { $regex: req.params.image_id }}, function(err, image) {
            if(err) {
               throw err;
            }
            fs.unlink(path.resolve('./public/upload/' + image.filename), function(err) {
                if(err) { throw err; }

                Models.Comment.remove({ image_id: image._id}, function(err) {
                    image.remove(function(err) {
                       if(!err) {
                            res.json(true);
                        } else {
                            res.json(false);
                        }
                    });
                });
            });
        });
    }
};
