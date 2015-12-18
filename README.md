# drug-interaction-cds-hook

Demonstration of implementing a SMART-on-FHIR [`$cds-hook`](https://github.com/jmandel/cds-hooks/wiki)
for drug-drug interactions using an AWS Lambda function.

:warning:
**This service is for demonstration purposes only and shall not be used for real world clinical decision support!**
:warning:

## Requirements, Assumptions, & Dependencies

The pre-fetch template for this hook requires `MedicationOrder` resources
with `RxNorm` codes. This service could, but does **not** currently, examine
`MedicationDispense`, `MedicationAdministration`, or `MedicationStatement` resources.
This service uses the [National Library of Medicine Interaction
RESTful API](https://rxnav.nlm.nih.gov/InteractionAPIREST.html#uLink=Interaction_REST_findDrugInteractions)
to determine drug-drug interactions.

## Running in Node.js

Start the Server

      node server.js

Post the contents of `sample.request.json` to `http://localhost:3001`

      curl -i -X POST -d @sample.request.json http://localhost:3001

## Demonstration on AWS Lambda

      curl -i -X POST -d @sample.request.json https://d1fwjs99ve.execute-api.us-east-1.amazonaws.com/prod/drug-interaction-cds-hook

## License

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this software except in compliance with the License.

You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
