## What the sample does
- The skill endpoint, `./lambda/index.js`, responds to skill launch by checking to see if Web API is supported on the device, and if so, sends a directive to launch a web app. See `LaunchRequestHandler`
- The web app, `./index.js` we initialize the Alexa Web API JavaScript API, and then register callbacks to handle messaging with the endpoint. A matching handler on the endpoint, `ProcessHTMLMessageHandler`, listens for messages, and performs different actions based on the message contents
- The web app logs its activity to a debug div on screen to help explain what events are occuring
- A voice intent, `Alexa, repeat after me [content]` produces a response at `RepeatAfterMeHandler`, which will cue some speech, as well as send a message to the web app 
- A button in the web app, `helloButton` demonstrates sending a message from the device. The message used produces both speech in response, and logged events in the endpoint's CloudWatch logs
- The `micButton` demonstrates using the Alexa api to request the microphone be opened on the device, when possible

### OK, I've deployed the sample, what can I do now?

* Add something to say! The intents block in `./skill-package/interactionModels/custom/en-US.json` contains all of the utterances your skill will be able to recognize. It is populated with a few required Amazon standard intents, as well as a few custom ones. Look at `HelloWorldIntent` to see how you define a new named intent and provide examples of how your player will invoke it. Next, look into `./lambda/index.js` for the same string, `HelloWorldIntent`, to see how you can add a handler that responds when they do.
* Pass new information from your skill endpoint to your web app. In `./lambda/index.js` look at the instances of `Alexa.Presentation.HTML.HandleMessage`. This takes an arbitrary JSON blob and sends it to your web app. Try modifying an existing one, or add a new intent that responds with this directive. Now look in `./web/index.js` and notice how `messageReceivedCallback` is registered with the Alexa instance to receive those JSON messages. The sample just prints the message out, but you could try to apply any change to the web app you like! Maybe create an intent that recognizes color and set that color as the CSS property of an element?
* Plug in a game engine/framework. `./index.js` is loaded by the sample in `./index.html` as the entry point. You could keep adding to `./index.js`, replace it, or add new scripts and elements to the HTML page. If you’ve chosen to use any sort of framework, follow their guide for how to modify these two key single-page-app files.
* Add more files. You can enrich both the backend and web app with mode content. The salient entry points are:
    * `./lambda/index.js` adds the `handler` property to the `exports` object, which is what lambda will invoke to handle requests. As long as you end up with a similar file, exporting the same property, it’ll work. The entire `./lambda` folder will be uploaded by ask-cli to your aws account as a single zip file. Keep the total size of this trim, to keep iteration time low!
    * `./index.html` is currently specified as the web app to load, via the `Alexa.Presentation.HTML.Start` directive in the endpoint code. You can modify this if need be. Otherwise, that HTML page loads `./index.js`, which you could generate from other sources instead.
    * You can add any other asset files for your web app to the directory. The total number of files and how often they change will affect your iteration time, but not necessarily the size of the files.

### Looking for a better sample skill?

Check out https://github.com/alexa-samples/skill-sample-nodejs-web-api-hello-world