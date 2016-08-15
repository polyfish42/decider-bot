var Botkit = require('botkit'),
    mongoStorage = require('botkit-storage-mongo')({
        mongoUri: process.env.MONGODB_URI
    });

var os = require('os');

if (!process.env.SLACK_ID || !process.env.SLACK_SECRET || !process.env.PORT) {
  console.log('Error: Specify SLACK_ID SLACK_SECRET and PORT in environment');
  process.exit(1);
}

var controller = Botkit.slackbot({
  debug: true,
  storage: mongoStorage
});

exports.controller = controller;

//CONNECTION FUNCTIONS=====================================================
exports.connect = function(team_config){
  var bot = controller.spawn(team_config);
  controller.trigger('create_bot', [bot, team_config]);
};

// just a simple way to make sure we don't
// connect to the RTM twice for the same team
var _bots = {};

function trackBot(bot) {
  _bots[bot.config.token] = bot;
}

controller.on('create_bot',function(bot,team) {

  if (_bots[bot.config.token]) {
    // already online! do nothing.
    console.log("already online! do nothing.");
  }
  else {
    bot.startRTM(function(err) {

      if (!err) {
        trackBot(bot);

        console.log("RTM ok");

        controller.saveTeam(team, function(err, id) {
          if (err) {
            console.log("Error saving team");
          }
          else {
            console.log("Team " + team.name + " saved");
          }
        });
      }

      else{
        console.log("RTM failed");
      }

      bot.startPrivateConversation({user: team.createdBy},function(err,convo) {
        if (err) {
          console.log(err);
        } else {
          convo.say('I am a bot that has just joined your team');
          convo.say('You must now /invite me to a channel so that I can be of use!');
        }
      });

    });
  }
});

//REACTIONS TO EVENTS==========================================================

// Handle events related to the websocket connection to Slack
controller.on('rtm_open',function(bot) {
  console.log('** The RTM api just connected!');
});

controller.on('rtm_close',function(bot) {
  console.log('** The RTM api just closed');
  // you may want to attempt to re-open
});

// Conversation
var choicesArray = [];


if (!Array.prototype.remove) {
    Array.prototype.remove = function(val) {
        var i = this.indexOf(val);
        return i > -1 ? this.splice(i, 1) : [];
    };
}

controller.hears('help', 'direct_message,direct_mention,mention', function(bot, message) {

    bot.reply(message, "I can help you make decisions in a variety of ways. Below I've listed my 'decision algorithms' which are processes for making decisions. Type the name of an algorithm below, and I'll walk you through it.\n\n" +
        "*Random*: I randomly select from a list of options.\n" +
        "*Elimination*: You create a list of options, and I ask you to eliminate them one by one.\n" +
        "*Group Eliminate*: I help a group decide by generating a list of options and then asking each person to take turns eliminating options until one is left. Great for movies or deciding where to eat.\n\n" +
        "*Feedback*: Report a bug give feedback to my creator.");

});

controller.hears('random(.*)', 'direct_message,direct_mention,mention', function(bot, message) {

    if (message.match[1] === '') {
        bot.startConversation(message, function(err, convo) {
            convo.ask("Great, please list all your options separated by commas.", function(response, convo) {
                options = response.text.split(",");
                var decision = options[Math.floor(Math.random() * options.length)];
                bot.reply(message, "I randomly select " + decision);

            });
        });
    } else {
        options = message.match[1].split(",");
        var decision = options[Math.floor(Math.random() * options.length)];
        bot.reply(message, decision);
    }


});

controller.hears('decide between (.*) (?:or|and) (.*)', 'direct_message,direct_mention,mention', function(bot, message) {

    options = message.match[1].split(",");
    options.push(message.match[2]);
    options = options.filter(Boolean);
    var decision = options[Math.floor(Math.random() * options.length)];
    bot.reply(message, decision);

});

controller.hears('eliminate(.*)', 'direct_message,direct_mention,mention', function(bot, message) {

    if (message.match[1] === '') {
      bot.startConversation(message, function (err, convo) {

          convo.say("Great, let's make your decision using the elimination algorithm.");
          convo.ask("Please list all your options, separating each option with commas.", function (response, convo) {
            unformattedChoicesArray = response.text.split(",");
            choicesArray = unformattedChoicesArray.map(function(element) {
              newElement = element.trim();
              return newElement;
            });
              convo.next();
              convo.say('Awesome thanks for that.');
              function eliminate(i) {
                  if(1 != choicesArray.length) {
                      convo.say('You have the following options left: '+ choicesArray);
                      convo.next();
                      convo.ask("Which option would you like to eliminate?", function(response, convo) {
                          choicesArray.remove(response.text);
                          eliminate(i+1);
                      });
                  }
                  else {
                      convo.next();
                      convo.say('Great, you picked ' + choicesArray + '!');
                  }
              }
              eliminate(0);
          });
      });
    }
    else {
      bot.startConversation(message, function (err, convo) {
            if(err) {
              console.log("startConversation Error");
              return;
            }
            unformattedChoicesArray = message.match[1].split(",");
            choicesArray = unformattedChoicesArray.map(function(element) {
              newElement = element.trim();
              return newElement;
            });
              function eliminate(i) {
                  if(1 != choicesArray.length) {
                      convo.say('You have the following options left: '+ choicesArray);
                      convo.next();
                      convo.ask("Which option would you like to eliminate?", function(response, convo) {
                          choicesArray.remove(response.text);
                          eliminate(i+1);
                      });
                  }
                  else {
                      convo.next();
                      convo.say('Great, you picked ' + choicesArray + '!');
                  }
              }
              eliminate(0);
          });
    }
});

controller.storage.teams.all(function(err, teams) {

    console.log(teams);

    if (err) {
        throw new Error(err);
    }

    // connect all teams with bots up to slack!
    for (var t in teams) {
        if (teams[t].bot) {
            var bot = controller.spawn(teams[t]).startRTM(function(err) {
                if (err) {
                    console.log('Error connecting bot to Slack:', err);
                } else {
                    trackBot(bot);
                }
            });
        }
    }

});
