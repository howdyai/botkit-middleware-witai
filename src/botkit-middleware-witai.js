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
        // console.log(message);
        // Only parse messages of type text and mention the bot.
        // Otherwise it would send every single message to wit (probably don't want that).
        if (message.text) {//&& message.text.indexOf(bot.identity.id) > -1) {
            console.log("sender" + message.text);

            client.message(message.text, {})
                .then((data) => {
                    console.log('Yay, got Wit.ai response: ' + JSON.stringify(data));
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

    middleware.hears = function (tests, message) {
        console.log(message.entities);
        console.log(Object.keys(message.entities));
        
        var res = false;
        Object.keys(message.entities).forEach(element => {
            console.log(element);
            if (tests.find((value, index, array) => value == element)) {
                console.log(true);
                res = true;
            }
        });

        // if (message.entities && message.entities.intent) {
        //     for (var i = 0; i < message.entities.intent.length; i++) {
        //         for (var t = 0; t < tests.length; t++) {
        //             if (message.entities.intent[i].value == tests[t] &&
        //                 message.entities.intent[i].confidence >= config.minimum_confidence) {
        //                 return true;
        //             }
        //         }
        //     }
        // }

        return res;
    };

    return middleware;
};
