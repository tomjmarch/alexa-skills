const Alexa = require('ask-sdk-core');
const https = require('https');
const textContent = require('textContent.json');
const visualContent = require('visualContent.json');

const londonAirQualityHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'londonAirQuality');
  },
  handle(handlerInput) {
    const apiUri = 'https://api.tfl.gov.uk/AirQuality?app_id=null&app_key=null';
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;

    return new Promise((resolve, reject) => {
       httpsGet(apiUri).then((dataResponse) => {
          const forecastToday = 'The London forecast today is for ' + JSON.parse(dataResponse).currentForecast[0].forecastBand + ' air pollution levels.';
          const speakOutput = forecastToday;
          //Add visual content into the array
          visualContent.dataSources.listTemplate1ListData.listPage.listItems[0].textContent.tertiaryText = {"type": "PlainText","text": JSON.parse(dataResponse).currentForecast[0].nO2Band};
          visualContent.dataSources.listTemplate1ListData.listPage.listItems[1].textContent.tertiaryText = {"type": "PlainText","text": JSON.parse(dataResponse).currentForecast[0].o3Band};
          visualContent.dataSources.listTemplate1ListData.listPage.listItems[2].textContent.tertiaryText = {"type": "PlainText","text": JSON.parse(dataResponse).currentForecast[0].pM10Band};
          visualContent.dataSources.listTemplate1ListData.listPage.listItems[3].textContent.tertiaryText = {"type": "PlainText","text": JSON.parse(dataResponse).currentForecast[0].pM25Band};
          visualContent.dataSources.listTemplate1ListData.listPage.listItems[4].textContent.tertiaryText = {"type": "PlainText","text": JSON.parse(dataResponse).currentForecast[0].sO2Band};
          
          //Only add APL visual interface if it is supported by the device
          if(supportedInterfaces.hasOwnProperty('Alexa.Presentation.APL')) {
            resolve(handlerInput.responseBuilder
              .speak(speakOutput)
              .withSimpleCard(textContent.SKILL_NAME, forecastToday)
              .addDirective({
              	type: 'Alexa.Presentation.APL.RenderDocument',
              	version: '1.0',
              	datasources: visualContent.dataSources,
              	document: visualContent.document    
            	})
            .getResponse());
          } else {
            resolve(handlerInput.responseBuilder
              .speak(speakOutput)
              .withSimpleCard(textContent.SKILL_NAME, forecastToday)
            .getResponse());
          }
          
       }).catch((error) => {
          resolve(handlerInput.responseBuilder
            .speak(textContent.ERROR_MESSAGE)
            .reprompt(textContent.ERROR_MESSAGE)
            .getResponse());
        });
      });
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(textContent.HELP_MESSAGE)
      .reprompt(textContent.HELP_REPROMPT)
      .getResponse();
  },
};

const FallbackHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(textContent.FALLBACK_MESSAGE)
      .reprompt(textContent.FALLBACK_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(textContent.STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    return handlerInput.responseBuilder
      .speak(textContent.ERROR_MESSAGE)
      .reprompt(textContent.ERROR_MESSAGE)
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

function httpsGet(query) {
  return new Promise(((resolve, reject) => {
    var req = https.get(query, res => {
        res.setEncoding('utf8');
        var responseString = "";
        
        //accept incoming data asynchronously
        res.on('data', chunk => {
            responseString = responseString + chunk;
        });
        
        //return the data when streaming is complete
        res.on('end', () => {
            resolve(responseString);
        });

    });
    req.end();
  }));
}

exports.handler = skillBuilder
  .addRequestHandlers(
    londonAirQualityHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();