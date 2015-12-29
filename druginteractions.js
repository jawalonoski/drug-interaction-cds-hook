// var https = require('https');
var http = require('http');
var url = require('url');

var getCard = function(drugs,interactions)
{
  var indicator = "warning";
  var summary = "Unable to determine if drug-drug interactions are present!";
  var detail = "";
  var source = "DrugBank data, NLM Interaction API.";
  var proposed = "";

  interactions = JSON.parse(interactions);

  detail = "\n**Current Medication List**\n";
  for(var i in drugs) {
    if(drugs[i][2]) {
      detail += "- " + drugs[i][1] + "\n";
    } else {
      proposed = drugs[i][1];
    }
  }
  if(proposed!="") {
    detail += "\n**Candidate Medication**\n";
    detail += "- " + proposed;
  }
  if(!interactions.fullInteractionTypeGroup) {
    indicator = "info";
    summary = "No drug-drug interactions found.";
  } else {
    indicator = "danger";
    summary = "Drug-drug interactions found!";
    detail += "\n\n**Interactions**\n"
    for(var i in interactions.fullInteractionTypeGroup) {
      var interaction = interactions.fullInteractionTypeGroup[i];
      for(var j in interaction.fullInteractionType) {
        detail += "- " + interaction.fullInteractionType[j].comment + "\n";
        var interaction_descriptions = [];
        for(var k in interaction.fullInteractionType[j].interactionPair) {
          interaction_descriptions.push( interaction.fullInteractionType[j].interactionPair[k].description );
        }
        var unique_descriptions = interaction_descriptions.filter(function(elem, pos) {
          return interaction_descriptions.indexOf(elem) == pos;
        });
        detail += "  - >" + unique_descriptions.join("\n  - >")
      }
    }
  }
  detail += "\n\n**Disclaimer**\n_" + interactions.nlmDisclaimer + "_";

  var card = {};
  card.name = "card";
  card.part = [];

  var index = 0;
  card.part.push({});
  card.part[index].name = "summary";
  card.part[index].valueString = summary;

  if(indicator != "info") {
    index++;
    card.part.push({});
    card.part[index].name = "detail";
    card.part[index].valueString = detail;
  }

  index++;
  card.part.push({});
  card.part[index].name = "source";
  card.part[index].part = [];
  card.part[index].part.push({});
  card.part[index].part[0].name = "label";
  card.part[index].part[0].valueString = source;

  index++;
  card.part.push({});
  card.part[index].name = "indicator";
  card.part[index].valueString = indicator;

  var params = {};
  params.resourceType = "Parameters";
  params.parameter = [ card ];

  return params;
}

var getEntry = function(entries,key,value) {
  for (var i in entries) {
    if(entries[i][key]==value) return entries[i];
  }
  return null;
};

var getMedications = function(params) {
  var drugs = [];
  var prefetch = getEntry(params.parameter,"name","preFetchData");
  if(prefetch.resource.resourceType=="Bundle") {
    // this is the prefetch bundle
    var search = prefetch.resource.entry[0].resource;
    if(search.resourceType=="Bundle") {
      // this is the search result set within the Bundle
      var medication_orders = search.entry;
      for(var i in medication_orders) {
        var tuple = [];
        tuple.push(medication_orders[i].resource.medicationCodeableConcept.coding[0].code);
        tuple.push(medication_orders[i].resource.medicationCodeableConcept.coding[0].display);
        tuple.push(true);
        drugs.push(tuple);
      }
    }
  }
  var context = getEntry(params.parameter,"name","context");
  if(context.resource.resourceType=='MedicationOrder' &&
      context.resource.medicationCodeableConcept &&
      context.resource.medicationCodeableConcept.coding
    ) {
    var tuple = [];
    tuple.push(context.resource.medicationCodeableConcept.coding[0].code);
    tuple.push(context.resource.medicationCodeableConcept.coding[0].display);
    tuple.push(false);
    drugs.push(tuple);
  }
  return drugs;
}

var getInteractions = function(drugs,cardCallback,responseCallback) {
  // Make call to NLM Interaction RESTful API
  codes = [];
  for(var x in drugs) {
    codes.push(drugs[x][0]);
  }
  var api = 'http://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis='+codes.join('+');
  http.get(
  // {
  //   host: 'gatekeeper.mitre.org',
  //   port: 80,
  //   path: api,
  //   headers: {
  //     Host: 'rxnav.nlm.nih.gov'
  //   }
  // }
  api , function(res) {
    var body = '';
    res.on('data', function (data) {
        body += data;
    });
    res.on('end', function() {
      console.log("NLM API Response: " + body);
      var card = cardCallback(drugs,body);
      responseCallback(card);
    });
  }).on('error', function(e) {
    console.error("ERROR: " + e);
    interactions.push(e);
  });
}

module.exports = {
  getCard: getCard,
  getInteractions: getInteractions,
  getEntry: getEntry,
  getMedications: getMedications
};
