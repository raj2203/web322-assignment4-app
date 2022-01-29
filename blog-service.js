const fs = require("fs"); 

const { rejects } = require("assert");
const { json } = require("express/lib/response");
const { resolve } = require("path");

var posts = [];
var categories = [];

//------------------- INITIALIZED FUNCTION ----------------------
module.exports.initialize = function()
{
    return new Promise((resolve,reject)=>{

        try {
            fs.readFile('./data/posts.json', 'utf8', (err, data) => {
                if (err) throw err;
                posts = JSON.parse(data);
            });
            fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                //if (err) throw err;
                categories = JSON.parse(data);
               
            });
        }catch (error) {
            console.log("initialized failed with " + error);
            reject("initialized failed");
        }
        
        console.log("initialized done");
        resolve("Initialized successfully");
    });
}

//-------------------- getAllPosts FUNCTION --------------------------

module.exports.getAllPosts = function()
{
    return new Promise((resolve,reject)=>{

        if(posts.length === 0)
        {
            var errmsg = "object does not have any data available at this time";
            reject({message: errmsg});
        }else{
            resolve(posts);
        }

    });
}

// --------------------- getPublishedPosts() --------------------

module.exports.getPublishedPosts = function()
{
    let posttemp = [];
    return new Promise((resolve,reject)=>{
        if(posts.length === 0)
        {
            var errmsg = "object does not have any data available at this time";
            reject({message: errmsg});
        }else{

            for(let i = 0; i < posts.length; i++)
            {
                if(posts[i].published == true)
                {
                    posttemp.push(posts[i]);

                }
            }
            if(posttemp === 0)
            {
                errmsg = "object does not have any published post yet!";
            }
            else{
                resolve(posttemp);
            }
           
        }
    });
}


// --------------------- getCategories() --------------------

module.exports.getCategories = function()
{
    return new Promise((resolve,reject)=>{

        if(categories.length === 0)
        {
            reject({message: "object does no have any data available at this time!"});
        }
        else
        {
            resolve(categories);
        }
    });
}