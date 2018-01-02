const userInformationDatabase = require('./userInformation.json');

exports.handler = (event, context) => {

  // new session
  if(event.session.new) {
    console.log('new session');
  }

  switch (event.request.type) {
    case "LaunchRequest":
      console.log('request was launched for person information');
      // let output = 'Nammaskaaar! Zatt-pahtt wijhaaraa, ooh-gaaj time viaa ghaalvoo nakaa';
      let output = 'Welcome to person information Alexa skill. Just ask using someones first name for their phone number or last name.';
      context.succeed(buildResponse(event.session.attributes, output, false));
      break;

    case "IntentRequest":
      console.log('intent request was made with person information');
      let sessionAttributes = event.session.attributes;

      if(event.request.intent.name === 'GetLastName' || event.request.intent.name === 'GetPhoneNumber') {
        let firstName = event.request.intent.slots.firstName.value;
        sessionAttributes = {firstName: firstName};
        let output = `Would you like the full information about  ${firstName}?`;
        let userInfo = userInformationDatabase.find(userEntry => userEntry.firstName.toUpperCase() === firstName.toUpperCase());

        if(event.request.intent.name === 'GetLastName') {
          if(userInfo) {
            output = `${firstName}'s last name is ${userInfo.lastName}. ${output}`;
          }
          else {
            output = `I do not know ${firstName}'s last name. Ask about someone else?`;
            sessionAttributes = {firstName: null};
          }
        }

        else if(event.request.intent.name === 'GetPhoneNumber') {
          if(userInfo) {
            output = `${firstName}'s phone number is ${userInfo.phone}. ${output}`;
          }
          else {
            output = `I do not know ${firstName}'s phone number. Ask about someone else?`;
            sessionAttributes = {firstName: null};
          }
        }

        context.succeed(buildResponse(sessionAttributes, output, false));
      }

      else if(event.request.intent.name === 'AMAZON.YesIntent') {
        // check if first name is in session otherwise this yes is for querying another user
        let output = 'Anyone else?';
        if(sessionAttributes.firstName) {
          let firstName = sessionAttributes.firstName;
          let userInfo = userInformationDatabase.find(userEntry => userEntry.firstName.toUpperCase() === firstName.toUpperCase());
          output = `${firstName}'s phone number is ${userInfo.phone} and his last name is ${userInfo.lastName} ${output}`;
          sessionAttributes = {firstName: null};
        }
        else {
          output = `Great! Go ahead and ask about someone else`;
        }
        context.succeed(buildResponse(sessionAttributes, output, false));
      }

      else if(event.request.intent.name === 'AMAZON.NoIntent') {
        let output = '';
        let endSession = false;
        if(sessionAttributes.firstName) {
          output = 'OK, ask about someone else then?';
          sessionAttributes = {firstName: null};
        }
        else {
          // output = `Ooh-gaaj maazaa time viaa ghaalawlaa. Poodjyaa waylee directory buh-ghaa!`;
          output = `Bye Bye!!`;
          endSession = true;
        }
        context.succeed(buildResponse(sessionAttributes, output, endSession));
      }

      break;
    default:
      context.fail(`Invalid request type + ${event.request.type}`);
  }

};

let buildResponse = (sessionAttributes, output, shouldEndSession, repromptText) => ({
  version: "1.0",
  sessionAttributes: sessionAttributes,
  response: {
    outputSpeech: {
      type: "PlainText",
      text: output
    },
    reprompt: {
      outputSpeech: {
        type: "PlainText",
        text: repromptText
      }
    },
    shouldEndSession: shouldEndSession
  }
});
