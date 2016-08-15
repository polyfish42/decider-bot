var Request = require('request');

module.exports = function(app) {

  app.get('/', function(req, res) {
    console.log("Rending root view");

    res.render('root');
  });

  app.get('/start', function(req, res) {
    var connect = require('../controllers/botkit');
    connect();
    res.send('Hello World');
  });

  app.get('/new', function(req, res) {
    console.log("================== START TEAM REGISTRATION ==================");
    //temporary authorization code
    var auth_code = req.query.code;

    if(!auth_code){
      //user refused auth
      res.redirect('/');
    }
    else{
      console.log("New user auth code " + auth_code);
      perform_auth(auth_code, res);
    }
  });
};
