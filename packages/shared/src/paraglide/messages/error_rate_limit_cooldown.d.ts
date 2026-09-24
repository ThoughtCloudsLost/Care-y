/**
* | output |
* | --- |
* | "Please wait before requesting another code." |
*
* @param {Error_Rate_Limit_CooldownInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_rate_limit_cooldown: ((inputs?: Error_Rate_Limit_CooldownInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Rate_Limit_CooldownInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Rate_Limit_CooldownInputs = {};
