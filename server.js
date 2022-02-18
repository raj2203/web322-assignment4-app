/*********************************************************************************
* WEB322 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Prince Jodhani   Student ID: 149455206   Date: 04/02/2022
*
* Online (Heroku) URL: https://web322-assignment2-prince.herokuapp.com/
*
********************************************************************************/


var express = require("express");
var app = express();

var path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

var blogService = require("./blog-service.js");

var HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));


blogService.initialize().then(() => {

    app.listen(HTTP_PORT, function () {
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch(err => {
    console.log(err);
})


cloudinary.config({
    cloud_name: 'web322-api-prince',
    api_key: '676992143767744',
    api_secret: 'WN2d8B5XeOiSH_pgTOdH-K3rJDs',
    secure: true
});


  
const upload = multer();

app.use(express.urlencoded({extended: true}));

app.get("/posts/add", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

app.post("/posts/add", upload.single("featureImage"), function (req, res) {
  

    //res.send(`<img src="/photos/${req.file.filename}"></img>`);

    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        };
        upload(req).then((uploaded) => {
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }
    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;
        req.body.published = (req.body.published) ? true : false;

        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
          //res.json({file: req.file.path, body: req.body});

          blogService.addPost(req.body).then(()=>{
                res.redirect("/posts")
          });
    };
       
});

app.get("/post/:value", function (req, res) {
    blogService.getPostById(req.params.value)
    .then((data) => {

      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    })
  });


app.get("/", function (req, res) {

    res.redirect("/about");
});
app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", function (req, res) {
    blogService.getPublishedPosts().then(data => {
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.json(err);
    });
});
app.get("/posts", function (req, res) {

  

    if (req.query.category) {
        blogService.getPostsByCategory(req.query.category)
          .then((data) => {
            res.json(data);
          })
          .catch((err) => {
            res.json(err);
          })
      
      }
      else if(req.query.minDate){
        blogService.getPostsByMinDate(req.query.minDate)
        .then((data) => {
          res.json(data);
        })
        .catch((err) => {
          res.json(err);
        })
      }
      else
      {
        blogService.getAllPosts().then(data => {
            res.json(data);
        }).catch((err) => {
            console.log(err);
            res.json(err);
        });
      }
});
app.get("/categories", function (req, res) {
    blogService.getCategories().then(data => {
        res.json(data);

    }).catch((err) => {
        console.log(err);
        res.json(err);
    });
});

app.use(function (req, res) {
    res.status(404).sendFile(path.join(__dirname, "/views/error404.html"));
})




