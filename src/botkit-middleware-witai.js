var Wit = require('node-wit').Wit;

// not used at the moment
var actions = {
    say: function (sessionId, context, message, cb) {
        console.log(message);
        cb();
    },
    merge: function (sessionId, context, entities, message, cb) {
        cb(context);
    },
    error: function (sessionId, context, error) {
        console.log(error.message);
    }
};

module.exports = function (config) {
    if (!config || !config.token) {
        throw new Error('No wit.ai API token specified');
    }

    if (!config.minimum_confidence) {
        config.minimum_confidence = 0.5;
    }

    var client = new Wit({ accessToken: config.token, actions: actions });

    var middleware = {};

    middleware.receive = function (bot, message, next) {
        // Only parse messages of type text
        if (message.text) {
            console.log("sender" + message.text);

            client.message(message.text, {})
                .then((data) => {
                    message.entities = data.entities;
                    next();
                }).catch((error) => {
                    next(error);
                });
        } else if (message.attachments) {
            message.intents = [];
            next();
        } else {
            next();
        }
    };

    middleware.hears = function (tests, message) {
        let keys = Object.keys(message.entities);
        while (keys.length > 0) {
            let key = keys.shift();
            let entity = message.entities[key].shift();
            let confidence = entity.confidence;

            if (tests.find((value) => value == key) &&
                confidence >= config.minimum_confidence) {
                return true;
            }
        }
        return false;
    };

    return middleware;
};
