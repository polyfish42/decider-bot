var Request = require('request');

module.exports = function(app) {

  app.get('/', function(req, res) {
    console.log("Rending root view");

    res.render('root');
  });
};
