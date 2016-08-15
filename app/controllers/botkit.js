var connect = function() {
    // if (!process.env.token) {
    //     console.log('Error: Specify token in environment');
    //     process.exit(1);
    // }

    var Botkit = require('botkit');
    var os = require('os');

    var controller = Botkit.slackbot({
        debug: true,
    });

    var bot = controller.spawn({
        token: process.env.TOKEN
    }).startRTM();



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
            bot.startConversation(message, function(err, convo) {

                convo.say("Great, let's make your decision using the elimination algorithm.");
                convo.ask("Please list all your options, separating each option with commas.", function(response, convo) {
                    choicesArray = response.text.split(",");
                    convo.next();
                    convo.say('Awesome thanks for that.');

                    function eliminate(i) {
                        if (1 != choicesArray.length) {
                            convo.say('You have the following options left: ' + choicesArray);
                            convo.next();
                            convo.ask("Which option would you like to eliminate?", function(response, convo) {
                                choicesArray.remove(response.text);
                                eliminate(i + 1);
                            });
                        } else {
                            convo.next();
                            convo.say('Great, you picked ' + choicesArray + '!');
                        }
                    }
                    eliminate(0);
                });
            });
        } else {
            bot.startConversation(message, function(err, convo) {
                choicesArray = message.match[1].split(",");

                function eliminate(i) {
                    if (1 != choicesArray.length) {
                        convo.say('You have the following options left: ' + choicesArray);
                        convo.next();
                        convo.ask("Which option would you like to eliminate?", function(response, convo) {
                            choicesArray.remove(response.text);
                            eliminate(i + 1);
                        });
                    } else {
                        convo.next();
                        convo.say('Great, you picked ' + choicesArray + '!');
                    }
                }
                eliminate(0);
            });
        }

    });
};

module.exports = connect;
