/**
* | output |
* | --- |
* | "Too many codes requested. Please try again later." |
*
* @param {Error_Rate_Limit_HourlyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_rate_limit_hourly: ((inputs?: Error_Rate_Limit_HourlyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Rate_Limit_HourlyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Rate_Limit_HourlyInputs = {};
