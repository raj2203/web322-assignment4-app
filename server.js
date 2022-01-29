var express = require("express");
var app = express();

var path = require("path");
var blogService = require("blog-service.js");

var HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));

app.listen(HTTP_PORT, function(){
    console.log(`server listening on: ${HTTP_PORT}`);
});

app.get("/", function(req,res){
   
   res.redirect("/about");
});
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname, "/views/about.html"));
});


app.get("/blog", function(req,res){
    res.send("in blog");
});
app.get("/posts", function(req,res){
    res.send("inside posts");
});
app.get("/categories", function(req,res){
    res.send("inside categories");
});