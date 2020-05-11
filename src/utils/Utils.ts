/**
 * Utils functions
 */
import {Configuration} from "./Configuration";
import {ERROR} from "../models/enums";
import {ITarget, ITargetConfig} from "../models";

export const getTargetFromSourceARN = (arn: string) => {
    const targets: ITargetConfig = Configuration.getInstance().getTargets();
    console.log("getTargetFromSourceARN input: ", arn)
    debugOnlyLog("targets: ", targets);
    const validTargets = Object.values(targets).filter((target: ITarget) => arn.includes(target.queue));
    if (validTargets.length !== 1) {
        debugOnlyLog("valid targets: ", validTargets);
        throw new Error(ERROR.NO_UNIQUE_TARGET);
    }
    debugOnlyLog("Target: ", validTargets);
    return validTargets[0];
};

export const debugOnlyLog = (...args: any) => {
    if(process.env.DEBUG === "TRUE") {
        console.log(...args);
    }
}
