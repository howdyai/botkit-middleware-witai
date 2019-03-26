var Wit = require('node-wit').Wit;

module.exports = function(config) {

    if (!config || !config.token) {
        throw new Error('No wit.ai API token specified');
    }

    if (!config.minimum_confidence) {
        config.minimum_confidence = 0.5;
    }

    var client = new Wit({accessToken:config.token,apiVersion:config.apiVersion});

    var middleware = {};

    middleware.receive = function(bot, message, next) {
        // Only parse messages of type text, give the option to use a command for wit requests
        // Otherwise it would send every single message to wit (probably don't want that).
        if (message.text && (!config.command||message.text.indexOf(config.command)>-1)) {
            client.message(message.text, {})
            .then((data) => {
                message.entities = data.entities;
             next();
            })
            .catch(console.error);           
        } else if (message.attachments) {
            message.intents = [];
            next();
        } else {
            next();
        }
    };

    middleware.hears = function(tests, message) {
        if (message.entities && message.entities.intent) {
            for (var i = 0; i < message.entities.intent.length; i++) {
                for (var t = 0; t < tests.length; t++) {
                    if (message.entities.intent[i].value == tests[t] &&
                        message.entities.intent[i].confidence >= config.minimum_confidence) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    return middleware;
};
