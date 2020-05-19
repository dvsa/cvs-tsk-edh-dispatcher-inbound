export enum ERROR {
  NO_UNIQUE_TARGET = "Unable to determine unique target",
  NO_SQS_CONFIG = "SQS config is not defined in the config file.",
  SECRET_STRING_EMPTY = "SecretString is empty.",
  SECRET_ENV_VAR_NOT_SET = "SECRET_NAME environment variable not set.",
  NO_HANDLER_METHOD = "Unable to find relevant handler method",
  FAILED_TO_SEND = "Failed to send"
}

export enum EVENT_TYPE {
  UPDATE = "UPDATE",
  CREATE = "CREATE",
  DELETE = "DELETE"
}
