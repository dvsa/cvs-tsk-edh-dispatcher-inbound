// @ts-ignore
import * as yml from "node-yaml";
import { ISecretConfig, ITargetConfig } from "../models";
import SecretsManager, { GetSecretValueRequest, GetSecretValueResponse } from "aws-sdk/clients/secretsmanager";
import * as AWSXray from "aws-xray-sdk";
import { ERROR } from "../models/enums";
import { safeLoad } from "js-yaml";

/**
 * Helper class for retrieving project configuration
 */
class Configuration {

    private static instance: Configuration;
    private readonly config: any;
    private secretConfig: any;
    private secretsClient: SecretsManager;

    private constructor(configPath: string) {
        this.config = yml.readSync(configPath);
        this.secretsClient = AWSXray.captureAWSClient(new SecretsManager({ region: "eu-west-1" })) as SecretsManager;

        // Replace environment variable references
        let stringifiedConfig: string = JSON.stringify(this.config);
        const envRegex: RegExp = /\${(\w+\b):?(\w+\b)?}/g;
        const matches: RegExpMatchArray | null = stringifiedConfig.match(envRegex);

        if (matches) {
            matches.forEach((match: string) => {
                envRegex.lastIndex = 0;
                const captureGroups: RegExpExecArray = envRegex.exec(match) as RegExpExecArray;

                // Insert the environment variable if available. If not, insert placeholder. If no placeholder, leave it as is.
                stringifiedConfig = stringifiedConfig.replace(match, (process.env[captureGroups[1]] || captureGroups[2] || captureGroups[1]));
            });
        }

        this.config = JSON.parse(stringifiedConfig);
    }

    /**
     * Retrieves the singleton instance of Configuration
     * @returns Configuration
     */
    public static getInstance(): Configuration {
        if (!this.instance) {
            this.instance = new Configuration("../config/config.yml");
        }

        return Configuration.instance;
    }

    /**
     * Retrieves the entire config as an object
     * @returns any
     */
    public getConfig(): any {
        return this.config;
    }

    /**
     * Retrieves the Targets config
     * @returns ITargetConfig[]
     */
    public getTargets(): ITargetConfig {
        return this.config.targets;
    }

    /**
     * Retrieves the Secrets config
     * @returns ISecretConfig
     */
    public async getSecretConfig(): Promise<ISecretConfig> {
        if (!this.secretConfig) {
            this.secretConfig = await this.setSecrets();
        }
        return this.secretConfig;
    }

    /**
     * Reads the secret yaml file from SecretManager or local file.
     */
    private async setSecrets(): Promise<ISecretConfig> {
        if (process.env.SECRET_NAME) {
            const req: GetSecretValueRequest = {
                SecretId: process.env.SECRET_NAME
            };
            const resp: GetSecretValueResponse = await this.secretsClient.getSecretValue(req).promise();
            try {
                return await safeLoad(resp.SecretString as string);
            } catch (e) {
                throw new Error(ERROR.SECRET_STRING_EMPTY);
            }
        } else {
            console.warn(ERROR.SECRET_ENV_VAR_NOT_SET);
            throw new Error(ERROR.SECRET_ENV_VAR_NOT_SET);
        }
    }
}

export { Configuration };
