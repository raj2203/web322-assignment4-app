/*********************************************************************************
* WEB322 – Assignment 4
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Raj Patel   Student ID:159772201    Date: 03/11/2022
*
* Online (Heroku) URL: https://git.heroku.com/shrouded-fortress-34546.git
*
********************************************************************************/


var express = require("express");
const exphbs = require("express-handlebars");
var app = express();

const stripJs = require('strip-js');
var path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

var blogService = require("./blog-service.js");

var HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));


app.engine(".hbs",exphbs.engine({
    extname: ".hbs",
    helpers:{
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
           },
           equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
            return options.inverse(this);
            } else {
            return options.fn(this);
            }
           },
           safeHTML: function(context){
            return stripJs(context);
           }
        
    }
}));
app.set("view engine",".hbs");


app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
   });
   


blogService.initialize().then(() => {

    app.listen(HTTP_PORT, function () {
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch(err => {
    console.log(err);
})


cloudinary.config({
    cloud_name: 'webassign3',
    api_key: '682244112899971',
    api_secret: 'IXL7rzmSEPgk6nU55E71SexBfgM',
    secure: true
});


  
const upload = multer();

app.use(express.urlencoded({extended: true}));

app.get("/posts/add", function (req, res) {
    res.render("addPost");
});

app.post("/posts/add", upload.single("featureImage"), function (req, res) {
  


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

    res.redirect("/blog");
});
app.get("/about", function (req, res) {
    res.render("about");
});

app.get('/blog/:id', async (req, res) => {

    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogService.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogService.getPublishedPosts();
        }

     
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogService.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogService.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

    app.get('/blog', async (req, res) => {

        // Declare an object to store properties for the view
        let viewData = {};
    
        try{
    
            // declare empty array to hold "post" objects
            let posts = [];
    
            // if there's a "category" query, filter the returned posts by category
            if(req.query.category){
                // Obtain the published "posts" by category
                posts = await blogService.getPublishedPostsByCategory(req.query.category);
            }else{
                // Obtain the published "posts"
                posts = await blogService.getPublishedPosts();
            }
    
            // sort the published posts by postDate
            posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
    
            // get the latest post from the front of the list (element 0)
            let post = posts[0]; 
    
            // store the "posts" and "post" data in the viewData object (to be passed to the view)
            viewData.posts = posts;
            viewData.post = post;
    
        }catch(err){
            viewData.message = "no results";
        }
    
        try{
            // Obtain the full list of "categories"
            let categories = await blogService.getCategories();
    
            // store the "categories" data in the viewData object (to be passed to the view)
            viewData.categories = categories;
        }catch(err){
            viewData.categoriesMessage = "no results"
        }
    
        // render the "blog" view with all of the data (viewData)
        res.render("blog", {data: viewData})
    
    });
    




app.get("/categories", function (req, res) {
    blogService.getCategories().then(data => {
    res.render("categories", {categories: data});

    }).catch((err) => {
        console.log(err);
        res.render("categories",{message: "no results"});
    });
});



app.get("/posts", function (req, res) {

  

    if (req.query.category) {
        blogService.getPostsByCategory(req.query.category)
          .then((data) => {
            res.render("posts",{posts: data});
          })
          .catch((err) => {
            res.json("posts", {message: "no results"});
          })
      
      }
      else if(req.query.minDate){
        blogService.getPostsByMinDate(req.query.minDate)
        .then((data) => {
            res.render("posts",{posts: data});

        })
        .catch((err) => {
            res.json("posts", {message: "no results"});
        })
      }
      else
      {
        blogService.getAllPosts().then(data => {
            res.render("posts",{posts: data});
        }).catch((err) => {
            console.log(err);
            res.json("posts", {message: "no results"});
        });
      }
});
app.use(function (req, res) {
    res.status(404).render("404");
})