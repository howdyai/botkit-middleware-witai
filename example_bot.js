/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Get a Wit token from Wit.ai

    -> https://wit.ai/apps/new

  Run your bot from the command line:

    wit=<MY WIT TOKEN> token=<MY TOKEN> node bot.js

# USE THE BOT:

  Train a "hello" intent inside Wit.ai.  Give it a bunch of examples
  of how someone might say "Hello" to your bot.

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot should reply "Hello!" If it didn't, your intent hasn't been
  properly trained - check out the wit.ai console!

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit is has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

if (!process.env.wit) {
    console.log('Error: Specify wit in environment');
    process.exit(1);
}

var Botkit = require('botkit');
var wit = require('./src/botkit-middleware-witai')({
    token: process.env.wit,
});


var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

controller.middleware.receive.use(wit.receive);


/* note this uses example middlewares defined above */
controller.hears(['hello'], 'direct_message,direct_mention,mention', wit.hears, function(bot, message) {
    bot.reply(message, 'Hello!');
});
