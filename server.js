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

const express = require("express");
const exphbs = require("express-handlebars");
const multer = require("multer");
const upload = multer();
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier');
const path = require("path");
const app = express();
const blogservice = require("./blog-service.js");
const blogData = require("./blog-service");
const { rmSync } = require("fs");
const stripJs = require('strip-js');


const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    helpers: {
        navLink: function (url, options) {
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
        safeHTML: function (context) {
            return stripJs(context);
        },
        formatDate: function (dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
}));


app.set("view engine", ".hbs");


app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});



app.get("/", (req, res) => {
    res.redirect('/blog');
});



app.get("/about", (req, res) => {
    res.render(path.join(__dirname, "/views/about.hbs"));
});



app.get("/posts/add", (req, res) => {
    blogservice.getCategories()
    .then(data => res.render("addPost", {categories: data}))
    .catch(err => {
        res.render("addPost", {categories: []})
        console.log(err);
    });    
});



app.get("/categories/add", (req, res) => {
    res.render(path.join(__dirname, "/views/addCategory.hbs"));
});



app.post("/categories/add", (req, res) => {
    blogservice.addCategory(req.body).then(() => {
        res.redirect("/categories");
    })
});



app.get("/categories/delete/:id", (req, res) => {
    blogservice.deleteCategoryById(req.params.id)
    .then(() => {
        res.redirect("/categories");
    }).catch(err => {
        res.status(500).send("Unable to Remove Category / Category not found");
        console.log(err);
    });
});



app.get("/posts/delete/:id", (req, res) => {
    blogservice.deletePostById(req.params.id)
    .then(() => {
        res.redirect("/posts");
    }).catch(err => {
        res.status(500).send("Unable to Remove Post / Post not found");
        console.log(err);
    });
});



cloudinary.config({
    cloud_name: 'webassign3',
    api_key: '682244112899971',
    api_secret: 'IXL7rzmSEPgk6nU55E71SexBfgM',
    secure: true
});




app.get('/blog', async (req, res) => {

    let viewData = {};

    try {

        let posts = [];

        if (req.query.category) {
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {
            posts = await blogData.getPublishedPosts();
        }

        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        let post = posts[0];

        viewData.posts = posts;
        viewData.post = post;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await blogData.getCategories();

        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    res.render("blog", { data: viewData })

});



app.get("/posts", (req, res) => {
    let category = req.query.category;
    let minDate = req.query.minDate;

    if (category) {
        blogservice.getPostsByCategory(category).then(data => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            }
            else {
                res.render("posts", { message: "no results" });
            }
        })
    }
    else if (minDate != "" && minDate != null) {
        blogservice.getPostsByMinDate(minDate).then(data => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            }
            else {
                res.render("posts", { message: "no results" });
            }
        })
    }
    else {
        blogservice.getAllPosts().then(data => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            }
            else {
                res.render("posts", { message: "no results" });
            }
        })
    }
});



app.get("/categories", (req, res) => {
    blogservice.getCategories().then(data => {
        if (data.length > 0) {
            res.render("categories", { categories: data });
        }
        else {
            res.render("categories", { message: "no results" });
        }
    })
});



app.post('/posts/add', upload.single("featureImage"), (req, res) => {
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
        }

        upload(req).then((uploaded) => {
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }

    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;


        blogservice.addPost(req.body).then(() => {
            res.redirect("/posts");
        }).catch(err => {
            res.status(500).send(err);
        })
    }
});



app.get('/post/:value', (req, res) => {
    blogservice.getPostById(req.params.value).then((data) => {
        res.render("post", { post: data })
    }).catch(err => {
        res.render("post", { message: "no results" });
    });
});



app.get('/blog/:id', async (req, res) => {

    let viewData = {};

    try {

        let posts = [];

        if (req.query.category) {
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {
            posts = await blogData.getPublishedPosts();
        }

        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        viewData.posts = posts;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        viewData.post = await blogData.getPostById(req.params.id);
        console.log(viewData.post)
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await blogData.getCategories();

        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    res.render("blog", { data: viewData })
});



app.use((req, res) => {
    res.status(404).send("Page Not Found");
});


blogservice.initialize().then(() => {
    app.listen(HTTP_PORT, function () {
        console.log(`Express http server listening on port: ${HTTP_PORT}`);
    });
}).catch(err => {
    console.log(err);
});










