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

    // A context handler interface to get the context object and send it to wit
    // It has a function with below signature
    //function getContext(bot, message);
    var contextHandler = null;
    if (config.contextHandler) 
    {
        contextHandler = config.contextHandler;
    }

   // If wit fails to give any intent then this may help to do some processing over wit
    // may be a regex based botkit defaultEars can be used to do regex matching if wit fails
    var defaultEars = null;
    if (config.defaultEars) {
        defaultEars = config.defaultEars;
    }

    // a Validate Intent interface to validate the intent from wit
    // it requires to do some validation over it
    var validateIntent = null;
    if (config.validateIntent) {
        validateIntent = config.validateIntent;
    }

    // a post process intent interface to do some post processing over wit intent
    var postProcessIntent = null;
    if (config.postProcessIntent) {
        postProcessIntent = config.postProcessIntent;
    }

    var client = new Wit(config.token, actions);

    var middleware = {};

    middleware.receive = function(bot, message, next) {
        // Only parse messages of type text and mention the bot.
        // Otherwise it would send every single message to wit (probably don't want that).
        // removed message.text.indexOf(bot.identity.id) as id was missing from identity
        if (message.text) {
            // added to get the context object
            var context = contextHandler != null ? contextHandler.getContext() : undefined;

            client.message(message.text, context, function(error, data) {
                if (error) {
                    next(error);
                } else {
                    console.log ("entities from wit ", data.entities);
                    // if validateIntent is not defined then add the entities to message, 
                    // so that others can handle themselves
                    if ((validateIntent !== null && validateIntent (data.entities)) || validateIntent == null)
                    {  
                        data.entities = postProcessIntent(data.entities);
                        message.entities = data.entities;
                    }
                    else
                    {
                        console.log ( "validation of intent is failed for entities - ", data.entities );
                    }
                    next();
                }
            });
        } else if (message.attachments) {
            message.intents = [];
            next();
        } else {
            next();
        }
    };

    middleware.hears = function(tests, message) {
        if (message.entities && message.entities.intent) {
            console.log ("matching wit reposnse to ", tests);
            for (var i = 0; i < message.entities.intent.length; i++) {
                for (var t = 0; t < tests.length; t++) {
                    if (message.entities.intent[i].value == tests[t] &&
                        message.entities.intent[i].confidence >= config.minimum_confidence) {
                        return true;
                    }
                }
            }
        }
        else 
        {
            console.log ("no intent is found, matching with regexes ", tests);
            if (defaultEars && defaultEars !== null)
                return defaultEars(tests, message);
            else
                console.error ("Missing defaultEars : No Intent is found in Wit Response, and there is no default handler for such response.");
        }

        return false;
    };

    return middleware;
};
