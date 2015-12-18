console.log('Loading function');

var DrugInteractions = require('./druginteractions');

exports.handler = function(event, context) {
  console.log(JSON.stringify(event));

  var medications = DrugInteractions.getMedications(event);
  console.log("Current Medications: " + medications);

  var interactions = DrugInteractions.getInteractions(medications,DrugInteractions.getCard,function(card){
    console.log("Response: " + JSON.stringify(card));
    context.succeed(card);
  });
};
