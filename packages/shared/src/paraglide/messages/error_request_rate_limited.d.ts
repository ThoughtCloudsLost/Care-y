/**
* | output |
* | --- |
* | "Too many requests. Try again later." |
*
* @param {Error_Request_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_request_rate_limited: ((inputs?: Error_Request_Rate_LimitedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Request_Rate_LimitedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Request_Rate_LimitedInputs = {};
