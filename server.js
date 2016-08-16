var express = require('express');
var helmet = require('helmet');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var dotenv = require('dotenv');

dotenv.load();

app.use(express.static(__dirname + '/public'));
app.use(helmet());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); //for parsing url encoded

app.set('view engine', 'ejs');


require('./app/routes/routes')(app);

app.listen(3000, function() {
  console.log('Listening on port 3000');
});
