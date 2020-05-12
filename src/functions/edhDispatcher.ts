import {Callback, Context, Handler} from "aws-lambda";
import {AWSError, SQS} from "aws-sdk";
import {DispatchService} from "../services/DispatchService";
import {PromiseResult} from "aws-sdk/lib/request";
import {SendMessageResult} from "aws-sdk/clients/sqs";
import {IEvent} from "../models";
import {LambdaService} from "../services/LambdaService";
import {SQService} from "../services/SQService";
import {debugOnlyLog} from "../utils/Utils";

/**
 * λ function to process a DynamoDB stream of test results into a queue for certificate generation.
 * @param event - DynamoDB Stream event
 * @param context - λ Context
 * @param callback - callback function
 */
const edhDispatcher: Handler = async (event: IEvent, context?: Context, callback?: Callback): Promise<void | Array<PromiseResult<SendMessageResult, AWSError>>> => {
    if (!event) {
        console.error("ERROR: event is not defined.");
        return;
    }
    console.log("Event: ", event);

    // Instantiate the Simple Queue Service
    const dispatchService: DispatchService = new DispatchService(new LambdaService(), new SQService(new SQS()));

    // Only ever getting one event at a time
    const record = event.Records[0];
    let response = await dispatchService.processEvent(record).then((resp) => {
        if (resp.FunctionError) {
            console.error(resp);
            throw new Error(resp.Payload);
        }
        return resp;
    });
    console.log("Response: ", response);
    debugOnlyLog("Response: ", response);
    return response
};

export {edhDispatcher};
