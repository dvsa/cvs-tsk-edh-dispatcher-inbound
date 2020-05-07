import {Callback, Context, Handler} from "aws-lambda";
import {AWSError, SQS} from "aws-sdk";
import {DispatchService} from "../services/DispatchService";
import {PromiseResult} from "aws-sdk/lib/request";
import {SendMessageResult} from "aws-sdk/clients/sqs";
import {GetRecordsOutput} from "aws-sdk/clients/dynamodbstreams";
import {IStreamRecord} from "../models";
import {LambdaService} from "../services/LambdaService";
import {SQService} from "../services/SQService";
import {debugOnlyLog} from "../utils/Utils";

/**
 * λ function to process a DynamoDB stream of test results into a queue for certificate generation.
 * @param event - DynamoDB Stream event
 * @param context - λ Context
 * @param callback - callback function
 */
const edhDispatcher: Handler = async (event: GetRecordsOutput, context?: Context, callback?: Callback): Promise<void | Array<PromiseResult<SendMessageResult, AWSError>>> => {
    if (!event) {
        console.error("ERROR: event is not defined.");
        return;
    }
    debugOnlyLog("Event: ", event);

    const records = event.Records as IStreamRecord[];
    if (!records || !records.length) {
        console.error("ERROR: No Records in event: ", event);
        return;
    }

    // Instantiate the Simple Queue Service
    const dispatchService: DispatchService = new DispatchService(new LambdaService(), new SQService(new SQS()));
    const sentMessagePromises: Array<Promise<any>> = [];
    debugOnlyLog("Records: ", records);

    records.forEach((record: IStreamRecord) => {
        debugOnlyLog("Record: ", record);
        const call = dispatchService.processEvent(record);
        sentMessagePromises.push(call);
    });

    let promises = await Promise.all(sentMessagePromises);
    debugOnlyLog("Response: ", promises);
    return promises
};

export {edhDispatcher};
