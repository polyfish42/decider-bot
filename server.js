var express = require('express');
var helmet = require('helmet');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var dotenv = require('dotenv');

dotenv.load(); // Loads local environment variables from .env file

app.use(express.static(__dirname + '/public')); // Tells the app to use express as its view generator
app.use(helmet()); // Tells the app to use helmet for security features
app.use(bodyParser.json()); // Tells the app to use json to parse.
app.use(bodyParser.urlencoded({ extended: true })); //for parsing url encoded

app.set('view engine', 'ejs'); // Sets view engine to ejs


require('./app/routes/routes')(app); // Reuires all the http request route logic

// Will this be needed after we're on a server?
app.listen(process.env.PORT || 3000, function() {
  console.log('Listening on port 3000');
});
