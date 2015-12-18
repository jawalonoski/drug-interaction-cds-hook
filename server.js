var http = require('http');
var url = require('url');
var DrugInteractions = require('./druginteractions');

function writeHeaders(res) {
  res.writeHead(200,{
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET, POST'
  });
}

function finish(res) {

}

http.createServer(function (req, res) {
  console.log('======================================');
  console.log(req.method + " " + req.url);
  console.log(req.headers);
  if(req.method=='OPTIONS') {
    writeHeaders(res);
    res.end();
  } else if(req.method=='POST') {
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
      console.log('--------------------------------------');
      console.log(body);
      console.log('--------------------------------------');
      var params = JSON.parse(body);
      var medications = DrugInteractions.getMedications(params);
      console.log("Current Medications: " + medications);

      DrugInteractions.getInteractions(medications,DrugInteractions.getCard,function(card){
        console.log(JSON.stringify(card));
        writeHeaders(res);
        res.end(JSON.stringify(card));
      });
    });
  } else {
    // GET
    var queryData = url.parse(req.url, true).query;
    var value = null;
    var drugs = queryData.drugs.split(",");

    console.log("Current Medications: " + drugs);
    
    DrugInteractions.getInteractions(medications,DrugInteractions.getCard,function(card){
      console.log(JSON.stringify(card));
      writeHeaders(res);
      res.end(JSON.stringify(card));
    });
  }
}).listen(3001);
console.log('Server running at http://localhost:3001');
