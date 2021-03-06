var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var mongojs = require('mongojs')


var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

// Configure middleware

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// =============================config======================
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/thought-scraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var conn = mongoose.connection;

conn.on('error', function(err){
  console.log('Mongoose error');
})
conn.once('open', function(err){
  console.log('Mongoose connection successful');
})

// =============================configeration======================


// mongoose.connect("mongodb://localhost/thought-scraper");

// Routes

app.get("/scrape", function(req, res) {
  mongoose.connection.db.dropCollection('articles', function(err, result) {});

  axios.get("https://www.thoughtco.com/arts-music-recreation-4132958").then(function(response) {
    console.log("Scrape Complete");

    var $ = cheerio.load(response.data);

    $(".g-item").children('a').each(function(i, element) {
      var result = {};

      result.title = $(this)
        .find(".block-title")
        .text();

      result.link = $(this)
        .attr("href");

      result.image = $(this)
        .find("img")
        .attr('data-src');

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
          res.send();
        })
        .catch(function(err) {
          return res.json(err);
        });
    });

  });
});

app.get("/api/articles", function(req, res) {
  db.Article.find({})
  .then(function(dbArticle){
    res.json(dbArticle);
  }).catch(function(err){
    res.json(err);
  })
});
app.get("/api/saved", function(req, res) {
  db.Article.find({
    saved: true
  })
  .then(function(dbArticle){
    res.json(dbArticle);
  }).catch(function(err){
    res.json(err);
  })
});

app.get("/api/articles/:id", function(req, res) {
  db.Article.find({_id: mongojs.ObjectId(req.params.id)})
  .populate('articles')  
  .then(function(dbArticle){
    res.json(dbArticle);
  }).catch(function(err){
    res.json(err);
  })
});

// Route for saving/updating an Article's associated Note
app.put("/api/saved/:id", function(req, res) {
  
  db.Article.update({_id: mongojs.ObjectId(req.params.id)},{
    $set: {
      saved: true
    }
  }).then(function(dbArticle){
    res.json(dbArticle)
  }).catch(function(err){
    res.json(err);
  })
  
});
app.put("/api/unsaved/:id", function(req, res) {
  
  db.Article.update({_id: mongojs.ObjectId(req.params.id)},{
    $set: {
      saved: false
    }
  }).then(function(dbArticle){
    res.json(dbArticle)
  }).catch(function(err){
    res.json(err);
  })
  
});

app.post("/api/articles/:id", function(req, res) {
  
  db.Article.create(req.body)
    .then(function(dbArticle){
      return db.Article.findOneAndUpdate({},{
        $push: {
          articles: req.params.id
        }},
        {
          new: true
        });
    }).then(function(dbArticle){
      res.json(dbArticle)
    }).catch(function(err){
      res.json(err);
    })
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
