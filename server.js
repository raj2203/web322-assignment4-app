/*********************************************************************************
* WEB322 – Assignment 1
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
app.get("/posts/add", function(req,res){
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

app.get("/blog", function(req,res){
    blogService.getPublishedPosts().then(data=>{
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.json(err);
      });
});
app.get("/posts", function(req,res){
   
        blogService.getAllPosts().then(data=>{
            res.json(data);
        }).catch((err) => {
            console.log(err);
            res.json(err);
          });
});
app.get("/categories", function(req,res){
    blogService.getCategories().then(data=>{
        res.json(data);

    }).catch((err) => {
        console.log(err);
        res.json(err);
      });
});

app.use(function (req, res) {
    res.status(404).sendFile(path.join(__dirname, "/views/error404.html"));
  })




 