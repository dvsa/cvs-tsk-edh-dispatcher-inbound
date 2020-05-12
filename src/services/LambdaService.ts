import {validateInvocationResponse} from "../utils/validateInvocationResponse";
/* tslint:disable */
let AWS:any;
if (process.env._X_AMZN_TRACE_ID) {
  AWS = require("aws-xray-sdk").captureAWS(require("aws-sdk"));
} else {
  console.log("Serverless Offline detected; skipping AWS X-Ray setup")
  AWS = require("aws-sdk");
}
/* tslint:enable */

export class LambdaService {
  private lambda: any;

  constructor() {
    this.lambda = new AWS.Lambda();
  }

  public invoke(lambdaName: any, lambdaEvent: any) {
    return this.lambda.invoke({
      FunctionName: lambdaName,
      InvocationType: "RequestResponse",
      Payload: JSON.stringify(lambdaEvent)
    });
  }
}
