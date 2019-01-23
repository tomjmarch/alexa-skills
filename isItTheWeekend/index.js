/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a sample skill built with Amazon Alexa Skills nodejs
 * skill development kit.
 * This sample supports multiple languages (en-US, en-GB, de-GB).
 * The Intent Schema, Custom Slot and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-howto
 **/

'use strict';

const Alexa = require('alexa-sdk');

const APP_ID = 'null';

const languageStrings = {
    'en': {
        translation: {
            SKILL_NAME: 'Weekend Checker',
            WELCOME_MESSAGE: "Welcome to %s. You can ask a question like, is it the weekend?",
            WELCOME_REPROMPT: 'For instructions on what you can ask, please say help me.',
            HELP_MESSAGE: "You can ask questions such as, is it the weekend or how many hours until the weekend...Now, how can I help?",
            HELP_REPROMPT: "Try asking me if it's the weekend",
            STOP_MESSAGE: 'Bye bye!',
            NOT_SURE: 'I\'m not sure sorry, something appears to have gone wrong. Please try asking me again',
            
            IS_WEEKEND: 'It\s the weekend right now!. Party time!',
            IS_NOT_WEEKEND: 'Sorry, it\'s not the weekend yet I\'m afraid',
            TIME_TO_WEEKEND: 'It\s %s until the weekend. Not long to go now!'
        },
    },
};

const handlers = {
    //Use LaunchRequest, instead of NewSession if you want to use the one-shot model
    // Alexa, ask [my-skill-invocation-name] to (do something)...
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'weekendCheck': function () {
        let speechOutput = this.t('NOT_SURE');
        
        //Check if today is a weekend day
        var day = new Date().getDay();
        var isWeekend = (day === 6) || (day === 0);    // 6 = Saturday, 0 = Sunday

        //Return the right response text based on isWeekend
        if(isWeekend === true) {
            speechOutput = this.t('IS_WEEKEND');
        } else {
            speechOutput = this.t('IS_NOT_WEEKEND');
        }

        this.attributes.speechOutput = speechOutput;
        this.response.speak(speechOutput);
        this.emit(':responseReady');     
    },
    'timeToWeekend': function () {
        let speechOutput = this.t('NOT_SURE');
        var itemSlot = 'day';

        //Check if today is a weekend day
        var day = new Date();
        var isWeekend = (day.getDay() === 6) || (day.getDay() === 0);    // 6 = Saturday, 0 = Sunday

        //Return the right response text based on if it isWeekend
        if(isWeekend === true) {
            speechOutput = this.t('IS_WEEKEND');
        } else {
            //Find out what the value of the timeUnit Slot Type is (can be day, hour, minute or second)
            if(this.event.request.intent.slots.timeUnit.resolutions)
            { itemSlot = this.event.request.intent.slots.timeUnit.resolutions.resolutionsPerAuthority[0].values[0].value.name }
            
            //Find out the time until the next weekend
            var weekendStart = day.setDate(day.getDate() + ((7-day.getDay())%7+6) % 7);
            weekendStart = day.setHours(0,0,0);
            var dateDif = weekendStart - new Date();

            //Calculate the difference in the requested unit (itemSlot)
            if(itemSlot === 'second') {
                var timeUnitResponse = Math.floor(dateDif/1000);
            } else if(itemSlot === 'minute') {
                var timeUnitResponse = Math.floor((dateDif/1000)/60);
            } else if(itemSlot === 'hour') {
                var timeUnitResponse = Math.floor(((dateDif/1000)/60)/60);
            } else if(itemSlot === 'day') {
                var timeUnitResponse = Math.floor((((dateDif/1000)/60)/60)/24);
            };
            
            //Create the speech output
            var timeText = timeUnitResponse + ' ' + itemSlot + 's';
            speechOutput = this.t('TIME_TO_WEEKEND', timeText);

        }

        this.attributes.speechOutput = speechOutput;
        this.response.speak(speechOutput);
        this.emit(':responseReady'); 
    },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.RepeatIntent': function () {
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.attributes.speechOutput = this.t('STOP_MESSAGE');
        this.response.speak(this.attributes.speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.attributes.speechOutput = this.t('STOP_MESSAGE');
        this.response.speak(this.attributes.speechOutput);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        console.log(`Session ended: ${this.event.request.reason}`);
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
