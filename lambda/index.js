const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        // Checking for HTML support on device. If present, launch the web app.
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.HTML']) {
            const startDirective = {
                type:"Alexa.Presentation.HTML.Start",
                request: {
                    // The source code for this webpage is available at https://github.com/austinvach/webapi and is hosted on GitHub Pages.
                    // If needed, update the URI to point to the GitHub page associated with your repository.
                    // https://docs.github.com/en/pages/quickstart
                    uri: `https://austinvach.com/webapi/`,
                    method: "GET"
                },
                configuration: {
                   "timeoutInSeconds": 300
                }
            }
            
            return handlerInput.responseBuilder
                .addDirective(startDirective)
                .speak("It's showtime!")
                // when using Web API, if we don't want to end the skill and 
                // don't want to open the microphone, then we explicitly set
                // end session to undefined
                .withShouldEndSession(undefined)
                .getResponse();
                
        } else {
            return handlerInput.responseBuilder
                .speak("This skill is meant to be used on a device with a screen. Please try again on a different device.")
                .withShouldEndSession(true)
                .getResponse();      
        }
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = "You can say hello to me! Try it now.";
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        // note: we should not send HTML directives when we're about to quit
        // as the web app will also be torn down immediately. If we have something
        // to say, we must say it with outputSpeech.
        
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(true)
            .getResponse();
    }
};

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = "Sorry, I don't know about that. Please try again.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .withShouldEndSession(undefined)
            .getResponse();
    }
};

/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // it's good to pay specific attention here to see if the session ended because
        // of a problem.
        const request = Alexa.getRequest(handlerInput.requestEnvelope);
        if ( request.reason === 'ERROR' ) {
            console.error(`SESSION END ERROR: ${JSON.stringify(request.error)}`);
        }

        // but otherwise we return an empty response
        return handlerInput.responseBuilder.getResponse(); 
    }
};

/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error(error);
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please ask again.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .withShouldEndSession(false)
            .getResponse();
    }
};

/**
 * In this skill, this intent asks Alexa to just repeat the phrase the user said. 
 * We'll do so, as well as send the speech to the web app for display
 */
const RepeatAfterMeHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RepeatAfterMeIntent';
    },
    handle(handlerInput) {
        const request = Alexa.getRequest(handlerInput.requestEnvelope);
        
        const speech = [];
        const htmlMessage = {};
        
        if ( request && request.intent && request.intent.slots && request.intent.slots.message ) {
            const message = handlerInput.requestEnvelope.request.intent.slots.message.value; 
            speech.push( "You said: " );
            speech.push( message );
            htmlMessage.userSpeech = message;
        } else {
            speech.push( "Hmm, I'm not sure what you said." );
            htmlMessage.error = "NO_SPEECH";
        }

        const messageDirective = {
            type:"Alexa.Presentation.HTML.HandleMessage",
            message: htmlMessage
        }

        return handlerInput.responseBuilder
            .addDirective(messageDirective)
            .speak(speech.join(' '))
            .withShouldEndSession(undefined)
            .getResponse();
    }
};

/**
 * This is where messages sent from the web app will arrive. We'll look for specific
 * members in the message, and act accordingly
 */
const ProcessHTMLMessageHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === "Alexa.Presentation.HTML.Message";
    },
    handle(handlerInput) {
        const request = Alexa.getRequest(handlerInput.requestEnvelope);
        const message = request.message;
        
        const speech = [];
        
        if ( message.time ) {
            const lag = Date.now() - message.time;
            if ( lag > 1000 ) {
                speech.push( `send ${Math.floor(lag/1000)} seconds ago,`);
            } else {
                speech.push( `sent ${lag} milliseconds ago,`);
            }
        }
        
        if ( message.speech ) {
            speech.push( message.speech );
        }
        
        return handlerInput.responseBuilder
            .speak(speech.join(' '))
            .withShouldEndSession(undefined)
            .getResponse();
    }
}

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestInterceptors( (handlerInput) => {
        // for debugging purposes we'll log every request we receive
        console.log(JSON.stringify(handlerInput.requestEnvelope));
    })
    .addResponseInterceptors( (handlerInput, response) => {
        // for debugging purposes we'll log every response we return
        console.log(JSON.stringify(response));
    })
    .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        ProcessHTMLMessageHandler,
        RepeatAfterMeHandler,
        SessionEndedRequestHandler)
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
