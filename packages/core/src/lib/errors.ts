export enum QuartzErrorCode {
  CACHE_PROVIDER_NOT_FOUND = "CACHE_PROVIDER_NOT_FOUND",
  CACHE_PROVIDER_NOT_REGISTERED = "CACHE_PROVIDER_NOT_REGISTERED",
  MAX_CONNCETIONS_EXCEEDED = "MAX_CONNCETIONS_EXCEEDED",
  CONNECTION_FAILED = "CONNECTION_FAILED",
  COMMAND_REGISTRATION_FAILED = "COMMAND_REGISTRATION_FAILED",
  PLUGIN_ALREADY_REGISTERED = "PLUGIN_ALREADY_REGISTERED",
  INVALID_EVENT_DATA = "INVALID_EVENT_DATA",
}

export const errorMessages: Record<QuartzErrorCode, string> = {
  [QuartzErrorCode.CACHE_PROVIDER_NOT_FOUND]:
    "Unknown cache provider {providerName}",
  [QuartzErrorCode.CACHE_PROVIDER_NOT_REGISTERED]:
    "Cache provider {providerName} not registered",
  [QuartzErrorCode.MAX_CONNCETIONS_EXCEEDED]:
    "Max connections exceeded with adapter {adapterName}",
  [QuartzErrorCode.CONNECTION_FAILED]:
    "Connection failed with adapter {adapterName}",
  [QuartzErrorCode.COMMAND_REGISTRATION_FAILED]: "Unable to register the commmands {reason}",
  [QuartzErrorCode.PLUGIN_ALREADY_REGISTERED]: "Plugin {pluginName} already registered",
  [QuartzErrorCode.INVALID_EVENT_DATA]: "{eventName} event data is missing required fields",
};

export class QuartzError extends Error {
  constructor(
    public code: QuartzErrorCode,
    details: Record<string, string>,
    options?: { cause?: unknown }
  ) {
    const template = errorMessages[code] || "Unknown error";
    const message = template.replace(
      /\{(\w+)\}/g,
      (_, key) => details?.[key] ?? `{${key}}`
    );
    super(`[${code}] ${message}`, { cause: options?.cause });

    this.name = "QuartzError";
  }
}

export function createQuartzError(
  code: QuartzErrorCode,
  details: Record<string, string>,
  options?: { cause?: unknown }
): QuartzError {
  return new QuartzError(code, details, options);
}
