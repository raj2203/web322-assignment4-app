var express = require("express");
var path = require("path");
var app = express();

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