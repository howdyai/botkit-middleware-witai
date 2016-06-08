var Logger = require('node-wit').Logger;
var levels = require('node-wit').logLevels;
var Wit = require('node-wit').Wit;


var actions = {
  say: function(sessionId, context, message, cb) {
    console.log(message);
    cb();
  },
  merge: function(sessionId, context, entities, message, cb) {
    cb(context);
  },
  error: function(sessionId, context, error) {
    console.log(error.message);
  },
};

module.exports = function(config) {

    if (!config || !config.token) {
        throw new Error('No wit.ai API token specified');
    }

    var logger = new Logger(levels.INFO);
    var client = new Wit(config.token, actions, logger);

    if (!config.minimum_confidence) {
        config.minimum_confidence = 0.5;
    }

    if (!config.intent_entity_name) {
        config.intent_entity_name = 'intent'
    }

    var middleware = {};
    var context = {};

    middleware.receive = function(bot, message, next) {
        if (message.text) {

            client.message(message.text, context, function(error, data) {
                if (error) {
                    next(error);
                } else {
                    var entities = data.entities;
                    if (entities) {
                        message.entities = data.entities;
                        message.intents = data.entities[config.intent_entity_name];
                    }
                    next();
                    }
            });
        }

    };

    middleware.hears = function(tests, message) {

        if (message.intents) {
            for (var i = 0; i < message.intents.length; i++) {
                for (var t = 0; t < tests.length; t++) {
                    if (message.intents[i].value == tests[t] &&
                        message.intents[i].confidence >= config.minimum_confidence) {
                        return true;
                    }
                }
            }
        }

        return false;
    };


    return middleware;

};
