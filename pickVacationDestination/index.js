'use strict';
const Alexa = require('alexa-sdk');
const locations = require('./locations');

const APP_ID = 'null';

const SKILL_NAME = 'Vacation Picker';
const WELCOME_MESSAGE = 'Welcome to %n. Just ask me to pick a vacation destination for you!';
const WELCOME_REPROMPT = 'For instructions on what you can ask, please say help me.';
const GET_LOCATION_MESSAGE = 'How about visiting %l in %c? Did you know, %f?';
const HELP_MESSAGE = 'You can ask me to recommend a vacation destination and I\'ll pick one for you at random. Would you like a vacation?';
const HELP_REPROMPT = 'Ask me to recommend a vacation location...';
const STOP_MESSAGE = 'Bye bye!';

const handlers = {
    'LaunchRequest': function () {
        var speechOutput = WELCOME_MESSAGE.replace('%n',SKILL_NAME);
        var repromptSpeech = WELCOME_REPROMPT;
        this.response.speak(speechOutput).listen(repromptSpeech);
        this.emit(':responseReady');
    },
    'randomDestination': function () {
        const locationArray = locations.AVAILABLE_LOCATIONS;
        const locIndex = Math.floor(Math.random() * locationArray.length);
        const chosenLocation = locationArray[locIndex];
        const speechOutput = GET_LOCATION_MESSAGE.replace('%l',chosenLocation.city).replace('%c',chosenLocation.country).replace('%f',chosenLocation.fact);
        this.response.cardRenderer(SKILL_NAME, speechOutput);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};