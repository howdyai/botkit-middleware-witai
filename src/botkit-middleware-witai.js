'use strict';
const Logger = require('node-wit').Logger;
const levels = require('node-wit').logLevels;
const Wit = require('node-wit').Wit;

const logger = new Logger(levels.DEBUG);

module.exports = function(config) {

    if (!config || !config.token) {
        throw new Error('No wit.ai API token specified');
    }

    if (!config.minimum_confidence) {
        config.minimum_confidence = 0.5;
    }

    const client = new Wit(config.token, actions, logger);

    const middleware = {};

    middleware.receive = function(bot, message, next) {
        if (message.text) {
            client.message(message.text, (error, data) => {
                if (error) {
                    next(error);
                } else {
                    // no support for multiple outcomes, is it needed for this?
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
