var wit = require('node-wit');

module.exports = function(config) {

    if (!config || !config.token) {
        throw new Error('No wit.ai API token specified');
    }

    if (!config.minimum_confidence) {
        config.minimum_confidence = 0.5;
    }

    var middleware = {};
    const client = new Wit({accessToken: config.token});

    middleware.receive = function(bot, message, next) {
        if (message.text) {
            client.message(message.text, function(error, data) {
                if (error) {
                    next(error);
                } else {
                    message.entities = data.entities;
                    next();
                }
            });
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
