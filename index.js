const debugElement = document.getElementById('debugElement');
/**
 * Append text or any object that can be stringified to the debug element
 * @param {any} msg 
 */
function printDebug( msg ) {
    if ( typeof(msg) !== 'string' ) {
        debugElement.append(JSON.stringify(msg,null,2));
    } else {
        debugElement.append(msg);
    }
    debugElement.append('\n');
    debugElement.scrollTo({top: debugElement.scrollHeight});
    console.log(msg);
}

/** @type {Alexa.AlexaClient} */
let alexaClient;
let wakeWord = "Alexa";

function beginApp() {
printDebug('Beginning Alexa.create');
Alexa.create({version: '1.1'})
    .then((args) => {
        if ( args.alexa ) {
            alexaClient = args.alexa;
            alexaClient.skill.onMessage(messageReceivedCallback);
            printDebug(`Alexa is ready :) Received initial data:`);
            printDebug(args.message);
            if ( args.message.hint ) {
                const match = /try\s+\"(\w*),/gi.exec(args.message.hint);
                if ( match ) {
                    printDebug(`discovered wake word: ${match[1]}`);
                    wakeWord = match[1];
                } 
            }
            setHints();
        } else {
            printDebug(`Alexa failed to initialize, code: ${args.code}`);
        }
    })
    .catch(error => {
        printDebug( 'Alexa not ready :(' );
        printDebug( error );
    });
}

// to avoid blocking the first paint, we start code after the first frame
requestAnimationFrame(beginApp);

/**
 * Setup the hints display on screen procedurally, so we can 
 * interpolate in the wakeword
 */
function setHints() {
    document.getElementById('hints').innerHTML = 
        `<p>Try saying <i>"${wakeWord}, Hello"</i>,</p>
        <p>or <i>"${wakeWord}, can you repeat..."</i> followed by something you'd like Alexa to say.</p>`
}

/**
 * Implements receiving a message from your skill backend
 * @param {any} message 
 */
function messageReceivedCallback(message) {
  // Process message (JavaScript object) from your skill
  printDebug('Received a message from the skill.');
  printDebug(message);
}

/**
 * Implements listening to the result of sending a message to your skill backend
 * @param {Alexa.MessageSendResult} result 
 */
const messageSentCallback = function(result) {
    if ( result.statusCode === 200 ) {
        printDebug(`Message was sent successfully.`);
    } else {
        printDebug(`Failed to send the message to the skill.`);
    }
    printDebug(result);
};

/**
 * Wraps sending a message to your skill backend 
 * with our custom result callback function
 * @param {any} msg 
 */
function sendMessage(msg){
    printDebug(`Sending a message to the skill.`);
    printDebug(msg);
    if ( alexaClient ) {
        alexaClient.skill.sendMessage(msg, messageSentCallback);
    } else {
        printDebug(`Alexa was not ready, could not send message.`);
        printDebug(msg);
    }
}

/*
  When handling touch events on Alexa screen devices, 
  you can skip the latency caused by browser support 
  for long presses by handling the down events directly.
  Be sure to preventDefault on touch events if you've also
  implemented mouse events for testing.
*/

function bindButton( name, func ) {
    const element = document.getElementById(name);
    element.addEventListener('mousedown', (ev) => {
        func();
    });
    
    element.addEventListener('touchstart', (ev) => {
        func();
        ev.preventDefault();
    });    
}

bindButton('helloButton', () => {
    sendMessage({speech:'Hello!', time: Date.now()});
});

bindButton('micButton', () => {
    if ( !alexaClient ) {
        printDebug('Cannot open the mic, Alexa is not ready.');
        return;
    }

    printDebug('Before the IF');
    if (alexaClient.voice) {
        printDebug('Requesting the mic.');
        alexaClient.voice.requestMicrophoneOpen({
            onOpened: () => printDebug('The mic was opened.'),
            onClosed: () => printDebug('The mic was closed.'),
            onError: (err) => {
                printDebug(err);
            }
        })
    } else {
        alexaClient.skill.sendMessage({ command: 'openMic' });
    }
    
    // printDebug('Requesting the mic.');
    // alexaClient.voice.requestMicrophoneOpen({
    //     onOpened: () => printDebug('The mic was opened.'),
    //     onClosed: () => printDebug('The mic was closed.'),
    //     onError: (err) => {
    //         printDebug(err);
    //     }
    // })
});