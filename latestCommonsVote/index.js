const Alexa = require('ask-sdk-core');
const https = require('https');
const textContent = require('textContent.json');
const visualContent = require('visualContent.json');

const commonsVoteHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'commonsVote');
  },
  handle(handlerInput) {
    const getLatestVoteUri = 'https://lda.data.parliament.uk/commonsdivisions.json?_view=Commons+Divisions&_pageSize=1&_page=0';
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;

    return new Promise((resolve, reject) => {
       httpsGet(getLatestVoteUri).then((voteResponse) => {
         const voteId = JSON.parse(voteResponse).result.items[0]._about.match('([^\/]+$)')[0];
         const getVoteDetailsUri = 'https://lda.data.parliament.uk/commonsdivisions/id/'+voteId+'.json';

        httpsGet(getVoteDetailsUri).then((voteDetailResponse) => {
          
          const voteTitle = JSON.parse(voteResponse).result.items[0].title;
          const voteDate = JSON.parse(voteResponse).result.items[0].date._value;
          const ayesCount = JSON.parse(voteDetailResponse).result.primaryTopic.AyesCount[0]._value;
          const noesCount = JSON.parse(voteDetailResponse).result.primaryTopic.Noesvotecount[0]._value;
          const Margin = JSON.parse(voteDetailResponse).result.primaryTopic.Margin[0]._value;

          visualContent.dataSources.listTemplate2ListData.listPage.listItems[0].textContent.primaryText = {"type": "PlainText","text": ayesCount + ' votes'};
          visualContent.dataSources.listTemplate2ListData.listPage.listItems[1].textContent.primaryText = {"type": "PlainText","text": noesCount + ' votes'};
          visualContent.dataSources.listTemplate2ListData.hintText = voteDate + ': ' + voteTitle;
          
          var outputText = 'The most recent vote, or divison, in the House of Commons was on the ' + voteTitle + '. It ';
          if(ayesCount > noesCount) {outputText += 'won';} else {outputText += 'lost'}
          outputText += ' with ' + ayesCount + ' votes for and ' + noesCount + ' votes against. That\'s a margin of ' + Margin + ' votes.';
          
          const speakOutput = outputText;
          const cardOutput = outputText;
          
          //Only add APL visual interface if it is supported by the device
          if(supportedInterfaces.hasOwnProperty('Alexa.Presentation.APL')) {
            resolve(handlerInput.responseBuilder
              .speak(speakOutput)
              .withSimpleCard(textContent.SKILL_NAME, cardOutput)
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
              .withSimpleCard(textContent.SKILL_NAME, cardOutput)
            .getResponse());
          }
          
        }).catch((error) => {resolve(handlerInput.responseBuilder.speak(textContent.ERROR_MESSAGE).reprompt(textContent.ERROR_MESSAGE).getResponse());});            
      }).catch((error) => {resolve(handlerInput.responseBuilder.speak(textContent.ERROR_MESSAGE).reprompt(textContent.ERROR_MESSAGE).getResponse());});
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
    commonsVoteHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();