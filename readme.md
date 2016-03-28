# Use Wit.ai's natural language tools in your Botkit-powered Bot!

This middleware plugin for [Botkit](http://howdy.ai/botkit) allows you
to seamlessly integrate Wit.ai natural language intent APIs into your Botkit bot.

[Wit.ai](http://wit.ai) provides a service that uses machine learning to
help developers handle natural language input.  The Wit API receives input
from the user, and translates it into one or more "intents" which map to known
actions or choices.  The power of Wit is that it can continually be trained
to understand more and more responses without changing the underlying bot code!

## Setup

Create a Wit application [here](https://wit.ai/apps/new).  Then, set up and
train at least one intent.

From your app's settings page, snag the *Server Access Token*. You will
need this to use Wit's API.

Add botkit-middleware-witai as a dependency to your Botkit bot!

```
npm install --save botkit-middleware-witai
```

Enable the middleware:

```

var wit = require('botkit-middleware-witai')({
    token: <my_wit_token>
});

controller.middleware.receive.use(wit.receive);

controller.hears(['hello'],'direct_message',wit.hears,function(bot, message) {

    // ...
});
```

For a full example [example_bot.js](example_bot.js)

## What it does

Using the Wit receive middleware with Botkit causes every message that is
sent to your bot to be first sent to Wit.ai for processing. The
results of the call to Wit.ai are added into the incoming message
as `message.intents`, and will match the results of [this Wit.ai API call](https://wit.ai/docs/http/20141022#get-intent-via-text-link).

Using the Wit hears middleware tells Botkit to look for Wit.ai intents
information, and match using this information instead of the built in
pattern matching function.

Unless you want to directly access the information returned by wit,
you can use this transparently by enabling bot the `receive` and `hears`
middlewares.
