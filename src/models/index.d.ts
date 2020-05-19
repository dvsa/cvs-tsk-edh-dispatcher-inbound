export interface IEvent {
  Records: IStreamRecord[];
}

export interface IStreamRecord {
  body: string;
  eventSourceARN: string;
}

export interface IBody {
  changeType: string;
  key: string;
  body: any;
}

export interface ITarget {
  queue: string;
  dlQueue: string;
  lambdaName: string;
  targetKey: string;
  endpoints: {
    POST: string;
    PUT: string;
    DELETE: string;
  }
}

export interface ITargetConfig {
  [target: string]: ITarget
}

export interface ISecretConfig {
  baseUrl: string;
  apiKey: string;
  host: string;
  debugMode?: string | boolean;
  validation?: string | boolean;
}

export interface ILambdaEvent {
  httpMethod: string,
  path: string,
  headers: {
    "X-Amzn-Trace-Id": string | undefined
  },
  pathParameters?: {
    [key: string]: string
  },
  isBase64Encoded: boolean,
  body?: string
}
