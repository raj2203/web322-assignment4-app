var express = require("express");
var app = express();

var path = require("path");
var blogService = require("./blog-service.js");

var HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));


blogService.initialize().then(()=>{

    app.listen(HTTP_PORT, function(){
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch(err=>{
    console.log(err);
})



app.get("/", function(req,res){
   
   res.redirect("/about");
});
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname, "/views/about.html"));
});


app.get("/blog", function(req,res){
    blogService.getPublishedPosts().then(data=>{
        res.json(data);
    });
});
app.get("/posts", function(req,res){
    
        blogService.getAllPosts().then(data=>{
            res.json(data);
        });
});
app.get("/categories", function(req,res){
    blogService.getCategories().then(data=>{
        res.json(data);
    });
});

app.use(function (req, res) {
    res.status(404).sendFile(path.join(__dirname, "/views/error404.html"));
  })