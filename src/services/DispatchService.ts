import {Configuration} from "../utils/Configuration";
import {ERROR, EVENT_TYPE} from "../models/enums";
import {IBody, ILambdaEvent, IStreamRecord, ITarget} from "../models";
import {LambdaService} from "./LambdaService";
import {SQService} from "./SQService";
import {debugOnlyLog, getTargetFromSourceARN} from "../utils/Utils";

/**
 * Service class for interfacing with the Simple Queue Service
 */
class DispatchService {
    private readonly config: any;
    private dao: LambdaService;
    private sqs: SQService;

    /**
     * Constructor for the ActivityService class
     * @param dao
     * @param sqs SQService for sending things to the DLQ
     */
    constructor(dao: LambdaService, sqs: SQService) {
        this.config = Configuration.getInstance().getConfig();
        this.dao = dao;
        this.sqs = sqs;
    }

    public processEvent(record: IStreamRecord) {
        console.log("processEvent record:", record);
        const target: ITarget = getTargetFromSourceARN(record.eventSourceARN);
        const eventPayload: IBody = JSON.parse(record.body);
        console.log("eventPayload: ", eventPayload);
        debugOnlyLog("eventPayload: ", eventPayload);

        const eventType = eventPayload.changeType; //INSERT, MODIFY or REMOVE

        switch (eventType) {
            case EVENT_TYPE.CREATE:
                return this.sendPost(eventPayload,target);
            case EVENT_TYPE.UPDATE:
                return this.sendPut(eventPayload, target);
            case EVENT_TYPE.DELETE:
                return this.sendDelete(eventPayload, target);
            default:
                console.error(ERROR.NO_HANDLER_METHOD);
                return this.sendRecordToDLQ(eventPayload, target);
        }
    }

    private async sendPost(event: IBody, target: ITarget): Promise<any> {
        const path = this.processPath(target.endpoints.POST, event);
        const body = this.getMessageParams("POST", path, target, event);
        return await this.dao.invoke(target.lambdaName, body);
    }

    private async sendPut(event: IBody, target: ITarget): Promise<any> {
        const path = this.processPath(target.endpoints.PUT, event);
        const body = this.getMessageParams("PUT", path, target, event);
        return await this.dao.invoke(target.lambdaName, body);
    }

    private async sendDelete(event: IBody, target: ITarget): Promise<any> {
        const path = this.processPath(target.endpoints.DELETE, event);
        const body = this.getMessageParams("DELETE", path, target, event);
        return await this.dao.invoke(target.lambdaName, body);
    }

    public processPath(path: string, event: any) {
        const replaceRegex: RegExp = /{(\w+\b):?(\w+\b)?}/g;
        const matches: RegExpMatchArray | null = path.match(replaceRegex);
        if (matches) {
            matches.forEach((match: string) => {
                const replVal = event.key;
                path = path.replace(match, replVal);
            });
        }
        console.log("Processed path: ", path);
        return path;
    }

    private getMessageParams = (method: string, path: string, target: ITarget, event: any ) => {
        const params: ILambdaEvent = {
            httpMethod: method,
            path: path,
            headers: {
                "X-Amzn-Trace-Id": process.env._X_AMZN_TRACE_ID
            },
            pathParameters: {
                [target.targetKey]: event.key
            },
            isBase64Encoded: false
        };
        if (method !== "DELETE") {
            params.body = JSON.stringify(event.body);
        }
        return params;
    };

    // public isRetryableError(error: AWSError): boolean {
    //     return !(error.statusCode >= 400 && error.statusCode < 429);
    // }

    public async sendRecordToDLQ(event: IBody, target: ITarget) {
        try {
            await this.sqs.sendMessage(JSON.stringify(event), target.dlQueue);
            return Promise.resolve();
        } catch (e) {
            console.log("Failed to send message to DLQ. ERROR: ", e, " and EVENT: ", event)
            debugOnlyLog("Failed to send message to DLQ. ERROR: ", e, " and EVENT: ", event)
            return Promise.reject()
        }
    }
}

export {DispatchService};
