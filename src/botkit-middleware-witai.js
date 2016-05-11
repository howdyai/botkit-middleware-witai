var Wit = require('node-wit').Wit;

// not used at the moment
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
    }
};

module.exports = function(config) {

    if (!config || !config.token) {
        throw new Error('No wit.ai API token specified');
    }

    if (!config.minimum_confidence) {
        config.minimum_confidence = 0.5;
    }

    var client = new Wit(config.token, actions);

    var middleware = {};

    middleware.receive = function(bot, message, next) {
        // Only parse messages of type text and mention the bot.
        // Otherwise it would send every single message to wit (probably don't want that).
        if (message.text && message.text.indexOf(bot.identity.id) > -1) {
            client.message(message.text, function(error, data) {
                if (error) {
                    next(error);
                } else {
                    // not sure how to handle multiple outcomes right now
                    message.entities = data.outcomes[0].entities;
                    next();
                }
            });
        }
    };

    middleware.hears = function(tests, message) {
        if (message.entities.intent) {
            for (var i = 0; i < message.entities.intent.length; i++) {
                for (var t = 0; t < tests.length; t++) {
                    if (message.entities.intent[i].value == tests[t]) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    return middleware;
};
